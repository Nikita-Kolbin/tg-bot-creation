export type User = {
	id: string
	email: string
	role?: string
}

export type AuthResponse = {
	user: User
	accessToken: string
}

export type SignInDto = {
	email: string
	password: string
}

export type SignUpDto = {
	email: string
	password: string
}
