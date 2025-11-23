compose_up:
	docker compose --env-file ./backend/env/.env up -d

compose_down:
	docker compose down

compose_drop:
	docker compose down -v

compose_rebuild:
	docker compose down -v
	docker compose --env-file ./backend/env/.env up -d --build --force-recreate

# Накатить миграции
compose_migrate:
	docker compose --env-file ./backend/env/.env -p tg-bot-creation up -d migrate --build --force-recreate

# Перебилдить бэк
compose_backend:
	docker compose --env-file ./backend/env/.env -p tg-bot-creation up -d backend --build --force-recreate



# Создание миграции
# migrate create -ext sql -dir ./backend/migrations -seq <name>

swagger:
	swag init -g ./backend/cmd/main.go -o ./backend/docs
