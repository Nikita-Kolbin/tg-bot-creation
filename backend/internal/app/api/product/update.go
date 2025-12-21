package product

import (
	"database/sql"
	"errors"
	"github.com/go-chi/chi/v5"
	"io"
	"net/http"
	"strconv"

	"github.com/go-chi/render"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

// UpdateProduct godoc
// @Summary      Update product
// @Security     ApiKeyAuth
// @Tags         product
// @Accept       json
// @Produce      json
// @Param        bot_id     path      int                                      true "Bot ID"
// @Param        product_id path      int                                      true "Product ID"
// @Param        input      body      dto.ProductUpdateRequest true "product update request"
// @Success      200   {object}   dto.ProductResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      401   {object}   dto.ErrorResponse
// @Failure      403   {object}   dto.ErrorResponse
// @Failure      404   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id}/product/{product_id} [put]
func (i *Product) UpdateProduct(w http.ResponseWriter, r *http.Request) {
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

	var req dto.ProductUpdateRequest
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
		logger.Error(ctx, "attempt to update product by non-owner", "bot_id", botID, "user_id", userID)
		render.Status(r, http.StatusForbidden)
		render.JSON(w, r, dto.NewErrResp("forbidden"))
		return
	}

	existingProduct, err := i.srv.GetProductByID(ctx, productID)
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

	if existingProduct.BotID != int64(botID) {
		logger.Error(ctx, "product does not belong to bot", "product_id", productID, "bot_id", botID)
		render.Status(r, http.StatusForbidden)
		render.JSON(w, r, dto.NewErrResp("product does not belong to bot"))
		return
	}

	if req.Name != nil {
		existingProduct.Name = *req.Name
	}
	if req.Description != nil {
		existingProduct.Description = *req.Description
	}
	if req.PictureURLs != nil {
		existingProduct.PictureURLs = *req.PictureURLs
	}
	if req.PreviewURL != nil {
		existingProduct.PreviewURL = *req.PreviewURL
	}
	if req.Price != nil {
		existingProduct.Price = *req.Price
	}
	if req.Active != nil {
		existingProduct.Active = *req.Active
	}

	err = i.srv.UpdateProduct(ctx, existingProduct)
	if err != nil {
		logger.Error(ctx, "failed to update product", "err", err, "product_id", productID)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to update product"))
		return
	}

	resp := dto.ProductToResponse(existingProduct)
	logger.Info(ctx, "product updated", "product_id", productID, "bot_id", botID)

	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
