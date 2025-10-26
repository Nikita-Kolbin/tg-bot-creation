package user

import (
	"errors"
	"io"
	"net/http"

	"github.com/go-chi/render"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/middleware"
)

// SignUp godoc
// @Summary      SingUp admin
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        input body       dto.UsernamePasswordRequest true "sign up"
// @Success      200   {object}   dto.UserTokenResponse
// @Failure      400   {object}   dto.ErrorResponse
// @Failure      409   {object}   dto.ErrorResponse
// @Failure      500   {object}   dto.ErrorResponse
// @Router       /user/sign-up [post]
func (i *User) SignUp(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req dto.UsernamePasswordRequest

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

	user, err := i.srv.CreateUser(ctx, req.Username, req.Password)
	if errors.Is(err, model.ErrUsernameRegistered) {
		logger.Error(ctx, "username is already taken", "username", req.Username)
		render.Status(r, http.StatusConflict)
		render.JSON(w, r, dto.NewErrResp("username is already taken"))
		return
	}
	if err != nil {
		logger.Error(ctx, "failed to create admin", "err", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to create admin"))
		return
	}

	token, err := middleware.GenerateToken(user, i.srv.GetJWTSecret())
	if err != nil {
		logger.Error(ctx, "failed to generate token", "err", err)
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, dto.NewErrResp("failed to generate token"))
		return
	}

	logger.Info(ctx, "admin created", "username", req.Username)

	render.Status(r, http.StatusOK)
	render.JSON(w, r, &dto.UserTokenResponse{
		Token: token,
	})
}
