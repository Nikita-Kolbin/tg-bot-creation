package cart

import (
	"net/http"
	"strconv"
	
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

// GetCart godoc
// @Summary      Get user cart
// @Tags         cart
// @Produce      json
// @Param        bot_id path      int true "Bot ID"
// @Param        username query    string true "Username"
// @Success      200   {object}   dto.CartResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id}/cart [get]
func (i *Cart) GetCart(w http.ResponseWriter, r *http.Request) {
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

	cartItems, err := i.srv.GetCartItems(ctx, int64(botID), username)
	if err != nil {
		logger.Error(ctx, "failed to get cart", "err", err, "bot_id", botID, "username", username)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to get cart"))
		return
	}

	resp := &dto.CartResponse{
		Items: make([]*dto.CartItemResponse, 0, len(cartItems)),
	}
	for _, item := range cartItems {
		resp.Items = append(resp.Items, dto.CartItemToResponse(item))
	}

	logger.Info(ctx, "cart retrieved", "bot_id", botID, "username", username, "items_count", len(cartItems))
	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
