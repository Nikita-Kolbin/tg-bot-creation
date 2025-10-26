package repository

func isSQLError(err error, errorCode string) bool {
	if err == nil {
		return false
	}

	type checker interface {
		SQLState() string
	}
	if pe, ok := err.(checker); ok {
		return pe.SQLState() == errorCode
	}

	return false
}
