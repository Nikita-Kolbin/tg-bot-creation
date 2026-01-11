package product

import (
	"net/http"
	"strconv"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

// GetActiveProducts godoc
// @Summary      Get active products for bot
// @Tags         product
// @Produce      json
// @Param        bot_id path      int true "Bot ID"
// @Success      200   {object}   dto.ProductsListResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      401   {object}   dto.ErrorResponse
// @Failure      403   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id}/active_products [get]
func (i *Product) GetActiveProducts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	botIDStr := chi.URLParam(r, "bot_id")
	botID, err := strconv.Atoi(botIDStr)
	if err != nil {
		logger.Error(ctx, "invalid bot_id", "bot_id", botIDStr, "err", err)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("invalid bot_id"))
		return
	}

	products, err := i.srv.GetProductsByBot(ctx, int64(botID), true)
	if err != nil {
		logger.Error(ctx, "failed to get products", "err", err, "bot_id", botID)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to get products"))
		return
	}

	resp := &dto.ProductsListResponse{
		Products: make([]*dto.ProductResponse, 0, len(products)),
	}
	for _, product := range products {
		resp.Products = append(resp.Products, dto.ProductToResponse(product))
	}

	logger.Info(ctx, "products retrieved", "bot_id", botID, "count", len(products))
	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
