import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	Box,
	Typography,
	Card,
	CardContent,
	CardMedia,
	Chip,
	Button,
} from '@mui/material'
import { getTelegramUsername } from '../utils/telegramUtils'
import { useMiniAppContext } from './MiniAppLayout'
import { useGetUserOrdersQuery } from '../features/bots/botsApi'
import type { Order } from '../types/bot'

export default function OrderDetail() {
	const { orderId } = useParams<{ orderId: string }>()
	const navigate = useNavigate()
	const username = getTelegramUsername()
	const { botId } = useMiniAppContext()
	const { data: orders = [], isLoading } = useGetUserOrdersQuery(
		{ botId: botId!, username: username! },
		{ skip: !botId || !username },
	)

	const order = orders.find((o: Order) => o.id === orderId)

	if (isLoading) {
		return <Typography>Загрузка...</Typography>
	}

	if (!order) {
		return <Typography>Заказ не найден.</Typography>
	}

	return (
		<Box sx={{ p: 2 }}>
			<Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
				Назад
			</Button>
			<Typography variant='h4' sx={{ mb: 2 }}>
				Заказ #{order.id}
			</Typography>
			<Typography variant='body1' sx={{ mb: 1 }}>
				Статус:{' '}
				<Chip
					label={order.status}
					color={order.status === 'completed' ? 'success' : 'default'}
				/>
			</Typography>
			<Typography variant='body1' sx={{ mb: 1 }}>
				Общая сумма: {order.totalAmount} руб.
			</Typography>
			<Typography variant='body1' sx={{ mb: 2 }}>
				Дата: {new Date(order.createdAt).toLocaleDateString()}
			</Typography>
			<Typography variant='h6' sx={{ mb: 2 }}>
				Товары:
			</Typography>
			{order.items.map((item, index) => (
				<Card key={index} sx={{ mb: 2 }}>
					<CardMedia
						component='img'
						sx={{ height: 140 }}
						image={item.product.previewUrl}
						alt={item.product.name}
					/>
					<CardContent>
						<Typography variant='h6'>{item.product.name}</Typography>
						<Typography variant='body2' color='text.secondary'>
							{item.product.description}
						</Typography>
						<Typography variant='body1'>Количество: {item.quantity}</Typography>
						<Typography variant='body1'>Цена: {item.price} руб.</Typography>
					</CardContent>
				</Card>
			))}
		</Box>
	)
}
