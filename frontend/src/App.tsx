import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { PrivateRoute } from './routes/PrivateRoute'
import Dashboard from './pages/Dashboard'
import BotEditScenario from './pages/BotEditScenario'
import MiniAppLayout from './pages/MiniAppLayout'
import MiniAppCatalog from './pages/MiniAppCatalog'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'

import Profile from './pages/Profile'

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
					<Route path='/miniApp/:botId' element={<MiniAppLayout />}>
						<Route index element={<MiniAppCatalog />} />
						<Route path='cart' element={<Cart />} />
						<Route path='checkout' element={<Checkout />} />
						<Route path='order-success' element={<OrderSuccess />} />

						<Route path='profile' element={<Profile />} />
					</Route>
				</Routes>
			</main>
		</div>
	)
}

export default App
