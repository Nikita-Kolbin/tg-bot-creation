package bot

import (
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"net/http"
	"time"

	"github.com/go-chi/render"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

// GetUserBots godoc
// @Summary      Get all bots for current user
// @Security     ApiKeyAuth
// @Tags         bot
// @Produce      json
// @Success      200   {object}   dto.BotsListResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/list [get]
func (i *Bot) GetUserBots(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID := middleware.GetUserId(ctx)

	bots, err := i.srv.GetUserBots(ctx, userID)
	if err != nil {
		logger.Error(ctx, "failed to get user bots", "err", err, "user_id", userID)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to get bots"))
		return
	}

	resp := &dto.BotsListResponse{
		Bots: make([]*dto.BotResponse, 0, len(bots)),
	}
	for _, bot := range bots {
		resp.Bots = append(resp.Bots, &dto.BotResponse{
			ID:          bot.ID,
			Name:        bot.Name,
			Description: bot.Description,
			Status:      bot.Status,
			OwnerUserID: bot.OwnerUserID,
			CreatedAt:   bot.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   bot.UpdatedAt.Format(time.RFC3339),
		})
	}

	logger.Info(ctx, "user bots retrieved", "user_id", userID, "bots_count", len(bots))

	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
