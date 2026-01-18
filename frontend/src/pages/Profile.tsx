import React, { useState } from 'react'
import {
	Box,
	Typography,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	CardMedia,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { getTelegramUsername } from '../utils/telegramUtils'
import { useMiniAppContext } from './MiniAppLayout'
import {
	useGetUserOrdersQuery,
	useGetProductByIdQuery,
} from '../features/bots/botsApi'
import type { Order } from '../types/bot'

function OrderItem({ item, botId }: { item: any; botId: string }) {
	const { data: product } = useGetProductByIdQuery({
		botId,
		productId: item.productId,
	})
	return (
		<Card sx={{ mb: 2 }}>
			<CardMedia
				component='img'
				sx={{ height: 200, objectFit: 'contain' }}
				image={product?.previewUrl || item.product.previewUrl}
				alt={product?.name || item.product.name}
			/>
			<CardContent>
				<Typography variant='h6'>
					{product?.name || item.product.name}
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					{product?.description || item.product.description}
				</Typography>
				<Typography variant='body1'>Количество: {item.quantity}</Typography>
				<Typography variant='body1'>
					Цена: {product?.price || item.price} руб.
				</Typography>
			</CardContent>
		</Card>
	)
}

export default function Profile() {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [openModal, setOpenModal] = useState(false)
	const username = getTelegramUsername()
	const { botId } = useMiniAppContext()
	const { data: orders = [], isLoading } = useGetUserOrdersQuery(
		{ botId: botId!, username: username! },
		{ skip: !botId || !username },
	)

	if (isLoading) {
		return <Typography>Загрузка...</Typography>
	}

	return (
		<>
			<Box sx={{ p: 2 }}>
				<Typography variant='h4' sx={{ mb: 2 }}>
					Личный кабинет
				</Typography>
				<Typography variant='body1' sx={{ mb: 2 }}>
					Username: {username || 'Неизвестен'}
				</Typography>
				<Typography variant='h6' sx={{ mb: 2 }}>
					История заказов
				</Typography>
				{orders.length === 0 ? (
					<Typography variant='body2'>У вас нет заказов.</Typography>
				) : (
					orders.map((order: Order) => (
						<Card
							key={order.id}
							sx={{ mb: 2, cursor: 'pointer' }}
							onClick={() => {
								setSelectedOrder(order)
								setOpenModal(true)
							}}
						>
							<CardContent>
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'space-between',
										mb: 1,
									}}
								>
									<Typography variant='body2'>Заказ #{order.id}</Typography>
									<Chip
										label={order.status}
										color={order.status === 'completed' ? 'success' : 'default'}
									/>
								</Box>
								<Typography variant='body1' sx={{ mb: 1 }}>
									Сумма: {order.totalAmount} руб.
								</Typography>
							</CardContent>
						</Card>
					))
				)}
			</Box>
			{selectedOrder && (
				<Dialog
					open={openModal}
					onClose={() => setOpenModal(false)}
					maxWidth='md'
					fullWidth
				>
					<DialogTitle>
						Заказ #{selectedOrder.id}
						<IconButton
							aria-label='close'
							onClick={() => setOpenModal(false)}
							sx={{
								position: 'absolute',
								right: 8,
								top: 8,
								color: theme => theme.palette.grey[500],
							}}
						>
							<CloseIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent>
						<Typography variant='body1' sx={{ mb: 1 }}>
							Дата и время: {new Date(selectedOrder.createdAt).toLocaleString()}
						</Typography>
						<Typography variant='body1' sx={{ mb: 1 }}>
							Статус:{' '}
							<Chip
								label={selectedOrder.status}
								color={
									selectedOrder.status === 'completed' ? 'success' : 'default'
								}
							/>
						</Typography>
						<Typography variant='h6' sx={{ mb: 2 }}>
							Товары:
						</Typography>
						{selectedOrder.items.map((item, index) => (
							<OrderItem key={index} item={item} botId={botId!} />
						))}
						<Typography variant='h6' sx={{ mt: 2 }}>
							Общая сумма: {selectedOrder.totalAmount} руб.
						</Typography>
					</DialogContent>
				</Dialog>
			)}
		</>
	)
}
