package service

import (
	"context"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

func (s *Service) UpsertCartItem(ctx context.Context, botID int64, username string, productID int, quantity int) error {
	return s.repo.UpsertCartItem(ctx, botID, username, productID, quantity)
}

func (s *Service) GetCartItems(ctx context.Context, botID int64, username string) ([]*model.CartItem, error) {
	return s.repo.GetCartItems(ctx, botID, username)
}
