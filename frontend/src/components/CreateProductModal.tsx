import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useCreateProductMutation } from '../features/bots/botsApi'

const schema = yup.object({
	name: yup.string().required('Введите наименование'),
	description: yup.string().required('Введите описание'),
	preview_url: yup.string().url('Неверный URL').required('Введите ссылку на превью'),
	picture_urls: yup.array().of(yup.string().url('Неверный URL')),
	price: yup.number().min(0, 'Цена должна быть >= 0').required('Введите цену'),
})

type FormValues = {
	name: string
	description: string
	preview_url: string
	picture_urls: string[]
	price: number
}

type Props = {
	open: boolean
	onClose: () => void
	botId: string
}

export default function CreateProductModal({ open, onClose, botId }: Props) {
	const [createProduct, { isLoading }] = useCreateProductMutation()
	const { control, handleSubmit, reset } = useForm<FormValues>({
		resolver: yupResolver(schema),
		defaultValues: { name: '', description: '', preview_url: '', picture_urls: [], price: 0 },
	})
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'picture_urls',
	})

	const onSubmit = async (data: FormValues) => {
		try {
			await createProduct({ botId, data }).unwrap()
			reset()
			onClose()
		} catch (err: any) {
			alert('Ошибка создания товара')
		}
	}

	const addPictureUrl = () => {
		append('')
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
			<DialogTitle>Создание товара</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Controller
						name='name'
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label='Наименование'
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
						name='preview_url'
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label='Ссылка на изображение превью'
								fullWidth
								margin='normal'
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>
					<Button onClick={addPictureUrl} startIcon={<AddIcon />}>
						Добавить изображение
					</Button>
					{fields.map((field, index) => (
						<Controller
							key={field.id}
							name={`picture_urls.${index}`}
							control={control}
							render={({ field: inputField, fieldState }) => (
								<TextField
									{...inputField}
									label={`Ссылка на изображение ${index + 1}`}
									fullWidth
									margin='normal'
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
									InputProps={{
										endAdornment: (
											<IconButton onClick={() => remove(index)}>
												<AddIcon style={{ transform: 'rotate(45deg)' }} />
											</IconButton>
										),
									}}
								/>
							)}
						/>
					))}
					<Controller
						name='price'
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label='Цена'
								type='number'
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
						{isLoading ? 'Добавление...' : 'Добавить товар'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	)
}