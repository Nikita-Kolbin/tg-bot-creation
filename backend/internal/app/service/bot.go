package service

import (
	"context"

	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/api/dto"
	"github.com/Nikita-Kolbin/tg-bot-creation/backend/internal/app/model"
	"github.com/google/uuid"
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

func (s *Service) IsBotOwner(ctx context.Context, botID int, userID int) (bool, error) {
	return s.repo.IsBotOwner(ctx, botID, userID)
}

func (s *Service) UpdateBotScenario(ctx context.Context, scenario *dto.SetBotScenarioRequest) error {
	steps := make([]*model.Step, 0)
	buttons := make([]*model.Button, 0)

	for _, step := range scenario.Steps {
		stepModel := &model.Step{
			Number:      step.Number,
			BotID:       scenario.BotID,
			Text:        step.Text,
			CoordX:      step.CoordX,
			CoordY:      step.CoordY,
			ButtonUUIDs: make([]string, 0),
		}

		for _, button := range step.Buttons {
			id, _ := uuid.NewUUID()
			buttonModel := &model.Button{
				UUID:     id.String(),
				Text:     button.Text,
				NextStep: button.NextStepNumber,
				BotID:    scenario.BotID,
			}

			stepModel.ButtonUUIDs = append(stepModel.ButtonUUIDs, id.String())
			buttons = append(buttons, buttonModel)
		}

		steps = append(steps, stepModel)
	}

	return s.repo.UpdateScenario(ctx, scenario.BotID, steps, buttons)
}

func (s *Service) GetBotScenario(ctx context.Context, botID int) (*dto.GetBotScenarioResponse, error) {
	steps, buttons, err := s.repo.GetScenarioByBotID(ctx, botID)
	if err != nil {
		return nil, err
	}

	req := &dto.GetBotScenarioResponse{
		Steps: make([]*dto.Step, 0, len(steps)),
	}

	for _, step := range steps {
		stepDTO := &dto.Step{
			Number:  step.Number,
			Text:    step.Text,
			CoordX:  step.CoordX,
			CoordY:  step.CoordY,
			Buttons: make([]*dto.Button, 0, len(step.ButtonUUIDs)),
		}

		for _, id := range step.ButtonUUIDs {
			button := buttons[id]
			if button == nil {
				continue
			}

			buttonDTO := &dto.Button{
				Text:           button.Text,
				NextStepNumber: button.NextStep,
			}

			stepDTO.Buttons = append(stepDTO.Buttons, buttonDTO)
		}

		req.Steps = append(req.Steps, stepDTO)
	}

	return req, nil
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
