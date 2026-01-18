import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { PrivateRoute } from './routes/PrivateRoute'
import Dashboard from './pages/Dashboard'
import BotEditProducts from './pages/BotEditProducts'
import ScenarioPage from './pages/ScenarioPage'
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
