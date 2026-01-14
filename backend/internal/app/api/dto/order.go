package dto

import (
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"time"
)

type CreateOrderRequest struct {
	Username string `json:"username" validate:"required"`
}

type OrderItemResponse struct {
	ProductID       int    `json:"product_id"`
	ProductName     string `json:"product_name"`
	Quantity        int    `json:"quantity"`
	PriceAtPurchase int    `json:"price_at_purchase"`
}

type OrdersResponse struct {
	Orders []*OrderResponse `json:"orders"`
}

type OrderResponse struct {
	ID          int64                `json:"id"`
	Username    string               `json:"username"`
	TotalAmount int                  `json:"total_amount"`
	Status      string               `json:"status"`
	CreatedAt   string               `json:"created_at"`
	UpdatedAt   string               `json:"updated_at"`
	ItemsCount  int                  `json:"items_count"`
	Items       []*OrderItemResponse `json:"items"`
}

func OrderToResponse(order *model.OrderWithItems) *OrderResponse {
	items := make([]*OrderItemResponse, 0, len(order.Items))
	for _, item := range order.Items {
		items = append(items, &OrderItemResponse{
			ProductID:       item.ProductID,
			ProductName:     item.ProductName,
			Quantity:        item.Quantity,
			PriceAtPurchase: item.PriceAtPurchase,
		})
	}

	return &OrderResponse{
		ID:          order.ID,
		Username:    order.Username,
		TotalAmount: order.TotalAmount,
		Status:      order.Status,
		CreatedAt:   order.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   order.UpdatedAt.Format(time.RFC3339),
		ItemsCount:  order.ItemsCount,
		Items:       items,
	}
}
