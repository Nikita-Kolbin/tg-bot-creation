import React from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useCreateBotMutation } from '../features/bots/botsApi'
import type { CreateBotDto } from '../types/bot'

const schema = yup.object({
	name: yup.string().required('Введите имя бота'),
	description: yup.string().required('Введите описание'),
	token: yup.string().required('Введите токен'),
})

type Props = {
	open: boolean
	onClose: () => void
}

export default function CreateBotModal({ open, onClose }: Props) {
	const [createBot, { isLoading }] = useCreateBotMutation()
	const { control, handleSubmit, reset } = useForm<CreateBotDto>({
		resolver: yupResolver(schema),
		defaultValues: { name: '', description: '', token: '' },
	})

	const onSubmit = async (data: CreateBotDto) => {
		try {
			await createBot(data).unwrap()
			reset()
			onClose()
		} catch (err) {
			console.error('Ошибка создания бота:', err)
			alert('Ошибка создания бота')
		}
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
			<DialogTitle>Создать бота</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Controller
						name='name'
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label='Имя бота'
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
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Отмена</Button>
					<Button type='submit' variant='contained' disabled={isLoading}>
						{isLoading ? 'Создание...' : 'Создать'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	)
}
