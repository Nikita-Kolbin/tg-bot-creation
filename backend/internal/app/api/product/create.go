package product

import (
	"errors"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/go-chi/chi/v5"
	"io"
	"net/http"
	"strconv"

	"github.com/go-chi/render"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

// CreateProduct godoc
// @Summary      Create new product for bot
// @Security     ApiKeyAuth
// @Tags         product
// @Accept       json
// @Produce      json
// @Param        bot_id path      int                                      true "Bot ID"
// @Param        input  body      dto.ProductCreateRequest true "product creation request"
// @Success      200   {object}   dto.ProductResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      401   {object}   dto.ErrorResponse
// @Failure      403   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /bot/{bot_id}/product [post]
func (i *Product) CreateProduct(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	botIDStr := chi.URLParam(r, "bot_id")
	botID, err := strconv.Atoi(botIDStr)
	if err != nil {
		logger.Error(ctx, "invalid bot_id", "bot_id", botIDStr, "err", err)
		render.Status(r, http.StatusBadRequest)
		render.JSON(w, r, dto.NewErrResp("invalid bot_id"))
		return
	}

	var req dto.ProductCreateRequest
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
		logger.Error(ctx, "attempt to create product by non-owner", "bot_id", botID, "user_id", userID)
		render.Status(r, http.StatusForbidden)
		render.JSON(w, r, dto.NewErrResp("forbidden"))
		return
	}

	product := &model.Product{
		BotID:       int64(botID),
		Name:        req.Name,
		Description: req.Description,
		PictureURLs: req.PictureURLs,
		PreviewURL:  req.PreviewURL,
		Price:       req.Price,
		Active:      true,
	}

	createdProduct, err := i.srv.CreateProduct(ctx, product)
	if err != nil {
		logger.Error(ctx, "failed to create product", "err", err, "bot_id", botID)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to create product"))
		return
	}

	resp := dto.ProductToResponse(createdProduct)
	logger.Info(ctx, "product created", "product_id", createdProduct.ID, "bot_id", botID)

	render.Status(r, http.StatusOK)
	render.JSON(w, r, resp)
}
