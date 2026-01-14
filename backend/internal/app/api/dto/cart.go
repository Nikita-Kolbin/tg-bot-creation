package dto

import (
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"time"
)

type AddToCartRequest struct {
	Username string `json:"username"`
	Quantity int    `json:"quantity"`
}

type CartResponse struct {
	Items []*CartItemResponse `json:"items"`
}

type CartItemResponse struct {
	ID             int     `json:"id"`
	ProductID      int     `json:"product_id"`
	ProductName    string  `json:"product_name"`
	ProductDesc    string  `json:"product_description"`
	ProductPreview *string `json:"product_preview_url"`
	ProductPrice   int     `json:"product_price"`
	Quantity       int     `json:"quantity"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

func CartItemToResponse(item *model.CartItem) *CartItemResponse {
	return &CartItemResponse{
		ID:             item.ID,
		ProductID:      item.ProductID,
		ProductName:    item.ProductName,
		ProductDesc:    item.ProductDesc,
		ProductPreview: item.ProductPreview,
		ProductPrice:   item.ProductPrice,
		Quantity:       item.Quantity,
		CreatedAt:      item.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      item.UpdatedAt.Format(time.RFC3339),
	}
}
