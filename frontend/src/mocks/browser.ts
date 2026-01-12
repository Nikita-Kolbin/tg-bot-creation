import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/authHandlers'
import { botsHandlers } from './handlers/botsHandlers'
import { productsHandlers } from './handlers/productsHandlers'

export const worker = setupWorker(
	...authHandlers,
	...botsHandlers,
	...productsHandlers
)
