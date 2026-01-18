import React, { useState } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
} from '@mui/material'

type Props = {
	open: boolean
	onClose: () => void
	onImport: (file: File, exportFirst: boolean) => void
}

export default function ImportScenarioModal({
	open,
	onClose,
	onImport,
}: Props) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [showConfirm, setShowConfirm] = useState(false)

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file && file.type === 'application/json') {
			setSelectedFile(file)
			setShowConfirm(true)
		} else {
			alert('Пожалуйста, выберите файл JSON.')
		}
	}

	const handleConfirm = (exportFirst: boolean) => {
		if (selectedFile) {
			onImport(selectedFile, exportFirst)
			setSelectedFile(null)
			setShowConfirm(false)
			onClose()
		}
	}

	const handleClose = () => {
		setSelectedFile(null)
		setShowConfirm(false)
		onClose()
	}

	return (
		<>
			<Dialog open={open && !showConfirm} onClose={handleClose}>
				<DialogTitle>Импорт сценария</DialogTitle>
				<DialogContent>
					<Typography>Выберите файл JSON для импорта сценария.</Typography>
					<input
						type='file'
						accept='.json'
						onChange={handleFileChange}
						style={{ marginTop: 16 }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Отмена</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
				<DialogTitle>Экспортировать текущий сценарий?</DialogTitle>
				<DialogContent>
					<Typography>
						Хотите ли вы экспортировать текущий сценарий перед импортом нового?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleConfirm(false)}>Нет</Button>
					<Button onClick={() => handleConfirm(true)} variant='contained'>
						Да
					</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}
