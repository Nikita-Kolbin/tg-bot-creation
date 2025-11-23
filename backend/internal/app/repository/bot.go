package repository

import (
	"context"
	"github.com/lib/pq"

	"database/sql"
	sq "github.com/Masterminds/squirrel"
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

func (r *Repository) UpdateScenario(ctx context.Context, botID int, steps []*model.Step, buttons []*model.Button) error {
	tx, err := r.conn.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	err = r.deleteScenario(ctx, botID, tx)
	if err != nil {
		return err
	}

	err = r.createSteps(ctx, steps, tx)
	if err != nil {
		return err
	}

	err = r.createButtons(ctx, buttons, tx)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *Repository) deleteScenario(ctx context.Context, botID int, tx *sql.Tx) error {
	buttonsQuery := `DELETE FROM buttons WHERE bot_id = $1`
	_, err := tx.ExecContext(ctx, buttonsQuery, botID)
	if err != nil {
		return err
	}

	stepsQuery := `DELETE FROM steps WHERE bot_id = $1`
	_, err = tx.ExecContext(ctx, stepsQuery, botID)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) createSteps(ctx context.Context, steps []*model.Step, tx *sql.Tx) error {
	if len(steps) == 0 {
		return nil
	}

	queryBuilder := sq.Insert("steps").
		Columns("number", "bot_id", "text", "coord_x", "coord_y", "button_uuids")

	for _, step := range steps {
		queryBuilder = queryBuilder.Values(
			step.Number,
			step.BotID,
			step.Text,
			step.CoordX,
			step.CoordY,
			step.ButtonUUIDs,
		)
	}

	query, args, err := queryBuilder.PlaceholderFormat(sq.Dollar).ToSql()
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) createButtons(ctx context.Context, buttons []*model.Button, tx *sql.Tx) error {
	if len(buttons) == 0 {
		return nil
	}

	queryBuilder := sq.Insert("buttons").Columns("uuid", "text", "next_step", "bot_id")

	for _, btn := range buttons {
		queryBuilder = queryBuilder.Values(btn.UUID, btn.Text, btn.NextStep, btn.BotID)
	}

	query, args, err := queryBuilder.PlaceholderFormat(sq.Dollar).ToSql()
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetScenarioByBotID(ctx context.Context, botID int) ([]*model.Step, map[string]*model.Button, error) {
	stepsQuery := `
        SELECT id, number, bot_id, text, coord_x, coord_y, button_uuids, created_at, updated_at
        FROM steps
        WHERE bot_id = $1
        ORDER BY number
    `

	rows, err := r.conn.QueryContext(ctx, stepsQuery, botID)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var steps []*model.Step
	for rows.Next() {
		var s model.Step

		err = rows.Scan(&s.ID, &s.Number, &s.BotID, &s.Text, &s.CoordX, &s.CoordY, pq.Array(&s.ButtonUUIDs), &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			return nil, nil, err
		}

		steps = append(steps, &s)
	}
	if err = rows.Err(); err != nil {
		return nil, nil, err
	}

	buttonsQuery := `
        SELECT uuid AS uuid, text, next_step, bot_id, created_at, updated_at
        FROM buttons
        WHERE bot_id = $1
    `

	buttons := make([]*model.Button, 0)
	buttonsMap := make(map[string]*model.Button)
	err = r.conn.SelectContext(ctx, &buttons, buttonsQuery, botID)
	if err != nil {
		return nil, nil, err
	}

	for _, btn := range buttons {
		buttonsMap[btn.UUID] = btn
	}

	return steps, buttonsMap, nil
}

func (r *Repository) IsBotOwner(ctx context.Context, botID int, userID int) (bool, error) {
	var ownerID int
	query := `SELECT owner_user_id FROM bots WHERE id = $1`
	err := r.conn.GetContext(ctx, &ownerID, query, botID)
	if err != nil {
		return false, err
	}
	return ownerID == userID, nil
}

func (r *Repository) UpsertTgUserStep(ctx context.Context, step *model.TgUserStep) error {
	query := `
        INSERT INTO tg_user_steps (username, number, bot_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (username, bot_id) 
        DO UPDATE SET number = EXCLUDED.number, updated_at = NOW()
    `

	_, err := r.conn.ExecContext(ctx, query, step.Username, step.Number, step.BotID)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetCurrentStepNumber(ctx context.Context, username string, botID int) (int, error) {
	query := `
        SELECT number
        FROM tg_user_steps
        WHERE username = $1 AND bot_id = $2
        LIMIT 1
    `

	var number int
	err := r.conn.GetContext(ctx, &number, query, username, botID)
	if err != nil {
		return 0, err
	}

	return number, nil
}

func (r *Repository) GetStepWithButtonsMap(ctx context.Context, botID int, number int) (*model.Step, map[string]*model.Button, error) {
	stepQuery := `
        SELECT id, number, bot_id, text, coord_x, coord_y, button_uuids, created_at, updated_at
        FROM steps
        WHERE bot_id = $1 AND number = $2
        LIMIT 1
    `
	var step model.Step
	err := r.conn.QueryRowContext(ctx, stepQuery, botID, number).Scan(
		&step.ID,
		&step.Number,
		&step.BotID,
		&step.Text,
		&step.CoordX,
		&step.CoordY,
		pq.Array(&step.ButtonUUIDs),
		&step.CreatedAt,
		&step.UpdatedAt,
	)
	if err != nil {
		return nil, nil, err
	}

	buttonsMap := make(map[string]*model.Button)
	if len(step.ButtonUUIDs) == 0 {
		return &step, buttonsMap, nil
	}

	buttonsQuery := `
        SELECT uuid, text, next_step, bot_id, created_at, updated_at
        FROM buttons
        WHERE bot_id = $1 AND uuid = ANY($2)
    `
	buttons := []*model.Button{}
	err = r.conn.SelectContext(ctx, &buttons, buttonsQuery, botID, pq.Array(step.ButtonUUIDs))
	if err != nil {
		return nil, nil, err
	}

	for _, btn := range buttons {
		buttonsMap[btn.UUID] = btn
	}

	return &step, buttonsMap, nil
}
