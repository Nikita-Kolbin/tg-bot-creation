package model

import "time"

type OrderItemWithProduct struct {
	OrderID         int64  `db:"order_id" json:"order_id"`
	ProductID       int    `db:"product_id" json:"product_id"`
	Quantity        int    `db:"quantity" json:"quantity"`
	PriceAtPurchase int    `db:"price_at_purchase" json:"price_at_purchase"`
	ProductName     string `db:"product_name" json:"product_name"`
}

type OrderWithItems struct {
	ID          int64                   `db:"id" json:"id"`
	Username    string                  `db:"username" json:"username"`
	TotalAmount int                     `db:"total_amount" json:"total_amount"`
	Status      string                  `db:"status" json:"status"`
	CreatedAt   time.Time               `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time               `db:"updated_at" json:"updated_at"`
	ItemsCount  int                     `db:"items_count" json:"items_count"`
	Items       []*OrderItemWithProduct `json:"items"`
}
