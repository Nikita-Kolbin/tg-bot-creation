
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from '@mui/material'

type Props = {
	open: boolean
	onClose: () => void
	onAddBlock: (type: string, title: string) => void
}

export default function BlockListModal({ open, onClose, onAddBlock }: Props) {
	const handleAddBlock = (type: string, title: string) => {
		onAddBlock(type, title)
		onClose()
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
			<DialogTitle>Список блоков</DialogTitle>
			<DialogContent>
				<Button
					variant='outlined'
					fullWidth
					sx={{ mb: 2 }}
					onClick={() => handleAddBlock('message', 'Сообщение')}
				>
					Сообщение
				</Button>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Отмена</Button>
			</DialogActions>
		</Dialog>
	)
}
