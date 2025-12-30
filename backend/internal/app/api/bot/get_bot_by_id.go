package bot

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

// GetBotByID godoc
// @Summary      Get Telegram bot by ID
// @Security     ApiKeyAuth
// @Tags         bot
// @Produce      json
// @Param        bot_id path      int true "Bot ID"
// @Success      200   {object}   dto.BotResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      401   {object}   dto.ErrorResponse
// @Failure      403   {object}   dto.ErrorResponse
// @Failure      404   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id} [get]
func (i *Bot) GetBotByID(w http.ResponseWriter, r *http.Request) {
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
		logger.Error(ctx, "attempt to get bot by non-owner", "bot_id", botID, "user_id", userID)
		render.Status(r, http.StatusForbidden)
		render.JSON(w, r, dto.NewErrResp("forbidden"))
		return
	}

	bot, err := i.srv.GetBotByID(ctx, botID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			logger.Info(ctx, "bot not found", "bot_id", botID)
			render.Status(r, http.StatusNotFound)
			render.JSON(w, r, dto.NewErrResp("bot not found"))
			return
		}
		logger.Error(ctx, "failed to get bot", "err", err, "bot_id", botID)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to get bot"))
		return
	}

	resp := &dto.BotResponse{
		ID:          bot.ID,
		Name:        bot.Name,
		Description: bot.Description,
		TokenMask:   makeTokenMask(bot.Token),
		Status:      bot.Status,
		Username:    bot.Username,
		OwnerUserID: bot.OwnerUserID,
		MiniAppURL:  makeMiniAppURL(i.serverHostPort, bot.ID),
		CreatedAt:   bot.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   bot.UpdatedAt.Format(time.RFC3339),
	}

	logger.Info(ctx, "bot retrieved", "bot_id", botID)
	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
