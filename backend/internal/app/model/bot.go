package model

import "time"

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
