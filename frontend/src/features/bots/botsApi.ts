import { apiSlice } from '../../api/apiSlice'
import type { Bot } from '../../types/bot'

export const botsApi = apiSlice.injectEndpoints({
	endpoints: build => ({
		getBots: build.query<Bot[], void>({
			query: () => ({ url: '/api/bots', method: 'GET' }),
			providesTags: result =>
				result
					? [
							...result.map(bot => ({ type: 'Bots' as const, id: bot.id })),
							{ type: 'Bots', id: 'LIST' },
						]
					: [{ type: 'Bots', id: 'LIST' }],
		}),
		createBot: build.mutation<Bot, Partial<Bot>>({
			query: body => ({ url: '/api/bots', method: 'POST', body }),
			invalidatesTags: [{ type: 'Bots', id: 'LIST' }],
		}),
		// optional: updateBot, deleteBot...
	}),
	overrideExisting: false,
})

export const { useGetBotsQuery, useCreateBotMutation } = botsApi
