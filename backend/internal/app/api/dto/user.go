package dto

type UsernamePasswordRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserTokenResponse struct {
	Token string `json:"token"`
}
