package service

import (
	"crypto/sha1"
	"fmt"
)

func generatePasswordHash(p string) string {
	hash := sha1.New()
	hash.Write([]byte(p))

	return fmt.Sprintf("%x", hash.Sum(nil))
}

func (s *Service) GetJWTSecret() string {
	return s.jwtSecret
}
