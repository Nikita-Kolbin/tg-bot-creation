package bot

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

type Service interface {
	CreateBot(ctx context.Context, bot *model.Bot) (*model.Bot, error)
}

type Bot struct {
	srv Service
}

func NewAPI(srv Service) *Bot {
	return &Bot{
		srv: srv,
	}
}
