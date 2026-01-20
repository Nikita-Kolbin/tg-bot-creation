import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Alert,
	Button,
} from '@mui/material'

type Props = {
	open: boolean
	onClose: () => void
	onConfirm: () => void
	isLoading?: boolean
	error?: string | null
}

export default function ConfirmDeleteModal({
	open,
	onClose,
	onConfirm,
	isLoading,
	error,
}: Props) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth={false}
			sx={{ width: 360, marginInline: 'auto' }}
		>
			<DialogTitle>Подтверждение удаления</DialogTitle>
			<DialogContent>
				<Typography>Вы уверены что хотите удалить блок?</Typography>
				{error && (
					<Alert severity='error' sx={{ mt: 2 }}>
						{error}
					</Alert>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={isLoading}>
					Нет
				</Button>
				<Button
					onClick={onConfirm}
					variant='contained'
					color='error'
					disabled={isLoading}
				>
					{isLoading ? 'Удаление...' : 'Да'}
				</Button>
			</DialogActions>
		</Dialog>
	)
}
