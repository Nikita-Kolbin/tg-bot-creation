package service

import (
	"context"
	"sync"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

type repository interface {
	CreateUser(ctx context.Context, username, passwordHash string) (*model.User, error)
	GetUser(ctx context.Context, username, passwordHash string) (*model.User, error)

	CreateBot(ctx context.Context, bot *model.Bot) (*model.Bot, error)
	UpdateBot(ctx context.Context, bot *model.Bot) error
	DeleteBot(ctx context.Context, botID int, ownerUserID int) error
	GetBotByID(ctx context.Context, botID int) (*model.Bot, error)
	GetActiveBots(ctx context.Context) ([]*model.Bot, error)
	GetBotTgOffset(ctx context.Context, botID int) (int, error)
	UpdateBotTgOffset(ctx context.Context, botID int, newOffset int) error
	IsBotOwner(ctx context.Context, botID int, userID int) (bool, error)
	GetBotsByOwner(ctx context.Context, ownerUserID int) ([]*model.Bot, error)

	UpdateScenario(ctx context.Context, botID int, steps []*model.Step, buttons []*model.Button) error
	GetScenarioByBotID(ctx context.Context, botID int) ([]*model.Step, map[string]*model.Button, error)
	GetStepWithButtonsMap(ctx context.Context, botID int, number int) (*model.Step, map[string]*model.Button, error)

	UpsertTgUserStep(ctx context.Context, step *model.TgUserStep) error
	GetCurrentStepNumber(ctx context.Context, username string, botID int) (int, error)

	CreateProduct(ctx context.Context, product *model.Product) (*model.Product, error)
	UpdateProduct(ctx context.Context, product *model.Product) error
	DeleteProduct(ctx context.Context, productID int) error
	GetProductsByBot(ctx context.Context, botID int64, onlyActive bool) ([]*model.Product, error)
	GetProductByID(ctx context.Context, productID int) (*model.Product, error)

	UpsertCartItem(ctx context.Context, botID int64, username string, productID int, quantity int) error
	GetCartItems(ctx context.Context, botID int64, username string) ([]*model.CartItem, error)

	CreateOrderFromCart(ctx context.Context, botID int64, username string) ([]*model.OrderItemWithProduct, error)
	GetUserOrders(ctx context.Context, botID int64, username string) ([]*model.OrderWithItems, error)
	GetBotOrders(ctx context.Context, botID int64) ([]*model.OrderWithItems, error)
}

type tgClient interface {
	Updates(token string, offset, limit int) ([]*model.Update, error)
	Send(token string, chatID int, msg string, withFormat bool) (*model.Response, error)
	SendWithReplyKeyboard(token string, chatID int, msg string, keyboard *model.ReplyKeyboardMarkup, withFormat bool) (*model.Response, error)
}

type Service struct {
	repo     repository
	tgClient tgClient

	jwtSecret string

	activeBots   []*model.Bot
	activeBotsMU *sync.Mutex
}

func New(repo repository, tgCli tgClient, jwtSecret string) *Service {
	return &Service{
		repo:         repo,
		tgClient:     tgCli,
		jwtSecret:    jwtSecret,
		activeBots:   make([]*model.Bot, 0),
		activeBotsMU: &sync.Mutex{},
	}
}
