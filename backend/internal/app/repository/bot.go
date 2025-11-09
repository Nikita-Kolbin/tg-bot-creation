package repository

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

func (r *Repository) CreateBot(ctx context.Context, bot *model.Bot) (*model.Bot, error) {
	query := `
    INSERT INTO bots (name, description, token, status, owner_user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, description, token, status, owner_user_id, created_at, updated_at`

	createdBot := &model.Bot{}
	err := r.conn.GetContext(ctx, createdBot, query,
		bot.Name,
		bot.Description,
		bot.Token,
		model.BotStatusActive, // TODO: поменять на неактивный при первом создании
		bot.OwnerUserID,
	)
	if isSQLError(err, model.UniqueConstraintViolationCode) {
		return createdBot, model.ErrTokenRegistered
	}
	if err != nil {
		return nil, err
	}

	return createdBot, nil
}

func (r *Repository) GetActiveBots(ctx context.Context) ([]*model.Bot, error) {
	query := `
    SELECT id, name, description, token, status, owner_user_id, created_at, updated_at
    FROM bots WHERE status = 'active'`

	var bots []*model.Bot
	err := r.conn.SelectContext(ctx, &bots, query)
	if err != nil {
		return nil, err
	}

	return bots, nil
}

func (r *Repository) GetBotTgOffset(ctx context.Context, botID int) (int, error) {
	var offset int
	query := `SELECT tg_offset FROM bots WHERE id = $1`
	err := r.conn.GetContext(ctx, &offset, query, botID)
	if err != nil {
		return 0, err
	}
	return offset, nil
}

func (r *Repository) UpdateBotTgOffset(ctx context.Context, botID int, newOffset int) error {
	query := `UPDATE bots SET tg_offset = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.conn.ExecContext(ctx, query, newOffset, botID)
	return err
}
