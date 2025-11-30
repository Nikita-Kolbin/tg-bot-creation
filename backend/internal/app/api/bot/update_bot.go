package bot

import (
	"errors"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/go-chi/chi/v5"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/render"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

// UpdateBot godoc
// @Summary      Update Telegram bot
// @Security     ApiKeyAuth
// @Tags         bot
// @Accept       json
// @Produce      json
// @Param        bot_id path      int                                      true "Bot ID"
// @Param        input  body      dto.BotUpdateRequest true "bot update request"
// @Success      200   {object}   dto.BotResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      401   {object}   dto.ErrorResponse
// @Failure      403   {object}   dto.ErrorResponse
// @Failure      404   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id} [put]
func (i *Bot) UpdateBot(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	botIDStr := chi.URLParam(r, "bot_id")
	botID, err := strconv.Atoi(botIDStr)
	if err != nil {
		logger.Error(ctx, "invalid bot_id", "bot_id", botIDStr, "err", err)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("invalid bot_id"))
		return
	}

	var req dto.BotUpdateRequest
	err = render.DecodeJSON(r.Body, &req)
	if errors.Is(err, io.EOF) {
		logger.Error(ctx, "request body is empty")
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("empty request"))
		return
	}
	if err != nil {
		logger.Error(ctx, "failed to decode request body", "err", err)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("failed to decode request"))
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
		logger.Error(ctx, "attempt to update bot by non-owner", "bot_id", botID, "user_id", userID)
		render.Status(r, http.StatusForbidden)
		render.JSON(w, r, dto.NewErrResp("forbidden"))
		return
	}

	bot, err := i.srv.GetBotByID(ctx, botID)
	if err != nil {
		logger.Error(ctx, "failed to get bot", "err", err)
		render.Status(r, http.StatusNotFound)
		render.JSON(w, r, dto.NewErrResp("bot not found"))
		return
	}

	// Обновляем только переданные поля
	if req.Name != nil {
		bot.Name = *req.Name
	}
	if req.Description != nil {
		bot.Description = *req.Description
	}
	if req.Token != nil {
		bot.Token = *req.Token
	}
	// TODO: сделать валидация на статус
	if req.Status != nil {
		bot.Status = *req.Status
	}
	bot.OwnerUserID = userID

	err = i.srv.UpdateBot(ctx, bot)
	if err != nil {
		logger.Error(ctx, "failed to update bot", "err", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to update bot"))
		return
	}

	resp := &dto.BotResponse{
		ID:          bot.ID,
		Name:        bot.Name,
		Description: bot.Description,
		Status:      bot.Status,
		OwnerUserID: bot.OwnerUserID,
		CreatedAt:   bot.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   bot.UpdatedAt.Format(time.RFC3339),
	}

	logger.Info(ctx, "bot updated", "bot_id", botID)
	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
