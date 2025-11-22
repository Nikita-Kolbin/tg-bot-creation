import React from 'react'
import { useSignUpMutation } from '../features/auth/authApi'
import { useAppDispatch } from '../app/hooks'
import { setCredentials } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { AuthForm } from '../features/auth/AuthForm'

const SignUp: React.FC = () => {
	const [signUp, { isLoading }] = useSignUpMutation()
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [error, setError] = React.useState<string | null>(null)

	const handleSubmit = async (data: {
		email: string
		password: string
	}) => {
		setError(null)
		try {
			const res = await signUp(data as any).unwrap()
			dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }))
			navigate('/') // redirect to dashboard
		} catch (err: any) {
			setError(err?.data?.message || err?.message || 'Sign-up failed')
		}
	}

	return (
		<div style={{ padding: 24 }}>
			<AuthForm
				mode='signup'
				onSubmit={handleSubmit}
				loading={isLoading}
				error={error}
			/>
			<div style={{ marginTop: 12 }}>
				<span>Already have an account? </span>
				<Link to='/signin'>Sign in</Link>
			</div>
		</div>
	)
}

export default SignUp
