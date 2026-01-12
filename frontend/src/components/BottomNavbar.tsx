import React from 'react'
import { useLocation } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

interface BottomNavbarProps {
	onHomeClick?: () => void
	onCartClick?: () => void
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({
	onHomeClick,
	onCartClick,
}) => {
	const location = useLocation()
	const isCartActive = location.pathname.endsWith('/cart')
	const isHomeActive = !isCartActive

	return (
		<div
			style={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				backgroundColor: '#fff',
				borderTop: '1px solid #ccc',
				display: 'flex',
				justifyContent: 'space-around',
				padding: '5px 0',
				zIndex: 1400,
			}}
		>
			<button
				onClick={onHomeClick}
				style={{
					background: 'none',
					border: 'none',
					fontSize: '24px',
					cursor: 'pointer',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					color: isHomeActive ? '#000' : '#888',
				}}
			>
				<HomeIcon />
				<span style={{ fontSize: '12px' }}>Главная</span>
			</button>
			<button
				onClick={onCartClick}
				style={{
					background: 'none',
					border: 'none',
					fontSize: '24px',
					cursor: 'pointer',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					color: isCartActive ? '#000' : '#888',
				}}
			>
				<ShoppingCartIcon />
				<span style={{ fontSize: '12px' }}>Корзина</span>
			</button>
		</div>
	)
}

export default BottomNavbar
