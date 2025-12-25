import React, { useState } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Box,
	Typography,
	Button,
	Grid,
} from '@mui/material'
import type { Product } from '../types/bot'

type Props = {
	open: boolean
	onClose: () => void
	product: Product | null
}

export default function EditProductModal({ open, onClose, product }: Props) {
	const [selectedImage, setSelectedImage] = useState<string>('')

	React.useEffect(() => {
		if (product) {
			setSelectedImage(product.previewUrl || (product.pictureUrls.length > 0 ? product.pictureUrls[0] : ''))
		}
	}, [product])

	if (!product) return null

	const allImages = product.pictureUrls.length > 0 ? product.pictureUrls : [product.previewUrl].filter(Boolean)

	return (
		<Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
			<DialogTitle sx={{ p: 2 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant='h6'>Редактирование товара</Typography>
					<Button variant='outlined' color='error'>
						Удалить товар
					</Button>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Box sx={{ mb: 3 }}>
					{selectedImage && (
						<Box
							sx={{
								width: '100%',
								height: 300,
								backgroundColor: '#f5f5f5',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: 2,
								mb: 2,
							}}
						>
							<img
								src={selectedImage}
								alt={product.name}
								style={{
									maxWidth: '100%',
									maxHeight: '100%',
									objectFit: 'contain',
									borderRadius: 8,
								}}
							/>
						</Box>
					)}
					{allImages.length > 1 && (
						<Grid container spacing={1}>
							{allImages.map((url, index) => (
								<Grid item key={index}>
									<Box
										sx={{
											width: 60,
											height: 60,
											borderRadius: 1,
											overflow: 'hidden',
											cursor: 'pointer',
											border: selectedImage === url ? '2px solid #1976d2' : '2px solid transparent',
											transition: 'border 0.2s ease',
										}}
										onClick={() => setSelectedImage(url)}
									>
										<img
											src={url}
											alt={`${product.name} ${index + 1}`}
											style={{
												width: '100%',
												height: '100%',
												objectFit: 'cover',
											}}
										/>
									</Box>
								</Grid>
							))}
						</Grid>
					)}
				</Box>
			</DialogContent>
		</Dialog>
	)
}