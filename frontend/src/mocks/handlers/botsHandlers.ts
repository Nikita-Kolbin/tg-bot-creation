import { http, HttpResponse } from 'msw'

import type { Bot } from '../../types/bot'

let MOCK_BOTS: Bot[] = [
	{
		id: '1',
		name: 'Demo Bot 1',
		avatarUrl: null,
		createdAt: new Date().toISOString(),
		active: true,
		link: 'https://t.me/demo_bot_1',
	},
	{
		id: '2',
		name: 'Demo Bot 2',
		avatarUrl: null,
		createdAt: new Date().toISOString(),
		active: false,
		link: 'https://t.me/demo_bot_2',
	},
]

export const botsHandlers = [
	http.get('/api/bots', () => {
		return HttpResponse.json(MOCK_BOTS)
	}),

	http.post('/api/bots', async ({ request }) => {
		const body = (await request.json()) as Partial<Bot>
		const newBot: Bot = {
			id: '3',
			name: body.name ?? 'New bot',
			avatarUrl: body.avatarUrl ?? null,
			createdAt: new Date().toISOString(),
			active: body.active ?? true,
			link:
				body.link ?? `https://t.me/newbot_${Math.floor(Math.random() * 10000)}`,
		}
		MOCK_BOTS.unshift(newBot)
		return HttpResponse.json(newBot, { status: 201 })
	}),
]
