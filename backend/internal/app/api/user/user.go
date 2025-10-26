package user

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

type Service interface {
	GetJWTSecret() string
	CreateUser(ctx context.Context, username, password string) (*model.User, error)
	GetUser(ctx context.Context, username, password string) (*model.User, error)
}

type User struct {
	srv Service
}

func NewAPI(srv Service) *User {
	return &User{
		srv: srv,
	}
}
