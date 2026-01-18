import { http, HttpResponse } from 'msw'

import type { Product } from '../../types/bot'

const MOCK_PRODUCTS: Product[] = [
	{
		id: '1',
		botId: '1',
		name: 'Product 1',
		description: 'Description for product 1',
		pictureUrls: [],
		previewUrl: '',
		price: 1,
		active: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		botId: '1',
		name: 'Product 2',
		description: 'Description for product 2',
		pictureUrls: [],
		previewUrl: '',
		price: 2,
		active: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
]

export const productsHandlers = [
	http.get('/api/bot/:botId/active_products', ({ params }) => {
		const { botId } = params
		const products = MOCK_PRODUCTS.filter(p => p.botId === botId && p.active)
		return HttpResponse.json({ products })
	}),
]
