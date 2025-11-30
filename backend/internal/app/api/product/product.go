package product

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

type Service interface {
	CreateProduct(ctx context.Context, product *model.Product) (*model.Product, error)
	UpdateProduct(ctx context.Context, product *model.Product) error
	DeleteProduct(ctx context.Context, productID int) error
	GetProductsByBot(ctx context.Context, botID int64) ([]*model.Product, error)
	GetProductByID(ctx context.Context, productID int) (*model.Product, error)

	IsBotOwner(ctx context.Context, botID int, userID int) (bool, error)
}

type Product struct {
	srv Service
}

func NewAPI(srv Service) *Product {
	return &Product{
		srv: srv,
	}
}
