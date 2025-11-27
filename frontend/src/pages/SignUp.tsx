// src/pages/SignUp.tsx
import React from 'react'
import { useSignUpMutation } from '../features/auth/authApi'
import { useAppDispatch } from '../app/hooks'
import { setCredentials } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { signUpSchema } from '../features/auth/validation'
import { TextField, Button, Box, Alert, Grid, Typography } from '@mui/material'
import AuthLayout from '../components/ui/AuthLayout'

type FormValues = { email: string; password: string }

const SignUp: React.FC = () => {
	const [signUp, { isLoading }] = useSignUpMutation()
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [serverError, setServerError] = React.useState<string | null>(null)

	const { control, handleSubmit } = useForm<FormValues>({
		resolver: yupResolver(signUpSchema),
		defaultValues: { email: '', password: '' },
	})

	const onSubmit = async (data: FormValues) => {
		setServerError(null)
		try {
			const res = await signUp(data).unwrap()
			// если бек возвращает token, ставим
			if ((res as any).token) {
				dispatch(
					setCredentials({
						user: (res as any).user ?? { email: data.email },
						token: (res as any).token,
					})
				)
				navigate('/')
			} else {
				// если только message возвращает, показываем уведомление и перенаправляем
				alert((res as any).message || 'Успешно')
				navigate('/signin')
			}
		} catch (err: any) {
			setServerError(err?.data?.message || err?.message || 'Ошибка регистрации')
		}
	}

	return (
		<AuthLayout title='Регистрация' subtitle='Создайте аккаунт'>
			<Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Controller
							name='email'
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									label='Email'
									fullWidth
									autoComplete='email'
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</Grid>

					<Grid item xs={12}>
						<Controller
							name='password'
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									type='password'
									label='Пароль'
									fullWidth
									autoComplete='new-password'
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</Grid>

					{serverError && (
						<Grid item xs={12}>
							<Alert severity='error'>{serverError}</Alert>
						</Grid>
					)}

					<Grid item xs={12}>
						<Button
							type='submit'
							variant='contained'
							fullWidth
							disabled={isLoading}
						>
							{isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
						</Button>
					</Grid>

					<Grid item xs={12}>
						<Typography variant='body2' align='center'>
							Уже есть аккаунт? <Link to='/signin'>Войти</Link>
						</Typography>
					</Grid>
				</Grid>
			</Box>
		</AuthLayout>
	)
}

export default SignUp
