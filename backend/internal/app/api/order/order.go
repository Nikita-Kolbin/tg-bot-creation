package order

import (
	"context"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

type Service interface {
	CreateOrderFromCart(ctx context.Context, botID int64, username string) error
	GetUserOrders(ctx context.Context, botID int64, username string) ([]*model.OrderWithItems, error)
	GetBotOrders(ctx context.Context, botID int64) ([]*model.OrderWithItems, error)

	IsBotOwner(ctx context.Context, botID int, userID int) (bool, error)
}

type Order struct {
	serverHostPort string
	srv            Service
}

func NewAPI(srv Service) *Order {
	return &Order{
		srv: srv,
	}
}
