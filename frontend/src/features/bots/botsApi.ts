import { apiSlice } from '../../api/apiSlice'
import type { Bot, CreateBotDto, UpdateBotDto, Product } from '../../types/bot'

export const botsApi = apiSlice.injectEndpoints({
	endpoints: build => ({
		getBots: build.query<Bot[], void>({
			query: () => ({ url: '/api/bot/list', method: 'GET' }),
			transformResponse: (response: { bots: { id: number; name: string; description: string; created_at: string; status: string }[] }) => response.bots.map(bot => ({
				id: bot.id.toString(),
				name: bot.name,
				description: bot.description,
				avatarUrl: null,
				createdAt: bot.created_at,
				active: bot.status === 'active',
				link: `https://t.me/${bot.name.toLowerCase().replace(/\s+/g, '_')}`,
			})),
			providesTags: result =>
				result
					? [
							...result.map(bot => ({ type: 'Bots' as const, id: bot.id })),
							{ type: 'Bots', id: 'LIST' },
						]
					: [{ type: 'Bots', id: 'LIST' }],
		}),
		getBotById: build.query<Bot, string>({
			query: id => ({ url: `/api/bot/${id}`, method: 'GET' }),
			transformResponse: (response: { id: number; name: string; description: string; created_at: string; status: string }) => ({
				id: response.id.toString(),
				name: response.name,
				description: response.description,
				avatarUrl: null,
				createdAt: response.created_at,
				active: response.status === 'active',
				link: `https://t.me/${response.name.toLowerCase().replace(/\s+/g, '_')}`,
			}),
			providesTags: (result, error, id) => [{ type: 'Bots', id }],
		}),
		createBot: build.mutation<Bot, CreateBotDto>({
			query: body => ({ url: '/api/bot/create', method: 'POST', body }),
			transformResponse: (response: { id: number; name: string; description: string; created_at: string; status: string }) => ({
				id: response.id.toString(),
				name: response.name,
				description: response.description,
				avatarUrl: null,
				createdAt: response.created_at,
				active: response.status === 'active',
				link: `https://t.me/${response.name.toLowerCase().replace(/\s+/g, '_')}`,
			}),
			invalidatesTags: [{ type: 'Bots', id: 'LIST' }],
		}),
		deleteBot: build.mutation<void, string>({
			query: id => ({ url: `/api/bot/${id}`, method: 'DELETE' }),
			invalidatesTags: [{ type: 'Bots', id: 'LIST' }],
		}),
		updateBot: build.mutation<Bot, { id: string; data: UpdateBotDto }>({
			query: ({ id, data }) => ({ url: `/api/bot/${id}`, method: 'PUT', body: data }),
			transformResponse: (response: { id: number; name: string; description: string; created_at: string; status: string }) => ({
				id: response.id.toString(),
				name: response.name,
				description: response.description,
				avatarUrl: null,
				createdAt: response.created_at,
				active: response.status === 'active',
				link: `https://t.me/${response.name.toLowerCase().replace(/\s+/g, '_')}`,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'Bots', id },
				{ type: 'Bots', id: 'LIST' },
			],
		}),
		getProducts: build.query<Product[], string>({
			query: botId => ({ url: `/api/bot/${botId}/products`, method: 'GET' }),
			transformResponse: (response: { products: { id: number; bot_id: number; name: string; description: string; picture_urls: string[]; preview_url: string; price: number; active: boolean; created_at: string; updated_at: string }[] }) => response.products.map(product => ({
				id: product.id.toString(),
				botId: product.bot_id.toString(),
				name: product.name,
				description: product.description,
				pictureUrls: product.picture_urls,
				previewUrl: product.preview_url,
				price: product.price,
				active: product.active,
				createdAt: product.created_at,
				updatedAt: product.updated_at,
			})),
			providesTags: (result, error, botId) => [{ type: 'Products', id: botId }],
		}),
		createProduct: build.mutation<Product, { botId: string; data: { name: string; description: string; price: number; picture_urls: string[]; preview_url: string; active: boolean } }>({
			query: ({ botId, data }) => ({ url: `/api/bot/${botId}/product`, method: 'POST', body: data }),
			transformResponse: (response: { id: number; bot_id: number; name: string; description: string; picture_urls: string[]; preview_url: string; price: number; active: boolean; created_at: string; updated_at: string }) => ({
				id: response.id.toString(),
				botId: response.bot_id.toString(),
				name: response.name,
				description: response.description,
				pictureUrls: response.picture_urls,
				previewUrl: response.preview_url,
				price: response.price,
				active: response.active,
				createdAt: response.created_at,
				updatedAt: response.updated_at,
			}),
			invalidatesTags: (result, error, { botId }) => [{ type: 'Products', id: botId }],
		}),
	}),
	overrideExisting: false,
})

export const { useGetBotsQuery, useGetBotByIdQuery, useCreateBotMutation, useDeleteBotMutation, useUpdateBotMutation, useGetProductsQuery, useCreateProductMutation } = botsApi
