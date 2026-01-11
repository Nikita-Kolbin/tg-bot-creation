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
