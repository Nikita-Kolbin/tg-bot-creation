package service

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

func (s *Service) CreateBot(ctx context.Context, bot *model.Bot) (*model.Bot, error) {
	return s.repo.CreateBot(ctx, bot)
}

func (s *Service) UpdateActiveBotsJob(ctx context.Context) error {
	bots, err := s.repo.GetActiveBots(ctx)
	if err != nil {
		return err
	}

	s.updateActiveBots(bots)

	return nil
}

func (s *Service) getActiveBots() []*model.Bot {
	s.activeBotsMU.Lock()
	defer s.activeBotsMU.Unlock()

	return s.activeBots
}

func (s *Service) updateActiveBots(bots []*model.Bot) {
	s.activeBotsMU.Lock()
	defer s.activeBotsMU.Unlock()

	s.activeBots = bots
}
