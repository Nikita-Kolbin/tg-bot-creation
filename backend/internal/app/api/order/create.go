package order

import (
	"database/sql"
	"errors"
	"io"
	"net/http"
	"strconv"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

// CreateOrder godoc
// @Summary      Create order from cart
// @Tags         orders
// @Accept       json
// @Produce      json
// @Param        bot_id path      int                                      true "Bot ID"
// @Param        input  body      dto.CreateOrderRequest true "create order request"
// @Success      204
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      404   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id}/order [post]
func (i *Order) CreateOrder(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	botIDStr := chi.URLParam(r, "bot_id")
	botID, err := strconv.Atoi(botIDStr)
	if err != nil {
		logger.Error(ctx, "invalid bot_id", "bot_id", botIDStr, "err", err)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("invalid bot_id"))
		return
	}

	var req dto.CreateOrderRequest
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

	err = i.srv.CreateOrderFromCart(ctx, int64(botID), req.Username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			logger.Info(ctx, "cart is empty", "bot_id", botID, "username", req.Username)
			render.Status(r, http.StatusNotFound)
			render.JSON(w, r, dto.NewErrResp("cart is empty"))
			return
		}
		logger.Error(ctx, "failed to create order", "err", err, "bot_id", botID, "username", req.Username)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to create order"))
		return
	}

	logger.Info(ctx, "order created successfully", "bot_id", botID, "username", req.Username)
	render.Status(r, http.StatusNoContent)
	render.NoContent(w, r)
}
