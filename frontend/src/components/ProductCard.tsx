import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material'
import type { Product } from '../types/bot'

type Props = {
	product: Product
	onClick?: (product: Product) => void
}

export default function ProductCard({ product, onClick }: Props) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [startX, setStartX] = useState<number | null>(null)
	const [imageSrc, setImageSrc] = useState(
		product.pictureUrls[currentImageIndex] || ''
	)
	const [imageOpacity, setImageOpacity] = useState(1)

	useEffect(() => {
		setImageOpacity(0)
		const timeout = setTimeout(() => {
			setImageSrc(product.pictureUrls[currentImageIndex] || '')
			setImageOpacity(1)
		}, 300)
		return () => clearTimeout(timeout)
	}, [currentImageIndex, product.pictureUrls])

	const handleTouchStart = (e: React.TouchEvent) => {
		setStartX(e.touches[0].clientX)
	}

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (startX === null) return
		const endX = e.changedTouches[0].clientX
		const deltaX = endX - startX
		const threshold = 50

		if (deltaX > threshold) {
			// Swipe right: previous image
			setCurrentImageIndex(
				prev =>
					(prev - 1 + product.pictureUrls.length) % product.pictureUrls.length
			)
		} else if (deltaX < -threshold) {
			// Swipe left: next image
			setCurrentImageIndex(prev => (prev + 1) % product.pictureUrls.length)
		}
		setStartX(null)
	}

	const imageUrl =
		product.previewUrl ||
		(product.pictureUrls.length > 0 ? product.pictureUrls[0] : undefined)

	const hasMultipleImages = product.pictureUrls.length > 1

	return (
		<Card
			variant='outlined'
			onClick={() => onClick?.(product)}
			sx={{
				width: '100%',
				maxWidth: 200,
				aspectRatio: 0.75,
				borderRadius: 3,
				boxShadow: 2,
				transition: 'all 0.3s ease',
				background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
				display: 'flex',
				flexDirection: 'column',
				'&:hover': {
					boxShadow: 6,
					transform: 'translateY(-4px)',
				},
				'@media (max-width: 600px)': {
					maxWidth: '100%',
					borderRadius: 2,
					boxShadow: 1,
				},
			}}
		>
			{hasMultipleImages ? (
				<>
					<Box
						sx={{ position: 'relative', height: '75%' }}
						onTouchStart={handleTouchStart}
						onTouchEnd={handleTouchEnd}
					>
						<CardMedia
							component='img'
							image={imageSrc}
							alt={product.name}
							sx={{
								height: '100%',
								width: '100%',
								objectFit: 'cover',
								opacity: imageOpacity,
								transition: 'opacity 0.3s ease-in-out',
							}}
						/>
					</Box>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							gap: 0.5,
						}}
					>
						{product.pictureUrls.map((_, index) => (
							<Box
								key={index}
								onClick={() => setCurrentImageIndex(index)}
								sx={{
									width: 8,
									height: 8,
									borderRadius: '50%',
									backgroundColor:
										index === currentImageIndex
											? 'primary.main'
											: 'rgba(255, 255, 255, 0.5)',
									cursor: 'pointer',
									transition: 'background-color 0.3s',
								}}
							/>
						))}
					</Box>
				</>
			) : (
				imageUrl && (
					<CardMedia
						component='img'
						image={imageUrl}
						alt={product.name}
						sx={{ height: '75%', objectFit: 'cover' }}
					/>
				)
			)}
			<Box sx={{ mt: 0.5, height: 8 }} />
			<CardContent
				sx={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-end',
					p: 2,
				}}
			>
				<Typography
					variant='h6'
					component='div'
					sx={{
						color: 'primary.main',
						fontWeight: 'bold',
						textAlign: 'left',
						mt: 0.25,
					}}
				>
					{product.price.toFixed(0)} ₽
				</Typography>
				<Typography
					variant='body2'
					component='div'
					sx={{
						mt: 0.5,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						textAlign: 'left',
					}}
				>
					{product.name}
				</Typography>
			</CardContent>
		</Card>
	)
}
