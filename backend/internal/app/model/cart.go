package model

import "time"

type CartItem struct {
	ID        int       `db:"id" json:"id"`
	BotID     int64     `db:"bot_id" json:"bot_id"`
	Username  string    `db:"username" json:"username"`
	ProductID int       `db:"product_id" json:"product_id"`
	Quantity  int       `db:"quantity" json:"quantity"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`

	// Данные товара (JOIN)
	ProductName    string  `db:"name" json:"product_name"`
	ProductDesc    string  `db:"description" json:"product_description"`
	ProductPreview *string `db:"preview_url" json:"product_preview_url"`
	ProductPrice   int     `db:"price" json:"product_price"`
	ProductActive  bool    `db:"active" json:"product_active"`
}
