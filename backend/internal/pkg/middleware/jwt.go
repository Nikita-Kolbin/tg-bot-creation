package middleware

import (
	"time"

	"github.com/dgrijalva/jwt-go"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

const (
	tokenTTL        = 24 * time.Hour
	authHeaderName  = "X-Token"
	contextTokenKey = "user-token"
)

type UserJWT struct {
	UserID int `json:"uid"`
	jwt.StandardClaims
}

func GenerateToken(user *model.User, jwtSecret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &UserJWT{
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(tokenTTL).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
		UserID: user.ID,
	})

	return token.SignedString([]byte(jwtSecret))
}
