import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { PrivateRoute } from './routes/PrivateRoute'
import Dashboard from './pages/Dashboard'
import BotEditProducts from './pages/BotEditProducts'
import ScenarioPage from './pages/ScenarioPage'

const App: React.FC = () => {
	return (
		<div>
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
					<Route
						path='/api/bot/edit/:id'
						element={
							<PrivateRoute>
								<BotEditProducts />
							</PrivateRoute>
						}
					/>
					<Route
						path='/api/bot/edit/:id/scenario'
						element={
							<PrivateRoute>
								<ScenarioPage />
							</PrivateRoute>
						}
					/>
				</Routes>
			</main>
		</div>
	)
}

export default App
