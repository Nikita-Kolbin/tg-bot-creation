package service

type repository interface {
	// Methods
}

type tgClient interface {
	// Methods
}

type Service struct {
	repo     repository
	tgClient tgClient
}

func New(repo repository, tgCli tgClient) *Service {
	return &Service{
		repo:     repo,
		tgClient: tgCli,
	}
}
