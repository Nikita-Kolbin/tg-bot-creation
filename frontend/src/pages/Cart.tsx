import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useMiniAppContext } from './MiniAppLayout'
import { useGetPublicProductsQuery } from '../features/bots/botsApi'
import type { Product } from '../types/bot'

export default function Cart() {
	const { cart, botId, updateCartItem } = useMiniAppContext()

	const { data: products } = useGetPublicProductsQuery(botId!, { skip: !botId })

	if (!cart || cart.length === 0) return <div>Корзина пуста</div>

	const productMap =
		products?.reduce(
			(map, product) => {
				map[product.id] = product
				return map
			},
			{} as Record<string, Product>,
		) || {}

	return (
		<Box sx={{ maxHeight: '72vh', overflowY: 'auto' }}>
			{cart.map(item => {
				const product = productMap[item.product_id]
				if (!product) return null
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
							<Box sx={{ display: 'flex', flexDirection: 'column' }}>
								{item.quantity > 1 ? (
									<>
										<Typography variant='h5' sx={{ fontWeight: 'bold' }}>
											{product.price * item.quantity} ₽
										</Typography>
										<Typography
											variant='body2'
											sx={{ color: 'text.secondary' }}
										>
											{product.price}/ед
										</Typography>
										<Typography variant='h6' sx={{ fontWeight: 'medium' }}>
											{product.name}
										</Typography>
									</>
								) : (
									<>
										<Typography variant='h5' sx={{ fontWeight: 'bold' }}>
											{product.price} ₽
										</Typography>
										<Typography variant='h6' sx={{ fontWeight: 'medium' }}>
											{product.name}
										</Typography>
									</>
								)}
								<Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
									<Button
										variant='outlined'
										size='small'
										onClick={() =>
											updateCartItem(item, Math.max(0, item.quantity - 1))
										}
									>
										-
									</Button>
									<Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
									<Button
										variant='outlined'
										size='small'
										onClick={() => updateCartItem(item, item.quantity + 1)}
									>
										+
									</Button>
								</Box>
							</Box>
						</Box>
					</Box>
				)
			})}
		</Box>
	)
}
