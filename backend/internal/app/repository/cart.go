package repository

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

func (r *Repository) UpsertCartItem(ctx context.Context, botID int64, username string, productID int, quantity int) error {
	if quantity == 0 {
		// Удаляем запись если количество = 0
		query := `
            DELETE FROM cart_items 
            WHERE bot_id = $1 AND username = $2 AND product_id = $3
        `
		_, err := r.conn.ExecContext(ctx, query, botID, username, productID)
		return err
	}

	// UPSERT: добавляем или обновляем количество
	query := `
        INSERT INTO cart_items (bot_id, username, product_id, quantity)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (bot_id, username, product_id) 
        DO UPDATE SET 
            quantity = EXCLUDED.quantity, 
            updated_at = NOW()
    `

	_, err := r.conn.ExecContext(ctx, query, botID, username, productID, quantity)
	return err
}

// Получение всех товаров из корзины пользователя по bot_id и username
func (r *Repository) GetCartItems(ctx context.Context, botID int64, username string) ([]*model.CartItem, error) {
	query := `
        SELECT ci.id, ci.bot_id, ci.username, ci.product_id, ci.quantity, 
               ci.created_at, ci.updated_at,
               p.name, p.description, p.preview_url, p.price, p.active
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.bot_id = $1 AND ci.username = $2
        ORDER BY ci.created_at DESC
    `

	var cartItems []*model.CartItem
	err := r.conn.SelectContext(ctx, &cartItems, query, botID, username)
	if err != nil {
		return nil, err
	}
	return cartItems, nil
}
