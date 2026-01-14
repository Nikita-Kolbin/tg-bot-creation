package repository

import (
	"context"
	"database/sql"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"time"
)

func (r *Repository) CreateOrderFromCart(ctx context.Context, botID int64, username string) ([]*model.OrderItemWithProduct, error) {
	tx, err := r.conn.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// 1. Получаем товары из корзины
	cartQuery := `
    SELECT ci.id, ci.product_id, ci.quantity, p.price, p.name, p.description
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id AND p.active = true
    WHERE ci.bot_id = $1 AND ci.username = $2
`

	rows, err := tx.QueryContext(ctx, cartQuery, botID, username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	type cartItem struct {
		ID          int    `db:"id"`
		ProductID   int    `db:"product_id"`
		Quantity    int    `db:"quantity"`
		Price       int    `db:"price"`
		Name        string `db:"name"`
		Description string `db:"description"`
	}

	var cartItems []cartItem
	for rows.Next() {
		var item cartItem
		err := rows.Scan(
			&item.ID,
			&item.ProductID,
			&item.Quantity,
			&item.Price,
			&item.Name,
			&item.Description,
		)
		if err != nil {
			return nil, err
		}
		cartItems = append(cartItems, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(cartItems) == 0 {
		return nil, sql.ErrNoRows
	}

	// 2. Вычисляем общую сумму
	var totalAmount int
	for _, item := range cartItems {
		totalAmount += item.Price * item.Quantity
	}

	// 3. Создаем заказ
	orderQuery := `
        INSERT INTO orders (bot_id, username, total_amount, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING id
    `

	var orderID int64
	err = tx.QueryRowContext(ctx, orderQuery, botID, username, totalAmount).Scan(&orderID)
	if err != nil {
		return nil, err
	}

	// 4. Создаем элементы заказа
	orderItemsQuery := `
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4)
    `

	for _, item := range cartItems {
		_, err = tx.ExecContext(ctx, orderItemsQuery, orderID, item.ProductID, item.Quantity, item.Price)
		if err != nil {
			return nil, err
		}
	}

	// 5. Очищаем корзину
	clearCartQuery := `
        DELETE FROM cart_items 
        WHERE bot_id = $1 AND username = $2
    `
	_, err = tx.ExecContext(ctx, clearCartQuery, botID, username)
	if err != nil {
		return nil, err
	}

	// 6. Возвращаем информацию о товарах заказа
	resultQuery := `
        SELECT oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase, 
               p.name as product_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        ORDER BY oi.id
    `

	var orderItems []*model.OrderItemWithProduct
	err = tx.SelectContext(ctx, &orderItems, resultQuery, orderID)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return orderItems, nil
}

// GetUserOrders получает список заказов пользователя по bot_id и username
func (r *Repository) GetUserOrders(ctx context.Context, botID int64, username string) ([]*model.OrderWithItems, error) {
	query := `
        SELECT o.id, o.username, o.total_amount, o.status, o.created_at, o.updated_at,
               COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.bot_id = $1 AND o.username = $2
        GROUP BY o.id, o.username, o.total_amount, o.status, o.created_at, o.updated_at
        ORDER BY o.created_at DESC
    `

	type orderSummary struct {
		ID          int64     `db:"id"`
		Username    string    `db:"username"`
		TotalAmount int       `db:"total_amount"`
		Status      string    `db:"status"`
		CreatedAt   time.Time `db:"created_at"`
		UpdatedAt   time.Time `db:"updated_at"`
		ItemsCount  int       `db:"items_count"`
	}

	var orderSummaries []orderSummary
	err := r.conn.SelectContext(ctx, &orderSummaries, query, botID, username)
	if err != nil {
		return nil, err
	}

	// Получаем детальную информацию по товарам для каждого заказа
	var orders []*model.OrderWithItems
	for _, summary := range orderSummaries {
		items, err := r.getOrderItems(ctx, summary.ID)
		if err != nil {
			return nil, err
		}

		orders = append(orders, &model.OrderWithItems{
			ID:          summary.ID,
			Username:    summary.Username,
			TotalAmount: summary.TotalAmount,
			Status:      summary.Status,
			CreatedAt:   summary.CreatedAt,
			UpdatedAt:   summary.UpdatedAt,
			ItemsCount:  summary.ItemsCount,
			Items:       items,
		})
	}

	return orders, nil
}

// GetBotOrders получает список всех заказов бота
func (r *Repository) GetBotOrders(ctx context.Context, botID int64) ([]*model.OrderWithItems, error) {
	query := `
        SELECT o.id, o.username, o.total_amount, o.status, o.created_at, o.updated_at,
               COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.bot_id = $1
        GROUP BY o.id, o.username, o.total_amount, o.status, o.created_at, o.updated_at
        ORDER BY o.created_at DESC
    `

	type orderSummary struct {
		ID          int64     `db:"id"`
		Username    string    `db:"username"`
		TotalAmount int       `db:"total_amount"`
		Status      string    `db:"status"`
		CreatedAt   time.Time `db:"created_at"`
		UpdatedAt   time.Time `db:"updated_at"`
		ItemsCount  int       `db:"items_count"`
	}

	var orderSummaries []orderSummary
	err := r.conn.SelectContext(ctx, &orderSummaries, query, botID)
	if err != nil {
		return nil, err
	}

	var orders []*model.OrderWithItems
	for _, summary := range orderSummaries {
		items, err := r.getOrderItems(ctx, summary.ID)
		if err != nil {
			return nil, err
		}

		orders = append(orders, &model.OrderWithItems{
			ID:          summary.ID,
			Username:    summary.Username,
			TotalAmount: summary.TotalAmount,
			Status:      summary.Status,
			CreatedAt:   summary.CreatedAt,
			UpdatedAt:   summary.UpdatedAt,
			ItemsCount:  summary.ItemsCount,
			Items:       items,
		})
	}

	return orders, nil
}

// Вспомогательный метод для получения элементов заказа
func (r *Repository) getOrderItems(ctx context.Context, orderID int64) ([]*model.OrderItemWithProduct, error) {
	query := `
        SELECT oi.product_id, oi.quantity, oi.price_at_purchase, p.name as product_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        ORDER BY oi.id
    `

	var items []*model.OrderItemWithProduct
	err := r.conn.SelectContext(ctx, &items, query, orderID)
	return items, err
}
