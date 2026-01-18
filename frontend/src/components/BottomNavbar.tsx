import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import HomeIcon from '@mui/icons-material/Home'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PersonIcon from '@mui/icons-material/Person'
import { useMiniAppContext } from '../pages/MiniAppLayout'
import { useGetPublicProductsQuery } from '../features/bots/botsApi'

interface BottomNavbarProps {
	onHomeClick?: () => void
	onCartClick?: () => void
	onProfileClick?: () => void
	onAddToCart?: () => void
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({
	onHomeClick,
	onCartClick,
	onProfileClick,
}) => {
	const theme = useTheme()
	const location = useLocation()
	const navigate = useNavigate()
	const {
		showAddToCart,
		selectedProduct,
		cart,
		onIncreaseQuantity,
		onDecreaseQuantity,
		botId,
	} = useMiniAppContext()
	const { data: products } = useGetPublicProductsQuery(botId!, { skip: !botId })
	const isCartActive = location.pathname.includes('/cart')
	const isProfileActive = location.pathname.includes('/profile')
	const isHomeActive = !isCartActive && !isProfileActive

	const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)
	const totalPrice = cart.reduce((sum, item) => {
		const product = products?.find(p => p.id === item.product_id)
		return sum + (product ? product.price * item.quantity : 0)
	}, 0)

	return (
		<div
			style={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				backgroundColor: '#fff',

				display: 'flex',
				flexDirection: 'column',
				padding: '5px 0',
				zIndex: 1400,
			}}
		>
			{showAddToCart &&
				selectedProduct &&
				!location.pathname.includes('/cart') &&
				(() => {
					const cartItem = cart.find(
						item => item.product_id === selectedProduct.id,
					)
					return cartItem ? (
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								gap: '10px',
								padding: '10px',
								marginBottom: '5px',
							}}
						>
							<button
								onClick={onDecreaseQuantity}
								style={{
									width: '40px',
									height: '40px',
									borderRadius: '4px',
									backgroundColor: theme.palette.primary.main,
									color: 'white',
									border: 'none',
									fontSize: '20px',
									cursor: 'pointer',
								}}
							>
								-
							</button>
							<span
								style={{
									fontSize: '16px',
									fontWeight: 'bold',
									minWidth: '30px',
									textAlign: 'center',
								}}
							>
								{cartItem.quantity}
							</span>
							<button
								onClick={onIncreaseQuantity}
								style={{
									width: '40px',
									height: '40px',
									borderRadius: '4px',
									backgroundColor: theme.palette.primary.main,
									color: 'white',
									border: 'none',
									fontSize: '20px',
									cursor: 'pointer',
								}}
							>
								+
							</button>
						</div>
					) : (
						<button
							onClick={onIncreaseQuantity}
							style={{
								width: '95%',
								padding: '10px',
								borderRadius: '4px',
								backgroundColor: theme.palette.primary.main,
								color: 'white',
								border: 'none',
								fontSize: '16px',
								cursor: 'pointer',
								marginInline: 'auto',
								marginBottom: '5px',
								height: '40px',
							}}
						>
							В корзину
						</button>
					)
				})()}
			{isCartActive && (
				<div
					style={{
						padding: '15px',
						borderTop: '1px solid #ccc',
						display: 'flex',
						flexDirection: 'column',
						gap: '10px',
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							fontSize: '18px',
							fontWeight: 'bold',
						}}
					>
						<span>Количество: {totalQuantity} ед.</span>
						<span>Итого: {totalPrice} ₽</span>
					</div>
					<button
						onClick={() => navigate('checkout')}
						style={{
							width: '100%',
							padding: '12px',
							borderRadius: '8px',
							backgroundColor: theme.palette.primary.main,
							color: 'white',
							border: 'none',
							fontSize: '16px',
							fontWeight: 'bold',
							cursor: 'pointer',
						}}
					>
						Перейти к оформлению
					</button>
				</div>
			)}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-around',
					padding: '5px 0',
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
				</button>
				<button
					onClick={onProfileClick}
					style={{
						background: 'none',
						border: 'none',
						fontSize: '24px',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						color: isProfileActive ? '#000' : '#888',
					}}
				>
					<PersonIcon />
				</button>
			</div>
		</div>
	)
}

export default BottomNavbar
