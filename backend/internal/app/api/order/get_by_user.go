package order

import (
	"net/http"
	"strconv"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

// GetUserOrders godoc
// @Summary      Get user orders for bot
// @Tags         orders
// @Produce      json
// @Param        bot_id   path      int true "Bot ID"
// @Param        username query     string true "Username"
// @Success      200   {object}   dto.OrdersResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id}/orders/user [get]
func (i *Order) GetUserOrders(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	botIDStr := chi.URLParam(r, "bot_id")
	botID, err := strconv.Atoi(botIDStr)
	if err != nil {
		logger.Error(ctx, "invalid bot_id", "bot_id", botIDStr, "err", err)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("invalid bot_id"))
		return
	}

	username := r.URL.Query().Get("username")
	if username == "" {
		logger.Error(ctx, "missing username query parameter")
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("username query parameter is required"))
		return
	}

	orders, err := i.srv.GetUserOrders(ctx, int64(botID), username)
	if err != nil {
		logger.Error(ctx, "failed to get user orders", "err", err, "bot_id", botID, "username", username)
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

	logger.Info(ctx, "user orders retrieved", "bot_id", botID, "username", username, "orders_count", len(orders))
	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
