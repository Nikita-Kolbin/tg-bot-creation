import React, { useState } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Switch,
	FormControlLabel,
	Alert,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import type { Bot, UpdateBotDto } from '../types/bot'

const schema = yup.object({
	name: yup.string().required('Введите имя бота'),
	description: yup.string().required('Введите описание'),
	status: yup.string().required(),
	token: yup.string().required('Введите токен'),
})

type Props = {
	open: boolean
	onClose: () => void
	bot: Bot | null
	onSave?: (data: UpdateBotDto) => void
	onDelete?: () => void
	deleteError?: string | null
	isDeleting?: boolean
	saveError?: string | null
	isSaving?: boolean
}

export default function EditBotModal({
	open,
	onClose,
	bot,
	onSave,
	onDelete,
	deleteError,
	isDeleting,
	saveError,
	isSaving,
}: Props) {
	const [confirmOpen, setConfirmOpen] = useState(false)
	const { control, handleSubmit, reset } = useForm<UpdateBotDto>({
		resolver: yupResolver(schema),
		defaultValues: { name: '', description: '', status: 'active', token: '' },
	})

	React.useEffect(() => {
		if (bot) {
			reset({
				name: bot.name,
				description: bot.description || '',
				status: bot.active ? 'active' : 'inactive',
				token: bot.tokenMask || '',
			})
		}
	}, [bot, reset])

	const onSubmit = (data: UpdateBotDto) => {
		const updatedData = {
			...data,
			token: data.token === bot?.tokenMask ? '' : data.token,
		}
		onSave?.(updatedData)
	}

	const handleDeleteClick = () => {
		setConfirmOpen(true)
	}

	const handleConfirmDelete = () => {
		onDelete?.()
		setConfirmOpen(false)
	}

	const handleCloseConfirm = () => {
		setConfirmOpen(false)
	}

	return (
		<>
			<Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
				<DialogTitle>
					Редактирование бота
					<Button
						variant='outlined'
						color='error'
						sx={{ float: 'right' }}
						onClick={handleDeleteClick}
					>
						Удалить бота
					</Button>
				</DialogTitle>
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogContent>
						{saveError && (
							<Alert severity='error' sx={{ mb: 2 }}>
								{saveError}
							</Alert>
						)}
						<Controller
							name='name'
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									label='Название бота'
									fullWidth
									margin='normal'
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
									label='Описание'
									fullWidth
									margin='normal'
									multiline
									rows={3}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
						<Controller
							name='token'
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									label='Токен бота'
									fullWidth
									margin='normal'
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
						<Controller
							name='status'
							control={control}
							render={({ field }) => (
								<FormControlLabel
									control={
										<Switch
											{...field}
											checked={field.value === 'active'}
											onChange={e =>
												field.onChange(e.target.checked ? 'active' : 'inactive')
											}
										/>
									}
									label='Активен'
									sx={{ mt: 2 }}
								/>
							)}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={onClose}>Отмена</Button>
						<Button type='submit' variant='contained' disabled={isSaving}>
							{isSaving ? 'Сохранение...' : 'Сохранить изменения'}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
			<ConfirmDeleteModal
				open={confirmOpen}
				onClose={handleCloseConfirm}
				onConfirm={handleConfirmDelete}
				isLoading={isDeleting}
				error={deleteError}
			/>
		</>
	)
}
