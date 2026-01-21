import { apiSlice } from '../../api/apiSlice'
import type {
	Bot,
	CreateBotDto,
	UpdateBotDto,
	Product,
	CartItem,
	Order,
	GetScenarioResponse,
	ScenarioStep,
} from '../../types/bot'

export const botsApi = apiSlice.injectEndpoints({
	endpoints: build => ({
		getBots: build.query<Bot[], void>({
			query: () => ({ url: '/api/bot/list', method: 'GET' }),
			transformResponse: (response: {
				bots: {
					id: number
					name: string
					username: string
					description: string
					created_at: string
					status: string
					token_mask: string
				}[]
			}) =>
				response.bots.map(bot => ({
					id: bot.id.toString(),
					name: bot.name,
					username: bot.username,
					description: bot.description,
					avatarUrl: null,
					tokenMask: bot.token_mask,
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
			transformResponse: (response: {
				id: number
				name: string
				username: string
				description: string
				created_at: string
				status: string
				token_mask: string
			}) => ({
				id: response.id.toString(),
				name: response.name,
				username: response.username,
				description: response.description,
				avatarUrl: null,
				tokenMask: response.token_mask,
				createdAt: response.created_at,
				active: response.status === 'active',
				link: `https://t.me/${response.name.toLowerCase().replace(/\s+/g, '_')}`,
			}),
			providesTags: id => [{ type: 'Bots', id }],
		}),
		createBot: build.mutation<Bot, CreateBotDto>({
			query: body => ({ url: '/api/bot/create', method: 'POST', body }),
			transformResponse: (response: {
				id: number
				name: string
				username: string
				description: string
				created_at: string
				status: string
			}) => ({
				id: response.id.toString(),
				name: response.name,
				username: response.username,
				description: response.description,
				avatarUrl: null,
				tokenMask: null,
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
			query: ({ id, data }) => ({
				url: `/api/bot/${id}`,
				method: 'PUT',
				body: data,
			}),
			transformResponse: (response: {
				id: number
				name: string
				username: string
				description: string
				created_at: string
				status: string
			}) => ({
				id: response.id.toString(),
				name: response.name,
				username: response.username,
				description: response.description,
				avatarUrl: null,
				tokenMask: null,
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
			transformResponse: (response: {
				products: {
					id: number
					bot_id: number
					name: string
					description: string
					picture_urls: string[]
					preview_url: string
					price: number
					active: boolean
					created_at: string
					updated_at: string
				}[]
			}) =>
				response.products.map(product => ({
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
			providesTags: botId => [{ type: 'Products', id: botId }],
		}),
		createProduct: build.mutation<
			Product,
			{
				botId: string
				data: {
					name: string
					description: string
					price: number
					picture_urls: string[]
					preview_url: string
					active: boolean
				}
			}
		>({
			query: ({ botId, data }) => ({
				url: `/api/bot/${botId}/product`,
				method: 'POST',
				body: data,
			}),
			transformResponse: (response: {
				id: number
				bot_id: number
				name: string
				description: string
				picture_urls: string[]
				preview_url: string
				price: number
				active: boolean
				created_at: string
				updated_at: string
			}) => ({
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
			invalidatesTags: (result, error, { botId }) => [
				{ type: 'Products', id: botId },
			],
		}),
		updateProduct: build.mutation<
			Product,
			{
				botId: string
				productId: string
				data: {
					active: boolean
					description: string
					name: string
					picture_urls: string[]
					preview_url: string
					price: number
				}
			}
		>({
			query: ({ botId, productId, data }) => ({
				url: `/api/bot/${botId}/product/${productId}`,
				method: 'PUT',
				body: data,
			}),
			transformResponse: (response: {
				id: number
				bot_id: number
				name: string
				description: string
				picture_urls: string[]
				preview_url: string
				price: number
				active: boolean
				created_at: string
				updated_at: string
			}) => ({
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
			invalidatesTags: (result, error, { botId }) => [
				{ type: 'Products', id: botId },
			],
		}),
		deleteProduct: build.mutation<void, { botId: string; productId: string }>({
			query: ({ botId, productId }) => ({
				url: `/api/bot/${botId}/product/${productId}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, { botId }) => [
				{ type: 'Products', id: botId },
			],
		}),
		getPublicProducts: build.query<Product[], string>({
			query: botId => ({
				url: `/api/bot/${botId}/active_products`,
				method: 'GET',
			}),
			transformResponse: (response: {
				products: {
					id: number
					bot_id: number
					name: string
					description: string
					picture_urls: string[]
					preview_url: string
					price: number
					active: boolean
					created_at: string
					updated_at: string
				}[]
			}) =>
				response.products.map(product => ({
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
			providesTags: (result, error, { botId }) => [
				{ type: 'Products', id: botId },
			],
		}),
		getCart: build.query<CartItem[], { botId: string; username: string }>({
			query: ({ botId, username }) => ({
				url: `/api/bot/${botId}/cart?username=${username}`,
				method: 'GET',
			}),
			transformResponse: (response: {
				items: {
					id: number
					product_id: number
					quantity: number
					totalPrice?: number
					userId?: string
				}[]
			}) =>
				response.items.map(item => ({
					id: item.id.toString(),
					product_id: item.product_id.toString(),
					quantity: item.quantity,
					totalPrice: item.totalPrice,
					userId: item.userId,
				})),
			providesTags: (result, error, { botId, username }) => [
				{ type: 'Cart', id: `${botId}-${username}` },
			],
		}),
		addToCart: build.mutation<
			{ success: boolean },
			{ botId: string; productId: string; quantity: number; username: string }
		>({
			query: ({ botId, productId, ...body }) => ({
				url: `/api/bot/${botId}/product/${productId}/cart`,
				method: 'POST',
				body,
			}),
			invalidatesTags: (result, error, { botId, username }) => [
				{ type: 'Cart', id: `${botId}-${username}` },
			],
		}),
		getUserOrders: build.query<Order[], { botId: string; username: string }>({
			query: ({ botId, username }) => ({
				url: `/api/bot/${botId}/orders/user`,
				method: 'GET',
				params: { username },
			}),
			transformResponse: (response: any, meta, arg) => {
				console.log('=== TRANSFORM RESPONSE DEBUG ===')
				console.log('Raw response:', response)

				// Проверка структуры ответа
				if (!response || typeof response !== 'object') {
					console.warn('Response is not an object:', response)
					return []
				}

				// Проверьте разные возможные структуры ответа
				const ordersArray = response.orders || response.data || response

				if (!Array.isArray(ordersArray)) {
					console.warn('Orders is not an array:', ordersArray)
					return []
				}

				return ordersArray
					.map((order: any, index: number) => {
						console.log(`Processing order ${index}:`, order)

						// Безопасные преобразования
						try {
							return {
								id: (order.id ?? order.order_id ?? '').toString(),
								botId: arg.botId,
								username: order.username || '',
								status: order.status || 'unknown',
								totalAmount: order.total_amount ?? order.totalAmount ?? 0,
								items: (Array.isArray(order.items) ? order.items : []).map(
									(item: any) => ({
										productId: (
											item.product_id ??
											item.productId ??
											''
										).toString(),
										product: {
											id: (item.product?.id ?? '').toString(),
											botId: (
												item.product?.bot_id ??
												item.product?.botId ??
												''
											).toString(),
											name: item.product?.name || '',
											description: item.product?.description || '',
											pictureUrls:
												item.product?.picture_urls ||
												item.product?.pictureUrls ||
												[],
											previewUrl:
												item.product?.preview_url ||
												item.product?.previewUrl ||
												'',
											price: item.product?.price || 0,
											active: item.product?.active ?? false,
											createdAt:
												item.product?.created_at ||
												item.product?.createdAt ||
												'',
											updatedAt:
												item.product?.updated_at ||
												item.product?.updatedAt ||
												'',
										},
										quantity: item.quantity || 0,
										price: item.price || 0,
									}),
								),
								createdAt: order.created_at || order.createdAt || '',
							}
						} catch (error) {
							console.error(`Error transforming order ${index}:`, error, order)
							return null
						}
					})
					.filter(Boolean)
			},
			providesTags: result =>
				result
					? [
							...result.map(({ id }) => ({ type: 'Orders' as const, id })),
							{ type: 'Orders', id: 'LIST' },
						]
					: [{ type: 'Orders', id: 'LIST' }],
		}),
		createOrder: build.mutation<void, { botId: string; username: string }>({
			query: ({ botId, username }) => ({
				url: `/api/bot/${botId}/order`,
				method: 'POST',
				body: { username },
			}),
			invalidatesTags: (result, error, { botId, username }) => [
				{ type: 'Cart', id: `${botId}-${username}` },
				{ type: 'Orders', id: `${botId}-${username}` },
			],
		}),
		getBotOrders: build.query<Order[], string>({
			query: botId => ({
				url: `/api/bot/${botId}/orders`,
				method: 'GET',
			}),
			transformResponse: (response: {
				orders: {
					id: number
					username: string
					status: string
					total_amount: number
					created_at: string
					items: {
						product_id: number
						product_name: string
						quantity: number
						price_at_purchase: number
					}[]
				}[]
			}) => {
				// Проверка на undefined/null
				if (!response || !response.orders) {
					console.warn('Invalid response structure:', response)
					return []
				}

				return response.orders.map(order => {
					// Безопасное преобразование с проверками
					return {
						id: order.id?.toString() || '',
						botId: '', // Сервер не возвращает botId в заказе
						username: order.username || '',
						status: order.status || '',
						totalAmount: order.total_amount || 0,
						items: (order.items || []).map(item => ({
							productId: item.product_id?.toString() || '',
							product: {
								id: item.product_id?.toString() || '', // Используем product_id как id продукта
								botId: '', // Не предоставляется сервером
								name: item.product_name || '',
								description: '', // Не предоставляется сервером
								pictureUrls: [], // Не предоставляется сервером
								previewUrl: '', // Не предоставляется сервером
								price: item.price_at_purchase || 0,
								active: true, // По умолчанию
								createdAt: '', // Не предоставляется сервером
								updatedAt: '', // Не предоставляется сервером
							},
							quantity: item.quantity || 0,
							price: item.price_at_purchase || 0,
						})),
						createdAt: order.created_at || '',
					}
				})
			},
			providesTags: (result, error, botId) => {
				const tags = [{ type: 'Orders' as const, id: botId }]

				if (result) {
					tags.push(
						...result.map(order => ({
							type: 'Orders' as const,
							id: `${botId}-${order.id}`,
						})),
					)
				}

				return tags
			},
		}),
		setScenario: build.mutation<void, { botId: number; steps: ScenarioStep[] }>(
			{
				query: ({ botId, steps }) => ({
					url: '/api/bot/scenario',
					method: 'POST',
					body: { bot_id: botId, steps },
				}),
			},
		),
		getScenario: build.query<GetScenarioResponse, string>({
			query: botId => ({ url: `/api/bot/${botId}/scenario`, method: 'GET' }),
			transformResponse: (response: GetScenarioResponse) => response,
		}),
		getProductById: build.query<Product, { botId: string; productId: string }>({
			query: ({ botId, productId }) => ({
				url: `/api/bot/${botId}/product/${productId}`,
				method: 'GET',
			}),
			transformResponse: (response: {
				id: number
				bot_id: number
				name: string
				description: string
				picture_urls: string[]
				preview_url: string
				price: number
				active: boolean
				created_at: string
				updated_at: string
			}) => ({
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
		}),
	}),
	overrideExisting: false,
})

export const {
	useGetBotsQuery,
	useGetBotByIdQuery,
	useCreateBotMutation,
	useDeleteBotMutation,
	useUpdateBotMutation,
	useGetProductsQuery,
	useCreateProductMutation,
	useUpdateProductMutation,
	useDeleteProductMutation,
	useGetPublicProductsQuery,
	useGetProductByIdQuery,
	useGetCartQuery,
	useAddToCartMutation,
	useGetUserOrdersQuery,
	useCreateOrderMutation,
	useGetBotOrdersQuery,
	useSetScenarioMutation,
	useGetScenarioQuery,
} = botsApi
