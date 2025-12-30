package bot

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

type Service interface {
	CreateBot(ctx context.Context, bot *model.Bot) (*model.Bot, error)
	UpdateBot(ctx context.Context, bot *model.Bot) error
	DeleteBot(ctx context.Context, botID int, ownerUserID int) error
	GetBotByID(ctx context.Context, botID int) (*model.Bot, error)
	IsBotOwner(ctx context.Context, botID int, userID int) (bool, error)
	GetUserBots(ctx context.Context, userID int) ([]*model.Bot, error)

	UpdateBotScenario(ctx context.Context, scenario *dto.SetBotScenarioRequest) error
	GetBotScenario(ctx context.Context, botID int) (*dto.GetBotScenarioResponse, error)
}

type Bot struct {
	serverHostPort string
	srv            Service
}

func NewAPI(srv Service, serverHostPort string) *Bot {
	return &Bot{
		srv:            srv,
		serverHostPort: serverHostPort,
	}
}
