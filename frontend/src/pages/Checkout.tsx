
import {
	Box,
	Typography,
	Button,
	AppBar,
	Toolbar,
	IconButton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useParams, useNavigate } from 'react-router-dom'
import {
	useGetCartQuery,
	useGetPublicProductsQuery,
	useCreateOrderMutation,
} from '../features/bots/botsApi'
import { getTelegramUsername } from '../utils/telegramUtils'
import type { Product } from '../types/bot'

export default function Checkout() {
	const navigate = useNavigate()
	const { botId } = useParams<{ botId: string }>()
	const username = getTelegramUsername()

	const { data: cart = [] } = useGetCartQuery(
		{ botId: botId!, username: username! },
		{ skip: !botId || !username },
	)
	const { data: products } = useGetPublicProductsQuery(botId!, { skip: !botId })
	const [createOrder] = useCreateOrderMutation()

	if (!cart || cart.length === 0) return <div>Корзина пуста</div>

	const productMap =
		products?.reduce(
			(map, product) => {
				map[product.id] = product
				return map
			},
			{} as Record<string, Product>,
		) || {}

	const totalPrice = cart.reduce((sum, item) => {
		const product = productMap[item.product_id]
		return sum + (product ? product.price * item.quantity : 0)
	}, 0)

	const handleCheckout = async () => {
		try {
			await createOrder({ botId: botId!, username: username! }).unwrap()
			navigate(`/miniApp/${botId}/order-success`)
		} catch (error) {
			console.error(error)
			alert('Ошибка оформления заказа')
		}
	}

	return (
		<>
			<AppBar
				sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100 }}
			>
				<Toolbar>
					<IconButton
						edge='start'
						color='inherit'
						onClick={() => navigate(-1)}
						sx={{ mr: 2 }}
					>
						<ArrowBackIcon />
					</IconButton>
					<Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
						Оформление заказа
					</Typography>
				</Toolbar>
			</AppBar>
			<Box
				sx={{ maxHeight: '100vh', overflowY: 'auto', p: 2, paddingTop: '64px' }}
			>
				<Typography variant='h6' sx={{ mb: 2 }}>
					Username: {username}
				</Typography>
				{cart.map(item => {
					const product = productMap[item.product_id]
					if (!product) return null
					const itemTotal = product.price * item.quantity
					return (
						<Box
							key={item.id}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								border: '1px solid #ddd',
								borderRadius: 2,
								p: 1,
								mb: 1,
								backgroundColor: '#f9f9f9',
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Box sx={{ mr: 2 }}>
									<img
										src={
											product.previewUrl ||
											(product.pictureUrls.length > 0
												? product.pictureUrls[0]
												: '')
										}
										alt={product.name}
										style={{
											width: '120px',
											height: '120px',
											objectFit: 'cover',
										}}
									/>
								</Box>
								<Box
									sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
								>
									<Typography variant='h6' sx={{ fontWeight: 'medium' }}>
										{product.name}
									</Typography>
									<Typography variant='body2' sx={{ color: 'text.secondary' }}>
										Цена за единицу: {product.price} ₽
									</Typography>
									<Typography variant='body2' sx={{ color: 'text.secondary' }}>
										Количество: {item.quantity}
									</Typography>
									<Typography variant='body1' sx={{ fontWeight: 'bold' }}>
										Стоимость: {itemTotal} ₽
									</Typography>
								</Box>
							</Box>
						</Box>
					)
				})}
				<Box sx={{ mt: 2, p: 2, borderTop: '1px solid #ddd' }}>
					<Typography variant='h5' sx={{ fontWeight: 'bold' }}>
						Общая стоимость: {totalPrice} ₽
					</Typography>
					<Button
						variant='contained'
						color='primary'
						sx={{ mt: 2 }}
						onClick={handleCheckout}
					>
						Оформить
					</Button>
				</Box>
			</Box>
		</>
	)
}
