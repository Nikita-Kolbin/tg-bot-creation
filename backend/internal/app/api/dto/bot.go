package dto

import "errors"

type BotCreateRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Token       string `json:"token"`
}

type BotResponse struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      string `json:"status"`
	OwnerUserID int    `json:"owner_user_id"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type BotsListResponse struct {
	Bots []*BotResponse `json:"bots"`
}

type BotUpdateRequest struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	Token       *string `json:"token,omitempty"`
	Status      *string `json:"status,omitempty"`
}

type SetBotScenarioRequest struct {
	BotID int     `json:"bot_id"`
	Steps []*Step `json:"steps"`
}

type Step struct {
	Number  int       `json:"number"`
	Text    string    `json:"text"`
	CoordX  int16     `json:"coord_x"`
	CoordY  int16     `json:"coord_y"`
	Buttons []*Button `json:"buttons"`
}

type Button struct {
	Text           string `json:"text"`
	NextStepNumber int    `json:"next_step"`
}

func ValidateSetBotScenarioRequest(req *SetBotScenarioRequest) error {
	if req == nil {
		return errors.New("nil SetBotScenarioRequest")
	}

	if len(req.Steps) == 0 {
		return errors.New("steps cannot be empty")
	}

	validNumbers := make(map[int]struct{}, len(req.Steps))
	for _, step := range req.Steps {
		if step.Number < 0 {
			return errors.New("step number must be greater than or equal to 0")
		}
		if _, exists := validNumbers[step.Number]; exists {
			return errors.New("step numbers must be unique")
		}
		validNumbers[step.Number] = struct{}{}
	}

	if _, ok := validNumbers[0]; !ok {
		return errors.New("step with number 0 must be exists")
	}

	for _, step := range req.Steps {
		for _, btn := range step.Buttons {
			n := btn.NextStepNumber
			if n != 0 {
				if _, ok := validNumbers[n]; !ok {
					return errors.New("button next_step must one of existing step numbers")
				}
			}
		}
	}

	return nil
}

type GetBotScenarioResponse struct {
	Steps []*Step `json:"steps"`
}
