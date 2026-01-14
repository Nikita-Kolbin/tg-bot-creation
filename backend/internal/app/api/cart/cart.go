package cart

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

type Service interface {
	UpsertCartItem(ctx context.Context, botID int64, username string, productID int, quantity int) error
	GetCartItems(ctx context.Context, botID int64, username string) ([]*model.CartItem, error)
}

type Cart struct {
	serverHostPort string
	srv            Service
}

func NewAPI(srv Service) *Cart {
	return &Cart{
		srv: srv,
	}
}
