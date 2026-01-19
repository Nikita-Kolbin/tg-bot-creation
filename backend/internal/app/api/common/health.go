package common

import (
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/go-chi/render"
	"net/http"
	"time"
)

// HealthCheck godoc
// @Summary      Health check
// @Description  Check if service is healthy
// @Tags         health
// @Produce      json
// @Success      200 {object} dto.HealthResponse
// @Failure      500 {object} dto.ErrorResponse
// @Router       /health [get]
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	resp := &HealthResponse{
		Status:      "healthy",
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Version:     "1.0.0",      // TODO: подтянуть из build info
		Environment: "production", // TODO: из конфига
	}

	logger.Info(ctx, "health check passed")
	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}

type HealthResponse struct {
	Status      string `json:"status"`
	Timestamp   string `json:"timestamp"`
	Version     string `json:"version"`
	Environment string `json:"environment"`
}
