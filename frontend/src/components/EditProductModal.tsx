import React, { useState } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Box,
	Typography,
	Button,
	Grid,
	TextField,
	Switch,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useUpdateProductMutation, useDeleteProductMutation } from '../features/bots/botsApi'
import type { Product } from '../types/bot'

const schema = yup.object({
	name: yup.string().required('Введите наименование'),
	description: yup.string().required('Введите описание'),
	price: yup.number().min(0, 'Цена должна быть >= 0').required('Введите цену'),
})

type FormValues = {
	name: string
	description: string
	price: number
	active: boolean
}

type Props = {
	open: boolean
	onClose: () => void
	product: Product | null
}

export default function EditProductModal({ open, onClose, product }: Props) {
	const [selectedImage, setSelectedImage] = useState<string>('')
	const [updateProduct, { isLoading }] = useUpdateProductMutation()
	const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

	const { control, handleSubmit, reset } = useForm<FormValues>({
		resolver: yupResolver(schema),
		defaultValues: {
			name: '',
			description: '',
			price: 0,
			active: false,
		},
	})

	React.useEffect(() => {
		if (product) {
			reset({
				name: product.name,
				description: product.description,
				price: product.price,
				active: product.active,
			})
			setSelectedImage(product.previewUrl || (product.pictureUrls.length > 0 ? product.pictureUrls[0] : ''))
		}
	}, [product, reset])

	if (!product) return null

	const allImages = product.previewUrl ? [product.previewUrl, ...product.pictureUrls] : product.pictureUrls

	const onSubmit = async (data: FormValues) => {
		try {
			await updateProduct({
				botId: product.botId,
				productId: product.id,
				data: {
					active: data.active,
					description: data.description,
					name: data.name,
					picture_urls: product.pictureUrls,
					preview_url: product.previewUrl,
					price: data.price,
				},
			}).unwrap()
			onClose()
		} catch {
			alert('Ошибка сохранения товара')
		}
	}

	const onDelete = async () => {
		try {
			await deleteProduct({
				botId: product.botId,
				productId: product.id,
			}).unwrap()
			onClose()
		} catch {
			alert('Ошибка удаления товара')
		}
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
			<DialogTitle sx={{ p: 2 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant='h6'>Редактирование товара</Typography>
					<Button variant='outlined' color='error' onClick={onDelete} disabled={isDeleting}>
						{isDeleting ? 'Удаление...' : 'Удалить товар'}
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
								<Grid item key={index} xs>
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
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Controller
						name='name'
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label='Наименование товара'
								fullWidth
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>
					<Controller
						name='description'
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label='Описание товара'
								fullWidth
								multiline
								rows={3}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>
					<Controller
						name='price'
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label='Цена товара'
								type='number'
								fullWidth
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Typography>Видимость:</Typography>
						<Controller
							name='active'
							control={control}
							render={({ field }) => (
								<Switch
									{...field}
									checked={field.value}
									sx={{
										'& .MuiSwitch-switchBase.Mui-checked': {
											color: 'success.main',
											'& + .MuiSwitch-track': {
												backgroundColor: 'success.main',
											},
										},
										'& .MuiSwitch-switchBase': {
											color: 'error.main',
											'& + .MuiSwitch-track': {
												backgroundColor: 'error.main',
											},
										},
									}}
								/>
							)}
						/>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Отмена</Button>
				<Button variant='contained' onClick={handleSubmit(onSubmit)} disabled={isLoading}>
					{isLoading ? 'Сохранение...' : 'Сохранить'}
				</Button>
			</DialogActions>
		</Dialog>
	)
}