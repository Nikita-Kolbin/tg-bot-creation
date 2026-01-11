package router

import (
	"context"
	"fmt"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/bot"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/product"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/user"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"

	_ "github.com/Nikita-Kolbin/tg-bot-creation/backend/docs"
	authMW "github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

type service interface {
	user.Service
	bot.Service
	product.Service

	GetJWTSecret() string
}

func New(_ context.Context, srv service, address, serverHostPort string) http.Handler {
	router := chi.NewRouter()

	// middleware
	router.Use(middleware.RequestID)
	router.Use(middleware.Recoverer)
	router.Use(middleware.URLFormat)
	authMiddleware := authMW.Auth(srv.GetJWTSecret())

	// CORS
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	}))

	// swagger
	router.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL(fmt.Sprintf("%s/swagger/doc.json", address)),
	))

	// APIs
	userAPI := user.NewAPI(srv)
	botAPI := bot.NewAPI(srv, serverHostPort)
	productAPI := product.NewAPI(srv)

	// handlers
	router.Post("/api/user/sign-up", userAPI.SignUp)
	router.Post("/api/user/sign-in", userAPI.SignIn)

	router.Post("/api/bot/create", authMiddleware(botAPI.CreateBot))
	router.Put("/api/bot/{bot_id}", authMiddleware(botAPI.UpdateBot))
	router.Get("/api/bot/{bot_id}", authMiddleware(botAPI.GetBotByID))
	router.Delete("/api/bot/{bot_id}", authMiddleware(botAPI.DeleteBot))
	router.Get("/api/bot/list", authMiddleware(botAPI.GetUserBots))
	router.Post("/api/bot/scenario", authMiddleware(botAPI.UpdateBotScenario))
	router.Get("/api/bot/scenario", authMiddleware(botAPI.GetBotScenario))

	router.Post("/api/bot/{bot_id}/product", authMiddleware(productAPI.CreateProduct))
	router.Get("/api/bot/{bot_id}/products", authMiddleware(productAPI.GetProducts))
	router.Get("/api/bot/{bot_id}/active_products", productAPI.GetActiveProducts)
	router.Get("/api/bot/{bot_id}/product/{product_id}", authMiddleware(productAPI.GetProductByID))
	router.Put("/api/bot/{bot_id}/product/{product_id}", authMiddleware(productAPI.UpdateProduct))
	router.Delete("/api/bot/{bot_id}/product/{product_id}", authMiddleware(productAPI.DeleteProduct))

	return router
}
