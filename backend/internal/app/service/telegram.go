package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"sync"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/pkg/logger"
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
	if errors.Is(err, sql.ErrNoRows) {
		return nil
	}
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

	for _, update := range updates {
		go s.processTelegramUpdate(ctx, bot, update)
	}

	return nil
}

func (s *Service) processTelegramUpdate(ctx context.Context, bot *model.Bot, update *model.Update) {

	msg := update.Message.Text

	// TODO: вынести в константы
	if msg == "/start" {
		err := s.repo.UpsertTgUserStep(ctx, &model.TgUserStep{
			BotID:    bot.ID,
			Username: update.Message.From.Username,
			Number:   0,
		})
		if err != nil {
			logger.Error(ctx, "failed to create telegram step", "err", err.Error(),
				"bot_id", bot.ID,
				"username", update.Message.From.Username,
			)
			return
		}

		err = s.sendCurrentStepToUser(ctx, bot, update)
		if err != nil {
			logger.Error(ctx, "failed to send telegram step", "err", err.Error(), "bot_id", bot.ID)
			return
		}
		return
	}

	err := s.updateCurrentStepToUser(ctx, bot, update)
	if err != nil {
		logger.Error(ctx, "failed to update telegram step", "err", err.Error(), "bot_id", bot.ID)
		return
	}

	err = s.sendCurrentStepToUser(ctx, bot, update)
	if err != nil {
		logger.Error(ctx, "failed to send telegram step", "err", err.Error(), "bot_id", bot.ID)
		return
	}
}

func (s *Service) sendCurrentStepToUser(ctx context.Context, bot *model.Bot, update *model.Update) error {
	stepNumber, err := s.repo.GetCurrentStepNumber(ctx, update.Message.From.Username, bot.ID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("failed to get current step number: %w", err)
	}

	step, buttons, err := s.repo.GetStepWithButtonsMap(ctx, bot.ID, stepNumber)
	if err != nil {
		return fmt.Errorf("failed to get current step: %w", err)
	}

	keyboard := &model.ReplyKeyboardMarkup{
		Keyboard:        make([][]model.KeyboardButton, 0, len(buttons)),
		ResizeKeyboard:  true,
		OneTimeKeyboard: false, // Новые кнопки будут заменять старые, так плавнее.
	}
	for _, uuid := range step.ButtonUUIDs {
		button := buttons[uuid]
		kb := model.KeyboardButton{
			Text: button.Text,
		}
		keyboard.Keyboard = append(keyboard.Keyboard, []model.KeyboardButton{kb})
	}

	resp, err := s.tgClient.SendWithReplyKeyboard(bot.Token, update.Message.Chat.ID, step.Text, keyboard, false)
	if err != nil {
		return fmt.Errorf("failed to send telegram message: %w", err)
	}

	logger.Info(ctx, "telegram message with keyboard send", "bot_id", bot.ID, "ok", resp.Ok)

	return nil
}

func (s *Service) updateCurrentStepToUser(ctx context.Context, bot *model.Bot, update *model.Update) error {
	stepNumber, err := s.repo.GetCurrentStepNumber(ctx, update.Message.From.Username, bot.ID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("failed to get current step number: %w", err)
	}

	_, buttons, err := s.repo.GetStepWithButtonsMap(ctx, bot.ID, stepNumber)
	if err != nil {
		return fmt.Errorf("failed to get current step: %w", err)
	}

	for _, button := range buttons {
		if button.Text == update.Message.Text {
			err := s.repo.UpsertTgUserStep(ctx, &model.TgUserStep{
				BotID:    bot.ID,
				Username: update.Message.From.Username,
				Number:   button.NextStep,
			})
			if err != nil {
				return fmt.Errorf("failed to create telegram step: %w", err)
			}
			break
		}
	}

	logger.Info(ctx, "current step updated successful", "bot_id", bot.ID, "ok", "username", update.Message.From.Username)

	return nil
}
