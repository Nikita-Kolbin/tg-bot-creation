export type User = {
	id: string
	username: string
	role?: string
}

export type AuthResponse = {
	user: User
	token: string
}

export type SignInDto = {
	username: string
	password: string
}

export type SignUpDto = {
	username: string
	password: string
}
