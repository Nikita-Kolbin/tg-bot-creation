package product

import (
	"database/sql"
	"errors"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"net/http"
	"strconv"
)

// GetProductByID godoc
// @Summary      Get product by ID
// @Security     ApiKeyAuth
// @Tags         product
// @Produce      json
// @Param        bot_id     path      int true "Bot ID"
// @Param        product_id path      int true "Product ID"
// @Success      200   {object}   dto.ProductResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      401   {object}   dto.ErrorResponse
// @Failure      403   {object}   dto.ErrorResponse
// @Failure      404   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id}/product/{product_id} [get]
func (i *Product) GetProductByID(w http.ResponseWriter, r *http.Request) {
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

	userID := middleware.GetUserId(ctx)

	product, err := i.srv.GetProductByID(ctx, productID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			logger.Info(ctx, "product not found", "product_id", productID)
			render.Status(r, http.StatusNotFound)
			render.JSON(w, r, dto.NewErrResp("product not found"))
			return
		}
		logger.Error(ctx, "failed to get product", "err", err, "product_id", productID)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to get product"))
		return
	}

	if product.BotID != int64(botID) {
		logger.Error(ctx, "product does not belong to bot", "product_id", productID, "bot_id", botID)
		render.Status(r, http.StatusForbidden)
		render.JSON(w, r, dto.NewErrResp("product does not belong to bot"))
		return
	}

	resp := dto.ProductToResponse(product)
	logger.Info(ctx, "product retrieved", "product_id", productID, "bot_id", botID, "user_id", userID)

	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
