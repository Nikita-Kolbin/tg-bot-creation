import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { PrivateRoute } from './routes/PrivateRoute'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { logout } from './features/auth/authSlice'
import Dashboard from './pages/Dashboard'

const App: React.FC = () => {
	const dispatch = useAppDispatch()
	const token = useAppSelector(s => s.auth.token)

	return (
		<div>
			{/* <header
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					padding: 12,
				}}
			>
				<div>
					<Link to='/'>TG Platform</Link>
				</div>
				<div>
					{token ? (
						<>
							<button onClick={() => dispatch(logout())}>Logout</button>
						</>
					) : (
						<>
							<Link to='/signin'>Sign in</Link> |{' '}
							<Link to='/signup'>Sign up</Link>
						</>
					)}
				</div>
			</header> */}

			<main style={{ padding: 12 }}>
				<Routes>
					<Route
						path='/'
						element={
							<PrivateRoute>
								<Dashboard />
							</PrivateRoute>
						}
					/>
				</Routes>
			</main>
		</div>
	)
}

export default App
