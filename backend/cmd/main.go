package main

import (
	"context"
	"fmt"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/router"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/config"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/repository"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/service"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/telegram"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/httpserver"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"time"
)

// @title           TG Bot Creator
// @version         1.0

// @host      localhost:8082
// @BasePath  /api

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name X-Token

func main() {
	ctx := context.Background()
	if err := run(ctx); err != nil {
		logger.Error(ctx, "run service failed", "err", err)
	}
}

func run(ctx context.Context) error {
	cfg, err := config.New()
	if err != nil {
		return fmt.Errorf("init config failed: %w", err)
	}

	repo, err := repository.New(ctx, &cfg.Postgres)
	if err != nil {
		return fmt.Errorf("init reposytory failed: %w", err)
	}
	defer repo.Close(ctx)

	tgCli := telegram.New()

	// TODO: init storage
	//stg, err := minioclient.New(ctx, cfg.Minio.HostPort, cfg.Minio.Username, cfg.Minio.Password, cfg.Minio.UseSSL)
	//if err != nil {
	//	return fmt.Errorf("init storage failed: %w", err)
	//}

	// TODO: init cache
	//cache, err := redisclient.NewClient(ctx, cfg.Redis.HostPort, cfg.Redis.Password)
	//if err != nil {
	//	return fmt.Errorf("init cache failed: %w", err)
	//}
	//defer cache.Close()

	srv := service.New(repo, tgCli, cfg.JWTSecret)

	// Джобы

	go func(ctx context.Context) {
		for {
			err := srv.UpdateActiveBotsJob(ctx)
			if err != nil {
				logger.Error(ctx, "update active bots failed", "err", err)
			}
			time.Sleep(time.Minute)
		}
	}(ctx)

	go func(ctx context.Context) {
		for {
			srv.ProcessTelegramUpdatesJob(ctx)
			time.Sleep(100 * time.Millisecond)
		}
	}(ctx)

	// Сервер

	r := router.New(ctx, srv, cfg.Listener.GetHostPort())

	server := httpserver.New(
		cfg.Listener.GetHostPort(), r,
		cfg.Listener.ReadTimeout,
		cfg.Listener.WriteTimeout,
		cfg.Listener.IdleTimeout,
	)

	logger.Info(ctx, "starting http server", "host_port", cfg.Listener.GetHostPort())
	if err = server.Run(); err != nil {
		return fmt.Errorf("failed run server: %w", err)
	}

	return nil
}
