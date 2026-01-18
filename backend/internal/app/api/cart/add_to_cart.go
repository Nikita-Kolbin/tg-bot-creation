package cart

import (
	"errors"
	"io"
	"net/http"
	"strconv"
	
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

// AddToCart godoc
// @Summary      Add product to cart
// @Tags         cart
// @Accept       json
// @Produce      json
// @Param        bot_id     path      int                                      true "Bot ID"
// @Param        product_id path      int                                      true "Product ID"
// @Param        input      body      dto.AddToCartRequest true "add to cart request"
// @Success      200
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id}/product/{product_id}/cart [post]
func (i *Cart) AddToCart(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	botIDStr := chi.URLParam(r, "bot_id")
	botID, err := strconv.Atoi(botIDStr)
	if err != nil {
		logger.Error(ctx, "invalid bot_id", "bot_id", botIDStr, "err", err)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("invalid bot_id"))
		return
	}

	productIDStr := chi.URLParam(r, "product_id")
	productID, err := strconv.Atoi(productIDStr)
	if err != nil {
		logger.Error(ctx, "invalid product_id", "product_id", productIDStr, "err", err)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("invalid product_id"))
		return
	}

	var req dto.AddToCartRequest
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

	err = i.srv.UpsertCartItem(ctx, int64(botID), req.Username, productID, req.Quantity)
	if err != nil {
		logger.Error(ctx, "failed to add to cart", "err", err, "bot_id", botID, "product_id", productID)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to add to cart"))
		return
	}

	logger.Info(ctx, "product added to cart", "bot_id", botID, "product_id", productID, "username", req.Username, "quantity", req.Quantity)
	render.Status(r, http.StatusOK)
	render.NoContent(w, r)
}
