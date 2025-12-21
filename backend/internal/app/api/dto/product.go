package dto

import (
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"time"
)

type ProductCreateRequest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	PictureURLs []string `json:"picture_urls"`
	PreviewURL  string   `json:"preview_url,omitempty"`
	Price       int      `json:"price"`
}

type ProductUpdateRequest struct {
	Name        *string   `json:"name,omitempty"`
	Description *string   `json:"description,omitempty"`
	PictureURLs *[]string `json:"picture_urls,omitempty"`
	PreviewURL  *string   `json:"preview_url,omitempty"`
	Price       *int      `json:"price,omitempty"`
	Active      *bool     `json:"active,omitempty"`
}

type ProductResponse struct {
	ID          int      `json:"id"`
	BotID       int64    `json:"bot_id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	PictureURLs []string `json:"picture_urls"`
	PreviewURL  string   `json:"preview_url,omitempty"`
	Price       int      `json:"price"`
	Active      bool     `json:"active"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
}

type ProductsListResponse struct {
	Products []*ProductResponse `json:"products"`
}

func ProductToResponse(p *model.Product) *ProductResponse {
	return &ProductResponse{
		ID:          p.ID,
		BotID:       p.BotID,
		Name:        p.Name,
		Description: p.Description,
		PictureURLs: p.PictureURLs,
		PreviewURL:  p.PreviewURL,
		Price:       p.Price,
		Active:      p.Active,
		CreatedAt:   p.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   p.UpdatedAt.Format(time.RFC3339),
	}
}
