package middleware

import (
	"context"
	"fmt"
	"net/http"

	"github.com/dgrijalva/jwt-go"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
)

func Auth(jwtSecret string) func(next http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {

			token := r.Header.Get(authHeaderName)

			if token == "" {
				logger.Error(r.Context(), "middleware auth failed: empty token")
				http.Error(w, "Token is required", http.StatusForbidden)
				return
			}

			ctx, err := addTokenToContext(r.Context(), token, jwtSecret)
			if err != nil {
				logger.Error(r.Context(), "middleware auth failed: invalid token", "err", err)
				http.Error(w, "Invalid token", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r.WithContext(ctx))
		}
	}
}

func addTokenToContext(ctx context.Context, token, jwtSecret string) (context.Context, error) {
	userJWT, err := parseToken(token, jwtSecret)
	if err != nil {
		return nil, err
	}

	return context.WithValue(ctx, contextTokenKey, userJWT), nil
}

func parseToken(t, jwtSecret string) (userToken *UserJWT, err error) {
	token, err := jwt.ParseWithClaims(t, &UserJWT{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("invalid signin method")
		}
		return []byte(jwtSecret), nil
	})
	if err != nil {
		return nil, err
	}

	userToken, ok := token.Claims.(*UserJWT)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	return userToken, nil
}

func GetUserId(ctx context.Context) int64 {
	token, ok := ctx.Value(contextTokenKey).(*UserJWT)
	if !ok {
		return 0
	}
	return token.UserID
}
