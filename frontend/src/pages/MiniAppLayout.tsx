import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import BottomNavbar from '../components/BottomNavbar'

const MiniAppLayout: React.FC = () => {
	const navigate = useNavigate()

	const handleHomeClick = () => {
		navigate('')
	}

	const handleCartClick = () => {
		navigate('cart')
	}

	return (
		<div style={{ paddingBottom: '80px' }}>
			<Outlet />
			<BottomNavbar
				onHomeClick={handleHomeClick}
				onCartClick={handleCartClick}
			/>
		</div>
	)
}

export default MiniAppLayout
