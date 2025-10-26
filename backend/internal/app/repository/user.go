package repository

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

func (r *Repository) CreateUser(ctx context.Context, username, passwordHash string) (*model.User, error) {
	query := `
	INSERT INTO users (username, password_hash) VALUES ($1, $2)
    RETURNING id, username, email, password_hash, first_name, last_name, is_active, created_at, updated_at, last_login`

	user := &model.User{}
	err := r.conn.GetContext(ctx, user, query, username, passwordHash)
	if isSQLError(err, model.UniqueConstraintViolationCode) {
		return user, model.ErrUsernameRegistered
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *Repository) GetUser(ctx context.Context, username, passwordHash string) (*model.User, error) {
	// TODO: last_login сделать
	query := `
	SELECT id, username, email, password_hash, first_name, last_name, is_active, created_at, updated_at, last_login
	FROM users WHERE username = $1 AND password_hash = $2`

	user := &model.User{}
	err := r.conn.GetContext(ctx, user, query, username, passwordHash)
	if err != nil {
		return nil, err
	}

	return user, nil
}
