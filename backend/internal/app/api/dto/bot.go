package dto

type BotCreateRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Token       string `json:"token"`
}

type BotResponse struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      string `json:"status"`
	OwnerUserID int    `json:"owner_user_id"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}
