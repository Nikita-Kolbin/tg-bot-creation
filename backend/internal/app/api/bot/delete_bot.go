package bot

import (
	"database/sql"
	"errors"
	"github.com/go-chi/chi/v5"
	"net/http"
	"strconv"

	"github.com/go-chi/render"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

// DeleteBot godoc
// @Summary      Delete Telegram bot
// @Security     ApiKeyAuth
// @Tags         bot
// @Produce      json
// @Param        bot_id path      int true "Bot ID"
// @Success      204   {object}   nil
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      401   {object}   dto.ErrorResponse
// @Failure      403   {object}   dto.ErrorResponse
// @Failure      404   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id} [delete]
func (i *Bot) DeleteBot(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	botIDStr := chi.URLParam(r, "bot_id")
	botID, err := strconv.Atoi(botIDStr)
	if err != nil {
		logger.Error(ctx, "invalid bot_id", "bot_id", botIDStr, "err", err)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("invalid bot_id"))
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
		logger.Error(ctx, "attempt to delete bot by non-owner", "bot_id", botID, "user_id", userID)
		render.Status(r, http.StatusForbidden)
		render.JSON(w, r, dto.NewErrResp("forbidden"))
		return
	}

	err = i.srv.DeleteBot(ctx, botID, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			logger.Info(ctx, "bot not found for deletion", "bot_id", botID, "user_id", userID)
			render.Status(r, http.StatusNotFound)
			render.JSON(w, r, dto.NewErrResp("bot not found"))
			return
		}
		logger.Error(ctx, "failed to delete bot", "err", err, "bot_id", botID)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to delete bot"))
		return
	}

	logger.Info(ctx, "bot deleted", "bot_id", botID, "user_id", userID)
	render.Status(r, http.StatusNoContent)
	render.NoContent(w, r)
}
