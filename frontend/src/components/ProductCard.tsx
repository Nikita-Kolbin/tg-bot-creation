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
	const [imageSrc, setImageSrc] = useState('')

	const [imageOpacity, setImageOpacity] = useState(1)

	const imagesUrl = [product.previewUrl, ...product.pictureUrls].filter(Boolean)

	useEffect(() => {
		setImageOpacity(0)
		const timeout = setTimeout(() => {
			setImageSrc(imagesUrl[currentImageIndex] || '')

			setImageOpacity(1)
		}, 300)
		return () => clearTimeout(timeout)
	}, [currentImageIndex, imagesUrl])

	useEffect(() => {
		setCurrentImageIndex(0)
		setImageSrc(imagesUrl[0] || '')
	}, [imagesUrl])

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
				prev => (prev - 1 + imagesUrl.length) % imagesUrl.length,
			)
		} else if (deltaX < -threshold) {
			// Swipe left: next image
			setCurrentImageIndex(prev => (prev + 1) % imagesUrl.length)
		}
		setStartX(null)
	}

	const hasMultipleImages = imagesUrl.length > 1

	return (
		<Card
			variant='outlined'
			onClick={() => onClick?.(product)}
			sx={{
				maxWidth: 200,
				aspectRatio: 0.75,
				borderRadius: 3,
				boxShadow: 2,
				transition: 'all 0.3s ease',
				background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
				display: 'flex',
				flexDirection: 'column',
				p: 1,
				'&:hover': {
					boxShadow: 6,
					transform: 'translateY(-4px)',
				},
				'@media (max-width: 600px)': {
					maxWidth: '100%',
					aspectRatio: 1,
					borderRadius: 2,
					boxShadow: 1,
				},
			}}
		>
			{hasMultipleImages ? (
				<>
					<Box
						sx={{
							position: 'relative',
							height: '70%',
							'@media (max-width: 370px)': { height: '60%' },
						}}
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
								objectFit: 'contain',
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
						{imagesUrl.map((_, index) => (
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
				<CardMedia
					component='img'
					image={imagesUrl[0]}
					alt={product.name}
					sx={{
						height: '70%',
						minHeight: '70%',
						maxHeight: '70%',
						objectFit: 'contain',
						'@media (max-width: 370px)': {
							height: '60%',
							minHeight: '60%',
							maxHeight: '60%',
						},
					}}
				/>
			)}

			<CardContent
				sx={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-end',
					p: 0,

					'&:last-child': {
						p: 0,
					},
				}}
			>
				<Typography
					variant='h6'
					component='div'
					sx={{
						color: 'primary.main',
						fontWeight: 'bold',
						textAlign: 'left',
					}}
				>
					{product.price.toFixed(0)} ₽
				</Typography>
				<Typography
					variant='body2'
					component='div'
					sx={{
						mt: 0.5,

						textAlign: 'left',
						'@media (max-width: 320px)': {
							fontSize: '0.75rem',
							lineHeight: 1.2,
							wordBreak: 'break-word',
						},
					}}
				>
					{product.name}
				</Typography>
			</CardContent>
		</Card>
	)
}
