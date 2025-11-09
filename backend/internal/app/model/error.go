package model

import "errors"

// repository
var (
	ErrUsernameRegistered      = errors.New("username is already registered")
	ErrWrongUsernameOrPassword = errors.New("wrong username or password")
	ErrTokenRegistered         = errors.New("token is already registered")
)
