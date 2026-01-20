// src/pages/SignIn.tsx
import React from 'react'
import { useSignInMutation } from '../features/auth/authApi'
import { useAppDispatch } from '../app/hooks'
import { setCredentials } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { signInSchema } from '../features/auth/validation'
import { TextField, Button, Box, Alert, Grid, Typography } from '@mui/material'
import AuthLayout from '../components/ui/AuthLayout'

type FormValues = { email: string; password: string }

const SignIn: React.FC = () => {
	const [signIn, { isLoading }] = useSignInMutation()
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [serverError, setServerError] = React.useState<string | null>(null)

	const { control, handleSubmit } = useForm<FormValues>({
		resolver: yupResolver(signInSchema),
		defaultValues: { email: '', password: '' },
	})

	const onSubmit = async (data: FormValues) => {
		setServerError(null)
		try {
			const res = await signIn(data).unwrap()
			dispatch(
				setCredentials({
					user: res.user,
					token: res.token,
				})
			)
			navigate('/')
		} catch (err: any) {
			setServerError(err?.data?.message || err?.message || 'Ошибка входа')
		}
	}

	return (
		<AuthLayout title='Вход в панель' subtitle='Введите ваш email и пароль'>
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
									autoComplete='current-password'
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
							{isLoading ? 'Выполняется...' : 'Войти'}
						</Button>
					</Grid>

					<Grid item xs={12}>
						<Typography variant='body2' align='center'>
							Нет аккаунта? <Link to='/signup'>Регистрация</Link>
						</Typography>
					</Grid>
				</Grid>
			</Box>
		</AuthLayout>
	)
}

export default SignIn
