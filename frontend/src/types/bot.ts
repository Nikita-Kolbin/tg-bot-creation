export type Bot = {
	id: string
	name: string
	avatarUrl?: string | null
	createdAt: string // ISO date
	active: boolean
	link?: string // ссылка для копирования
}
