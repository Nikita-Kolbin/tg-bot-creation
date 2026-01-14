package order

import (
	"net/http"
	"strconv"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

// GetBotOrders godoc
// @Summary      Get all orders for bot (owner only)
// @Security     ApiKeyAuth
// @Tags         orders
// @Produce      json
// @Param        bot_id path      int true "Bot ID"
// @Success      200   {object}   dto.OrdersResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      401   {object}   dto.ErrorResponse
// @Failure      403   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id}/orders [get]
func (i *Order) GetBotOrders(w http.ResponseWriter, r *http.Request) {
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
		logger.Error(ctx, "attempt to get bot orders by non-owner", "bot_id", botID, "user_id", userID)
		render.Status(r, http.StatusForbidden)
		render.JSON(w, r, dto.NewErrResp("forbidden"))
		return
	}

	orders, err := i.srv.GetBotOrders(ctx, int64(botID))
	if err != nil {
		logger.Error(ctx, "failed to get bot orders", "err", err, "bot_id", botID)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to get orders"))
		return
	}

	resp := &dto.OrdersResponse{
		Orders: make([]*dto.OrderResponse, 0, len(orders)),
	}
	for _, order := range orders {
		resp.Orders = append(resp.Orders, dto.OrderToResponse(order))
	}

	logger.Info(ctx, "bot orders retrieved", "bot_id", botID, "orders_count", len(orders))
	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
