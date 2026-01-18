import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Box,
	Typography,
	Card,
	CardContent,
	CardMedia,
	Chip,
} from '@mui/material'
import { getTelegramUsername } from '../utils/telegramUtils'
import { useMiniAppContext } from './MiniAppLayout'
import { useGetUserOrdersQuery } from '../features/bots/botsApi'
import type { Order } from '../types/bot'

export default function Profile() {
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
					<Card key={order.id} sx={{ mb: 2 }}>
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
							<Box sx={{ display: 'flex', gap: 1 }}>
								{order.items.slice(0, 3).map((item, index) => (
									<CardMedia
										key={index}
										component='img'
										sx={{ width: 50, height: 50, objectFit: 'cover' }}
										image={item.product.previewUrl}
										alt={item.product.name}
									/>
								))}
								{order.items.length > 3 && (
									<Typography variant='body2' sx={{ alignSelf: 'center' }}>
										+{order.items.length - 3}
									</Typography>
								)}
							</Box>
						</CardContent>
					</Card>
				))
			)}
		</Box>
	)
}
