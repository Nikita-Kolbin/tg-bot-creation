package model

import (
	"time"
)

const (
	BotStatusActive      = "active"
	BotStatusInactive    = "inactive"
	BotStatusMaintenance = "maintenance"
)

type Bot struct {
	ID          int       `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	Token       string    `db:"token" json:"token"`
	Status      string    `db:"status" json:"status"`
	OwnerUserID int       `db:"owner_user_id" json:"owner_user_id"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}

type Step struct {
	ID          int       `db:"id" json:"id"`
	Number      int       `db:"number" json:"number"`
	BotID       int       `db:"bot_id" json:"bot_id"`
	Text        string    `db:"text" json:"text"`
	CoordX      int16     `db:"coord_x" json:"coord_x"`
	CoordY      int16     `db:"coord_y" json:"coord_y"`
	ButtonUUIDs []string  `db:"button_uuids" json:"button_uuids"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}

type Button struct {
	UUID      string    `db:"uuid" json:"uuid"`
	Text      string    `db:"text" json:"text"`
	NextStep  int       `db:"next_step" json:"next_step"`
	BotID     int       `db:"bot_id" json:"bot_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type TgUserStep struct {
	ID        int       `db:"id" json:"id"`
	Username  string    `db:"username" json:"username"`
	Number    int       `db:"number" json:"number"`
	BotID     int       `db:"bot_id" json:"bot_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}
