package service

import (
	"context"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

func (s *Service) CreateProduct(ctx context.Context, product *model.Product) (*model.Product, error) {
	return s.repo.CreateProduct(ctx, product)
}

func (s *Service) UpdateProduct(ctx context.Context, product *model.Product) error {
	return s.repo.UpdateProduct(ctx, product)
}

func (s *Service) DeleteProduct(ctx context.Context, productID int) error {
	return s.repo.DeleteProduct(ctx, productID)
}

func (s *Service) GetProductsByBot(ctx context.Context, botID int64, onlyActive bool) ([]*model.Product, error) {
	return s.repo.GetProductsByBot(ctx, botID, onlyActive)
}

func (s *Service) GetProductByID(ctx context.Context, productID int) (*model.Product, error) {
	return s.repo.GetProductByID(ctx, productID)
}
