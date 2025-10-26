package service

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

func (s *Service) CreateUser(ctx context.Context, username, password string) (*model.User, error) {
	passwordHash := generatePasswordHash(password)

	return s.repo.CreateUser(ctx, username, passwordHash)
}

func (s *Service) GetUser(ctx context.Context, username, password string) (*model.User, error) {
	passwordHash := generatePasswordHash(password)

	return s.repo.GetUser(ctx, username, passwordHash)
}
