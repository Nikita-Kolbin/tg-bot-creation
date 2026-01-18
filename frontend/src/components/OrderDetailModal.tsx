import React from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Typography,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Chip,
} from '@mui/material'
import { useGetProductByIdQuery } from '../features/bots/botsApi'
import type { Order, Product } from '../types/bot'

type Props = {
	open: boolean
	onClose: () => void
	order: Order | null
}

export default function OrderDetailModal({
	open,
	onClose,
	order,
	botId,
}: Props) {
	if (!order) return null

	return (
		<Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
			<DialogTitle>Детали заказа #{order.id}</DialogTitle>
			<DialogContent>
				<Typography variant='h6' sx={{ mb: 2 }}>
					Информация о заказе
				</Typography>
				<Typography>
					<strong>ID:</strong> {order.id}
				</Typography>
				<Typography>
					<strong>Username:</strong> {order.username}
				</Typography>
				<Typography component='div'>
					<strong>Статус:</strong>{' '}
					<Chip
						label={order.status}
						color={order.status === 'completed' ? 'success' : 'default'}
					/>
				</Typography>
				<Typography>
					<strong>Итого:</strong> {order.total} ₽
				</Typography>
				<Typography>
					<strong>Создан:</strong> {new Date(order.createdAt).toLocaleString()}
				</Typography>

				<Typography variant='h6' sx={{ mt: 3, mb: 2 }}>
					Товары
				</Typography>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Название</TableCell>
							<TableCell>Описание</TableCell>
							<TableCell>Цена</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{order.items.map(item => (
							<TableRow key={item.id}>
								<TableCell>{item.name}</TableCell>
								<TableCell>{item.description}</TableCell>
								<TableCell>{item.price} ₽</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</DialogContent>
		</Dialog>
	)
}
