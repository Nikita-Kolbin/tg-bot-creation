import React from 'react'
import { Grid, Box, Typography, Button } from '@mui/material'
import BotCard from './BotCard'
import type { Bot } from '../types/bot'

type Props = {
	bots: Bot[]
	onCreate?: () => void
}

export default function BotsGrid({ bots, onCreate }: Props) {
	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
				<Button variant='contained' onClick={onCreate}>
					Создать бота
				</Button>
			</Box>

			{bots.length === 0 ? (
				<Typography variant='body1'>У вас нет ботов</Typography>
			) : (
				<Grid container spacing={2}>
					{bots.map(b => (
						<Grid item key={b.id}>
							<BotCard bot={b} />
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	)
}
