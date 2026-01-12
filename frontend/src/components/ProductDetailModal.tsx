import React, { useState, useEffect } from 'react'
import {
	Dialog,
	DialogContent,
	Box,
	Typography,
	IconButton,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import type { Product } from '../types/bot'

type Props = {
	open: boolean
	onClose: () => void
	product: Product | null
}

export default function ProductDetailModal({ open, onClose, product }: Props) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [imageSrc, setImageSrc] = useState('')
	const [imageOpacity, setImageOpacity] = useState(1)

	useEffect(() => {
		if (product) {
			const images = product.previewUrl
				? [product.previewUrl, ...product.pictureUrls]
				: product.pictureUrls
			setCurrentImageIndex(0)
			setImageSrc(images[0] || '')
		}
	}, [product])

	useEffect(() => {
		if (product) {
			const images = product.previewUrl
				? [product.previewUrl, ...product.pictureUrls]
				: product.pictureUrls
			setImageOpacity(0)
			const timeout = setTimeout(() => {
				setImageSrc(images[currentImageIndex] || '')
				setImageOpacity(1)
			}, 300)
			return () => clearTimeout(timeout)
		}
	}, [currentImageIndex, product])

	const handleTouchStart = (e: React.TouchEvent) => {
		setStartX(e.touches[0].clientX)
	}

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (startX === null) return
		const endX = e.changedTouches[0].clientX
		const deltaX = endX - startX
		const threshold = 50

		const images = product
			? product.previewUrl
				? [product.previewUrl, ...product.pictureUrls]
				: product.pictureUrls
			: []

		if (deltaX > threshold) {
			// Swipe right: previous image
			setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
		} else if (deltaX < -threshold) {
			// Swipe left: next image
			setCurrentImageIndex(prev => (prev + 1) % images.length)
		}
		setStartX(null)
	}

	const [startX, setStartX] = useState<number | null>(null)

	if (!product) return null

	const images = product.previewUrl
		? [product.previewUrl, ...product.pictureUrls]
		: product.pictureUrls
	const hasMultipleImages = images.length > 1

	return (
		<Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
			<DialogContent sx={{ p: 0, position: 'relative' }}>
				<IconButton
					onClick={onClose}
					sx={{
						position: 'absolute',
						top: 8,
						right: 8,
						color: 'white',
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						zIndex: 1,
						'&:hover': {
							backgroundColor: 'rgba(0, 0, 0, 0.7)',
						},
					}}
				>
					<CloseIcon />
				</IconButton>
				{hasMultipleImages ? (
					<>
						<Box
							sx={{ position: 'relative', height: 400 }}
							onTouchStart={handleTouchStart}
							onTouchEnd={handleTouchEnd}
						>
							<Box
								component='img'
								src={imageSrc}
								alt={product.name}
								sx={{
									width: '100%',
									height: '100%',
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
								py: 1,
								backgroundColor: 'background.paper',
							}}
						>
							{images.map((_, index) => (
								<Box
									key={index}
									onClick={() => setCurrentImageIndex(index)}
									sx={{
										width: 10,
										height: 10,
										borderRadius: '50%',
										backgroundColor:
											index === currentImageIndex ? 'primary.main' : 'grey.400',
										cursor: 'pointer',
										transition: 'background-color 0.3s',
									}}
								/>
							))}
						</Box>
					</>
				) : (
					imageSrc && (
						<Box
							component='img'
							src={imageSrc}
							alt={product.name}
							sx={{
								width: '100%',
								height: 400,
								objectFit: 'contain',
							}}
						/>
					)
				)}
				<Box sx={{ p: 3 }}>
					<Typography variant='h5' component='h2' sx={{ mb: 1 }}>
						{product.name}
					</Typography>
					<Typography variant='h6' sx={{ color: 'primary.main', mb: 2 }}>
						{product.price.toFixed(0)} ₽
					</Typography>
					<Typography variant='body1' sx={{ color: 'text.secondary' }}>
						{product.description}
					</Typography>
				</Box>
			</DialogContent>
		</Dialog>
	)
}
