import React from 'react'
import { useSignInMutation } from '../features/auth/authApi'
import { useAppDispatch } from '../app/hooks'
import { setCredentials } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { AuthForm } from '../features/auth/AuthForm'

const SignIn: React.FC = () => {
	const [signIn, { isLoading }] = useSignInMutation()
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [error, setError] = React.useState<string | null>(null)

	const handleSubmit = async (data: { email: string; password: string }) => {
		setError(null)
		try {
			const res = await signIn(data).unwrap()
			dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }))
			navigate('/') // redirect to dashboard
		} catch (err: any) {
			setError(err?.data?.message || err?.message || 'Sign-in failed')
		}
	}

	return (
		<div style={{ padding: 24 }}>
			<AuthForm
				mode='signin'
				onSubmit={handleSubmit}
				loading={isLoading}
				error={error}
			/>
			<div style={{ marginTop: 12 }}>
				<span>Don't have an account? </span>
				<Link to='/signup'>Sign up</Link>
			</div>
		</div>
	)
}

export default SignIn
