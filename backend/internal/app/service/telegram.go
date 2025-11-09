package service

import (
	"context"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
	"sync"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
)

const tgBotLimit = 100

func (s *Service) ProcessTelegramUpdatesJob(ctx context.Context) {
	wg := &sync.WaitGroup{}

	bots := s.getActiveBots()

	wg.Add(len(bots))

	for _, bot := range bots {
		b := *bot
		go func(ctx context.Context, bot model.Bot, wg *sync.WaitGroup) {
			defer wg.Done()
			err := s.parseTgBotUpdates(ctx, &b)
			if err != nil {
				logger.Error(ctx, "failed to process telegram updates", "err", err.Error(), "bot_id", bot.ID)
			}
		}(ctx, b, wg)
	}

	wg.Wait()
}

func (s *Service) parseTgBotUpdates(ctx context.Context, bot *model.Bot) error {
	offset, err := s.repo.GetBotTgOffset(ctx, bot.ID)
	if err != nil {
		return err // TODO: везде врапнуть ошибки
	}

	// TODO: Обработать невалидные токены, например офать ботов (можно на моменте обновления ботов)
	updates, err := s.tgClient.Updates(bot.Token, offset, tgBotLimit)
	if err != nil {
		return err
	}

	if len(updates) > 0 {
		err = s.repo.UpdateBotTgOffset(ctx, bot.ID, updates[len(updates)-1].ID+1)
		if err != nil {
			return err
		}
	}

	go s.processTelegramUpdates(ctx, bot, updates)

	return nil
}

func (s *Service) processTelegramUpdates(ctx context.Context, bot *model.Bot, updates []*model.Update) {
	for _, update := range updates {
		// TODO: это заглушка
		_, _ = s.tgClient.Send(bot.Token, update.Message.Chat.ID, "Сообщение обработано сервисом tg-bot-creation", false)
		logger.Info(ctx, "processed telegram update", "bot_id", bot.ID, "message_id", update.Message.Text)
	}
}
