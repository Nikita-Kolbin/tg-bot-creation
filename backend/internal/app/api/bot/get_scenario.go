package bot

import (
	"net/http"
	"strconv"

	"github.com/go-chi/render"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

// GetBotScenario godoc
// @Summary      Get bot scenario steps and buttons
// @Security     ApiKeyAuth
// @Tags         bot
// @Accept       json
// @Produce      json
// @Param        bot_id query int true "Bot ID"
// @Success      200   {object}   dto.SetBotScenarioRequest
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      401   {object}   dto.ErrorResponse
// @Failure      403   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/scenario [get]
func (i *Bot) GetBotScenario(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	botIDStr := r.URL.Query().Get("bot_id")
	if botIDStr == "" {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("missing bot_id query parameter"))
		return
	}

	botID, err := strconv.Atoi(botIDStr)
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("invalid bot_id query parameter"))
		return
	}

	userID := middleware.GetUserId(ctx)

	isOwner, err := i.srv.IsBotOwner(ctx, botID, userID)
	if err != nil {
		logger.Error(ctx, "failed to verify bot ownership", "err", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("internal error"))
		return
	}
	if !isOwner {
		logger.Error(ctx, "attempt to get bot scenario by non-owner", "bot_id", botID, "user_id", userID)
		render.Status(r, http.StatusForbidden)
		render.JSON(w, r, dto.NewErrResp("forbidden"))
		return
	}

	scenarioDTO, err := i.srv.GetBotScenario(ctx, botID)
	if err != nil {
		logger.Error(ctx, "failed to get bot scenario", "err", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to get scenario"))
		return
	}

	logger.Info(ctx, "scenario is taken", "bot_id", botID, "user_id", userID)
	render.Status(r, http.StatusOK)
	render.JSON(w, r, scenarioDTO)
}
