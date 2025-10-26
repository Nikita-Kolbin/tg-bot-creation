package model

import "time"

type User struct {
	ID           int64      `db:"id" json:"id"`
	Username     string     `db:"username" json:"username"`
	Email        string     `db:"email" json:"email"`
	PasswordHash string     `db:"password_hash" json:"password_hash"`
	FirstName    string     `db:"first_name" json:"first_name,omitempty"`
	LastName     string     `db:"last_name" json:"last_name,omitempty"`
	IsActive     bool       `db:"is_active" json:"is_active"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at" json:"updated_at"`
	LastLogin    *time.Time `db:"last_login" json:"last_login,omitempty"`
}
