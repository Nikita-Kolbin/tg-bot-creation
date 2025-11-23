package bot

import (
	"errors"
	"fmt"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"io"
	"net/http"

	"github.com/go-chi/render"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

// UpdateBotScenario godoc
// @Summary      Update bot scenario steps
// @Security     ApiKeyAuth
// @Tags         bot
// @Accept       json
// @Produce      json
// @Param        input body       dto.SetBotScenarioRequest true "bot scenario update request"
// @Success      204   {object}   nil
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      401   {object}   dto.ErrorResponse
// @Failure      403   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/scenario [post]
func (i *Bot) UpdateBotScenario(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req dto.SetBotScenarioRequest

	err := render.DecodeJSON(r.Body, &req)
	if errors.Is(err, io.EOF) {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("empty request"))
		return
	}
	if err != nil {
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("failed to decode request"))
		return
	}
	if err := dto.ValidateSetBotScenarioRequest(&req); err != nil {
		logger.Error(ctx, "request body is invalid", "err", err)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp(fmt.Sprintf("request body is invalid: %s", err)))
		return
	}

	userID := middleware.GetUserId(ctx)

	isOwner, err := i.srv.IsBotOwner(ctx, req.BotID, userID)
	if err != nil {
		logger.Error(ctx, "failed to verify bot ownership", "err", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("internal error"))
		return
	}
	if !isOwner {
		logger.Error(ctx, "attempt to update bot scenario by non-owner", "bot_id", req.BotID, "user_id", userID)
		render.Status(r, http.StatusForbidden)
		render.JSON(w, r, dto.NewErrResp("forbidden"))
		return
	}

	err = i.srv.UpdateBotScenario(ctx, &req)
	if err != nil {
		logger.Error(ctx, "failed to update bot scenario", "err", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to update scenario"))
		return
	}

	logger.Info(ctx, "scenario is updated", "bot_id", req.BotID, "user_id", userID)
	render.Status(r, http.StatusNoContent)
	render.NoContent(w, r)
}
