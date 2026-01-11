import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/authHandlers'
import { botsHandlers } from './handlers/botsHandlers'

export const worker = setupWorker(...authHandlers, ...botsHandlers)
