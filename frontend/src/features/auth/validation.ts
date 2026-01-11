import * as yup from 'yup'

export const signInSchema = yup.object({
	email: yup.string().email('Неверный email').required('Введите email'),
	password: yup
		.string()
		.min(6, 'Минимум 6 символов')
		.required('Введите пароль'),
})

export const signUpSchema = yup.object({
	email: yup.string().email('Неверный email').required('Введите email'),
	password: yup
		.string()
		.min(6, 'Минимум 6 символов')
		.required('Введите пароль'),
})
