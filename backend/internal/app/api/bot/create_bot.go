package bot

import (
	"errors"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"io"
	"net/http"
	"time"

	"github.com/go-chi/render"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

// CreateBot godoc
// @Summary      Create new Telegram bot
// @Security     ApiKeyAuth
// @Tags         bot
// @Accept       json
// @Produce      json
// @Param        input body       dto.BotCreateRequest true "bot creation request"
// @Success      200   {object}   dto.BotResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/create [post]
func (i *Bot) CreateBot(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req dto.BotCreateRequest

	err := render.DecodeJSON(r.Body, &req)
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

	// TODO: Ограничить кол-во ботов на человека
	// TODO: Проверка тг токена на валиднось

	ownerUserID := middleware.GetUserId(ctx)

	botToCreate := &model.Bot{
		Name:        req.Name,
		Description: req.Description,
		Token:       req.Token,
		OwnerUserID: ownerUserID,
	}

	createdBot, err := i.srv.CreateBot(ctx, botToCreate)
	if err != nil {
		if errors.Is(err, model.ErrTokenRegistered) {
			render.Status(r, http.StatusBadRequest)
			render.JSON(w, r, dto.NewErrResp("bot with this token already exists"))
			return
		}
		logger.Error(ctx, "failed to create bot", "err", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to create bot"))
		return
	}

	resp := &dto.BotResponse{
		ID:          createdBot.ID,
		Name:        createdBot.Name,
		Description: createdBot.Description,
		Status:      createdBot.Status,
		OwnerUserID: createdBot.OwnerUserID,
		CreatedAt:   createdBot.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   createdBot.UpdatedAt.Format(time.RFC3339),
	}

	logger.Info(ctx, "bot created", "bot_id", createdBot.ID)

	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
