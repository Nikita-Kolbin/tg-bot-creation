package repository

import (
	"context"
	"github.com/lib/pq"

	"database/sql"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

func (r *Repository) CreateProduct(ctx context.Context, product *model.Product) (*model.Product, error) {
	query := `
        INSERT INTO products (bot_id, name, description, picture_urls, preview_url, price, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, bot_id, name, description, picture_urls, preview_url, price, active, created_at, updated_at
    `

	row := r.conn.QueryRowContext(ctx, query,
		product.BotID,
		product.Name,
		product.Description,
		pq.Array(product.PictureURLs),
		product.PreviewURL,
		product.Price,
		product.Active,
	)

	createdProduct := &model.Product{}
	err := row.Scan(
		&createdProduct.ID,
		&createdProduct.BotID,
		&createdProduct.Name,
		&createdProduct.Description,
		pq.Array(&createdProduct.PictureURLs),
		&createdProduct.PreviewURL,
		&createdProduct.Price,
		&createdProduct.Active,
		&createdProduct.CreatedAt,
		&createdProduct.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return createdProduct, nil
}

func (r *Repository) UpdateProduct(ctx context.Context, product *model.Product) error {
	query := `
        UPDATE products 
        SET name = $1, description = $2, picture_urls = $3, preview_url = $4, 
            price = $5, active = $6, updated_at = NOW()
        WHERE id = $7
    `

	result, err := r.conn.ExecContext(ctx, query,
		product.Name, product.Description,
		pq.Array(product.PictureURLs), product.PreviewURL,
		product.Price, product.Active, product.ID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) DeleteProduct(ctx context.Context, productID int) error {
	query := `DELETE FROM products WHERE id = $1`
	result, err := r.conn.ExecContext(ctx, query, productID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) GetProductsByBot(ctx context.Context, botID int64) ([]*model.Product, error) {
	query := `
        SELECT id, bot_id, name, description, picture_urls, preview_url, price, active, created_at, updated_at
        FROM products 
        WHERE bot_id = $1 
        ORDER BY created_at DESC
    `

	rows, err := r.conn.QueryContext(ctx, query, botID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*model.Product
	for rows.Next() {
		product := &model.Product{}

		err := rows.Scan(
			&product.ID,
			&product.BotID,
			&product.Name,
			&product.Description,
			pq.Array(&product.PictureURLs),
			&product.PreviewURL,
			&product.Price,
			&product.Active,
			&product.CreatedAt,
			&product.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

func (r *Repository) GetProductByID(ctx context.Context, productID int) (*model.Product, error) {
	query := `
        SELECT id, bot_id, name, description, picture_urls, preview_url, price, active, created_at, updated_at
        FROM products 
        WHERE id = $1
    `

	row := r.conn.QueryRowContext(ctx, query, productID)
	product := &model.Product{}

	err := row.Scan(
		&product.ID,
		&product.BotID,
		&product.Name,
		&product.Description,
		pq.Array(&product.PictureURLs),
		&product.PreviewURL,
		&product.Price,
		&product.Active,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return product, nil
}
