// Декларации типов для Telegram WebApp
declare global {
	interface Window {
		Telegram: {
			WebApp: {
				ready(): void
				initDataUnsafe: {
					user?: {
						username?: string
					}
				}
			}
		}
	}
}

/**
 * Инициализирует Telegram Web App
 */
export function initTelegramWebApp(): void {
	window.Telegram.WebApp.ready()
}

/**
 * Получает username пользователя из Telegram WebApp
 * @returns username или null, если не доступно
 */
export function getTelegramUsername(): string | null {
	return window.Telegram.WebApp.initDataUnsafe.user?.username || null
}
