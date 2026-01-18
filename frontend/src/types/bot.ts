export type Bot = {
	id: string
	name: string
	description?: string
	avatarUrl?: string | null
	tokenMask: string | null
	createdAt: string // ISO date
	active: boolean
	link?: string // ссылка для копирования
}

export type CreateBotDto = {
	name: string
	description: string
	token: string
}

export type UpdateBotDto = {
	name: string
	description: string
	status: string
	token: string
}

export type Product = {
	id: string
	botId: string
	name: string
	description: string
	pictureUrls: string[]
	previewUrl: string
	price: number
	active: boolean
	createdAt: string
	updatedAt: string
}

export type ScenarioStep = {
	number: number
	text: string
	coord_x: number
	coord_y: number
	buttons: ScenarioButton[]
}

export type ScenarioButton = {
	text: string
	next_step: number
export type CartItem = {
	id: string
	product_id: string
	quantity: number
	totalPrice?: number // опционально, рассчитывается как quantity * Product.price
	userId?: string // опционально, если корзина привязана к пользователю
}

export type Order = {
	id: string
	username: string
	status: string
	total: number
	createdAt: string
	items: Product[]
}

export type GetScenarioResponse = {
	steps: ScenarioStep[]
	botId: string
	username: string
	status: string
	totalAmount: number
	items: OrderItem[]
	createdAt: string
}

export type OrderItem = {
	productId: string
	product: Product
	quantity: number
	price: number
}
