import React, { useState } from 'react'
import {
	Card,
	CardHeader,
	CardContent,
	Avatar,
	IconButton,
	Typography,
	Tooltip,
	Box,
	Switch,
	Alert,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import LaunchIcon from '@mui/icons-material/Launch'
import AppsIcon from '@mui/icons-material/Apps'
import AddMiniAppModal from './AddMiniAppModal'
import type { Bot } from '../types/bot'

type Props = {
	bot: Bot
	onEdit?: (bot: Bot) => void
	onEditScenario?: (bot: Bot) => void
	onStatusChange?: (bot: Bot, active: boolean) => void
	statusError?: string | null
}

export default function BotCard({
	bot,
	onEdit,
	onEditScenario,
	onStatusChange,
	statusError,
}: Props) {
	const [isAddMiniAppOpen, setIsAddMiniAppOpen] = useState(false)
	const handleAddMiniApp = () => setIsAddMiniAppOpen(true)

	const botUrl =
		bot.username && bot.username.trim() !== ''
			? `https://t.me/${bot.username}`
			: ''
	const copyLink = async () => {
		if (botUrl) {
			try {
				await navigator.clipboard.writeText(botUrl)
				alert('Ссылка скопирована')
			} catch {
				alert('Не удалось скопировать')
			}
		}
	}

	const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onStatusChange?.(bot, event.target.checked)
	}

	const truncatedDescription = bot.description
		? bot.description.slice(0, 100) +
			(bot.description.length > 100 ? '...' : '')
		: ''

	return (
		<Card
			variant='outlined'
			sx={{
				width: 300,
				borderRadius: 3,
				boxShadow: 2,
				transition: 'all 0.3s ease',
				background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
				'&:hover': {
					boxShadow: 6,
					transform: 'translateY(-4px)',
				},
			}}
		>
			<CardHeader
				avatar={
					<Avatar
						src={bot.avatarUrl ?? undefined}
						sx={{ bgcolor: bot.active ? 'success.main' : 'error.main' }}
					>
						{bot.name?.[0]?.toUpperCase()}
					</Avatar>
				}
				action={
					<Box>
						<Tooltip title='Добавить Miniapp'>
							<IconButton onClick={handleAddMiniApp} size='small'>
								<AppsIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title='Редактировать сценарий'>
							<IconButton onClick={() => onEditScenario?.(bot)} size='small'>
								<EditIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title='Настройки'>
							<IconButton onClick={() => onEdit?.(bot)} size='small'>
								<SettingsIcon />
							</IconButton>
						</Tooltip>
					</Box>
				}
				title={bot.name}
				subheader={new Date(bot.createdAt).toLocaleString()}
				sx={{ pb: 1 }}
			/>
			<CardContent sx={{ pt: 0 }}>
				{bot.description && (
					<Typography variant='body2' sx={{ mb: 2, color: 'text.secondary' }}>
						{truncatedDescription}
					</Typography>
				)}
				{statusError && (
					<Alert severity='error' sx={{ mb: 1, py: 0.5 }}>
						{statusError}
					</Alert>
				)}
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mt: 1,
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Typography variant='body2' sx={{ fontWeight: 500 }}>
							Статус:
						</Typography>
						<Switch
							checked={bot.active}
							onChange={handleStatusChange}
							size='small'
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
					</Box>
					{bot.username && bot.username.trim() !== '' && (
						<Box sx={{ display: 'flex', gap: 0.5 }}>
							<Tooltip title='Открыть ссылку'>
								<IconButton
									size='small'
									href={botUrl}
									target='_blank'
									rel='noreferrer'
									aria-label='open'
									sx={{ color: 'primary.main' }}
								>
									<LaunchIcon fontSize='small' />
								</IconButton>
							</Tooltip>
							<Tooltip title='Копировать ссылку'>
								<IconButton
									onClick={copyLink}
									size='small'
									sx={{ color: 'primary.main' }}
								>
									<ContentCopyIcon fontSize='small' />
								</IconButton>
							</Tooltip>
						</Box>
					)}
				</Box>
			</CardContent>
			<AddMiniAppModal
				open={isAddMiniAppOpen}
				onClose={() => setIsAddMiniAppOpen(false)}
				bot={bot}
			/>
		</Card>
	)
}
