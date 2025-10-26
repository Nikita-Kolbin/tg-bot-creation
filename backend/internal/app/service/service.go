package service

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

type repository interface {
	CreateUser(ctx context.Context, username, passwordHash string) (*model.User, error)
	GetUser(ctx context.Context, username, passwordHash string) (*model.User, error)
}

type tgClient interface {
	// Methods
}

type Service struct {
	repo     repository
	tgClient tgClient

	jwtSecret string
}

func New(repo repository, tgCli tgClient, jwtSecret string) *Service {
	return &Service{
		repo:      repo,
		tgClient:  tgCli,
		jwtSecret: jwtSecret,
	}
}
