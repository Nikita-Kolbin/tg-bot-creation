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
	GetActiveBots(ctx context.Context) ([]*model.Bot, error)
	GetBotTgOffset(ctx context.Context, botID int) (int, error)
	UpdateBotTgOffset(ctx context.Context, botID int, newOffset int) error
	IsBotOwner(ctx context.Context, botID int, userID int) (bool, error)

	UpdateScenario(ctx context.Context, botID int, steps []*model.Step, buttons []*model.Button) error
	GetScenarioByBotID(ctx context.Context, botID int) ([]*model.Step, map[string]*model.Button, error)
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
