import React, { useState } from 'react'

type Props = {
	mode: 'signin' | 'signup'
	onSubmit: (data: { email: string; password: string }) => void
	loading?: boolean
	error?: string | null
}

export const AuthForm: React.FC<Props> = ({
	mode,
	onSubmit,
	loading,
	error,
}) => {
	
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	return (
		<form
			onSubmit={e => {
				e.preventDefault()
				onSubmit({ email, password })
			}}
			style={{ maxWidth: 420, margin: '0 auto' }}
		>
			<h2 style={{ textTransform: 'capitalize' }}>{mode.replace('-', ' ')}</h2>

			

			<div style={{ marginBottom: 12 }}>
				<label>Email</label>
				<input
					required
					type='email'
					value={email}
					onChange={e => setEmail(e.target.value)}
					placeholder='email@example.com'
					style={{ width: '100%', padding: 8 }}
				/>
			</div>

			<div style={{ marginBottom: 12 }}>
				<label>Password</label>
				<input
					required
					type='password'
					value={password}
					onChange={e => setPassword(e.target.value)}
					placeholder='min 6 chars'
					style={{ width: '100%', padding: 8 }}
				/>
			</div>

			{error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

			<button type='submit' disabled={loading} style={{ padding: '10px 16px' }}>
				{loading
					? 'Please wait...'
					: mode === 'signin'
						? 'Sign in'
						: 'Create account'}
			</button>
		</form>
	)
}
