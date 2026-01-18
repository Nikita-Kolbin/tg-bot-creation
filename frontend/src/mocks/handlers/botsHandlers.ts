import { http, HttpResponse } from 'msw'

import type { Bot, CreateBotDto } from '../../types/bot'

const MOCK_BOTS: Bot[] = [
	{
		id: '1',
		name: 'Demo Bot 1',
		description: 'Demo description 1',
		avatarUrl: null,
		tokenMask: null,
		createdAt: new Date().toISOString(),
		active: true,
		link: 'https://t.me/demo_bot_1',
	},
	{
		id: '2',
		name: 'Demo Bot 2',
		description: 'Demo description 2',
		avatarUrl: null,
		tokenMask: null,
		createdAt: new Date().toISOString(),
		active: false,
		link: 'https://t.me/demo_bot_2',
	},
]

export const botsHandlers = [
	http.get('/api/bot/list', () => {
		return HttpResponse.json(MOCK_BOTS)
	}),

	http.get('/api/bot/:id', ({ params }) => {
		const { id } = params
		const bot = MOCK_BOTS.find(b => b.id === id)
		if (!bot) {
			return HttpResponse.json({ message: 'Бот не найден' }, { status: 404 })
		}
		return HttpResponse.json({
			id: parseInt(bot.id),
			name: bot.name,
			description: bot.description,
			status: bot.active ? 'active' : 'inactive',
			created_at: bot.createdAt,
		})
	}),

	http.post('/api/bot/create', async ({ request }) => {
		const body = (await request.json()) as CreateBotDto
		const newBot: Bot = {
			id: String(MOCK_BOTS.length + 1),
			name: body.name,
			description: body.description,
			avatarUrl: null,
			tokenMask: null,
			createdAt: new Date().toISOString(),
			active: true,
			link: `https://t.me/${body.name.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(Math.random() * 10000)}`,
		}
		MOCK_BOTS.unshift(newBot)
		return HttpResponse.json(newBot, { status: 201 })
	}),

	http.put('/api/bot/:id', async ({ params, request }) => {
		const { id } = params
		const body = (await request.json()) as {
			name: string
			description: string
			status: string
			token: string
		}
		const index = MOCK_BOTS.findIndex(b => b.id === id)
		if (index === -1) {
			return HttpResponse.json({ message: 'Бот не найден' }, { status: 404 })
		}
		MOCK_BOTS[index] = {
			...MOCK_BOTS[index],
			name: body.name,
			description: body.description,
			active: body.status === 'active',
		}
		return HttpResponse.json({
			id: parseInt(MOCK_BOTS[index].id),
			name: MOCK_BOTS[index].name,
			description: MOCK_BOTS[index].description,
			status: MOCK_BOTS[index].active ? 'active' : 'inactive',
			created_at: MOCK_BOTS[index].createdAt,
		})
	}),

	http.delete('/api/bot/:id', ({ params }) => {
		const { id } = params
		const index = MOCK_BOTS.findIndex(b => b.id === id)
		if (index === -1) {
			return HttpResponse.json({ message: 'Бот не найден' }, { status: 404 })
		}
		MOCK_BOTS.splice(index, 1)
		return HttpResponse.json({ message: 'Бот удален' })
	}),
]
