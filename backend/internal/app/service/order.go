package service

import (
	"context"
	"fmt"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"strings"
)

func (s *Service) CreateOrderFromCart(ctx context.Context, botID int64, username string) error {
	orderItems, err := s.repo.CreateOrderFromCart(ctx, botID, username)
	if err != nil {
		return err
	}

	var message strings.Builder
	totalAmount := 0
	message.WriteString(fmt.Sprintf("✅ Вы совершили заказ на сумму %d ₽\n\n", totalAmount/100))
	message.WriteString("📋 Содержимое заказа:\n\n")

	for i, item := range orderItems {
		itemTotal := item.PriceAtPurchase * item.Quantity
		totalAmount += itemTotal
		message.WriteString(fmt.Sprintf(
			"%d) %s — %d шт (%.2f ₽/шт) = %d ₽\n",
			i+1, item.ProductName, item.Quantity,
			float64(item.PriceAtPurchase)/100, itemTotal/100,
		))
	}

	message.WriteString(fmt.Sprintf("\n💰 Итого: %d ₽", totalAmount/100))

	// TODO: сделать смску в телегу о заказе (нужно получить токен и чат айди)
	_ = message.String()

	return nil
}

func (s *Service) GetUserOrders(ctx context.Context, botID int64, username string) ([]*model.OrderWithItems, error) {
	return s.repo.GetUserOrders(ctx, botID, username)
}

func (s *Service) GetBotOrders(ctx context.Context, botID int64) ([]*model.OrderWithItems, error) {
	return s.repo.GetBotOrders(ctx, botID)
}
