import React from 'react'
import {
	Card,
	CardHeader,
	CardContent,
	Avatar,
	IconButton,
	Typography,
	Chip,
	Tooltip,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import LinkIcon from '@mui/icons-material/Link'
import LaunchIcon from '@mui/icons-material/Launch'
import type { Bot } from '../types/bot'

type Props = {
	bot: Bot
}

export default function BotCard({ bot }: Props) {
	const copyLink = async () => {
		try {
			if (bot.link) {
				await navigator.clipboard.writeText(bot.link)
				alert('Ссылка скопирована')
			}
		} catch (e) {
			alert('Не удалось скопировать', e)
		}
	}

	return (
		<Card variant='outlined' sx={{ width: 300 }}>
			<CardHeader
				avatar={
					<Avatar src={bot.avatarUrl ?? undefined}>
						{bot.name?.[0]?.toUpperCase()}
					</Avatar>
				}
				action={
					<Tooltip title='Копировать ссылку'>
						<IconButton onClick={copyLink}>
							<ContentCopyIcon />
						</IconButton>
					</Tooltip>
				}
				title={bot.name}
				subheader={new Date(bot.createdAt).toLocaleString()}
			/>
			<CardContent>
				<Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
					Статус:{' '}
					{bot.active ? (
						<Chip label='Активен' color='success' size='small' />
					) : (
						<Chip label='Неактивен' color='default' size='small' />
					)}
				</Typography>

				<Typography
					variant='body2'
					sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
				>
					<LinkIcon fontSize='small' />{' '}
					<a href={bot.link} target='_blank' rel='noreferrer'>
						{bot.link}
					</a>
					<IconButton
						size='small'
						href={bot.link}
						target='_blank'
						rel='noreferrer'
						aria-label='open'
					>
						<LaunchIcon fontSize='small' />
					</IconButton>
				</Typography>
			</CardContent>
		</Card>
	)
}
