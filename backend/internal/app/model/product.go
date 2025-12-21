package model

import "time"

type Product struct {
	ID          int       `db:"id" json:"id"`
	BotID       int64     `db:"bot_id" json:"bot_id"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	PictureURLs []string  `db:"picture_urls" json:"picture_urls"`
	PreviewURL  string    `db:"preview_url" json:"preview_url"`
	Price       int       `db:"price" json:"price"`
	Active      bool      `db:"active" json:"active"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}
