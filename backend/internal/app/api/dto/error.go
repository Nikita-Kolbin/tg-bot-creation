package dto

type ErrorResponse struct {
	Err string `json:"error"`
}

func NewErrResp(err string) *ErrorResponse {
	return &ErrorResponse{Err: err}
}
