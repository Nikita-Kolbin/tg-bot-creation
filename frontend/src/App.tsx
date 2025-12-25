import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { PrivateRoute } from './routes/PrivateRoute'
import Dashboard from './pages/Dashboard'
import BotEditScenario from './pages/BotEditScenario'

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
								<BotEditScenario />
							</PrivateRoute>
						}
					/>
					<Route
						path='/api/bot/edit/:id/scenario'
						element={
							<PrivateRoute>
								<div>Редактирование сценария (заглушка)</div>
							</PrivateRoute>
						}
					/>
				</Routes>
			</main>
		</div>
	)
}

export default App
