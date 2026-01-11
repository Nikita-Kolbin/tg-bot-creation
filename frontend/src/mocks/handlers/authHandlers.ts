import { http, HttpResponse } from 'msw'

interface AuthRequestBody {
	email: string
	password: string
}

const mockUsers: AuthRequestBody[] = [
	{
		email: '1@1.ru',
		password: '1@1.ru',
	},
]

export const authHandlers = [
	// Регистрация
	http.post('/api/user/sign-up', async ({ request }) => {
		const body = (await request.json()) as AuthRequestBody
		const { email, password } = body

		const exists = mockUsers.find(u => u.email === email)
		if (exists) {
			return HttpResponse.json(
				{ message: 'Пользователь уже существует' },
				{ status: 400 }
			)
		}

		mockUsers.push({ email, password })
		return HttpResponse.json({
			message: 'Регистрация успешна',
			token: 'mock-token',
		})
	}),

	// Авторизация
	http.post('/api/user/sign-in', async ({ request }) => {
		const body = (await request.json()) as AuthRequestBody
		const { email, password } = body

		const user = mockUsers.find(
			u => u.email === email && u.password === password
		)
		if (!user) {
			return HttpResponse.json(
				{ message: 'Неверный логин или пароль' },
				{ status: 401 }
			)
		}

		return HttpResponse.json({
			message: 'Авторизация успешна',
			token: 'mock-token',
		})
	}),
]
