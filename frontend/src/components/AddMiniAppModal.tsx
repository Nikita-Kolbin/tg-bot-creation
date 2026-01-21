import React from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Button,
	Box,
} from '@mui/material'
import type { Bot } from '../types/bot'

type Props = {
	open: boolean
	onClose: () => void
	bot: Bot
}

export default function AddMiniAppModal({ open, onClose, bot }: Props) {
	const miniAppUrl = `https://foreign-key.ru/miniApp/${bot.id}`

	return (
		<Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
			<DialogTitle>Добавить Miniapp</DialogTitle>
			<DialogContent>
				<Typography variant='body1' sx={{ mb: 2 }}>
					Чтобы добавить ссылку на miniapp в Telegram, используйте BotFather
				</Typography>
				<Typography variant='body1' sx={{ mb: 2 }}>
					Ссылка на ваш miniapp:
				</Typography>
				<Box
					sx={{
						p: 2,
						border: '1px solid #ccc',
						borderRadius: 1,
						backgroundColor: '#f9f9f9',
						wordBreak: 'break-all',
					}}
				>
					<Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
						{miniAppUrl}
					</Typography>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Закрыть</Button>
			</DialogActions>
		</Dialog>
	)
}
