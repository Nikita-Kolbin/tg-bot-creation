import React from 'react'
import { Container, Box, Paper, Typography } from '@mui/material'

type Props = { children: React.ReactNode; title?: string; subtitle?: string }

export default function AuthLayout({ children, title, subtitle }: Props) {
	return (
		<Container maxWidth='sm'>
			<Box sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
				<Paper elevation={3} sx={{ width: '100%', p: 4, borderRadius: 2 }}>
					<Box sx={{ textAlign: 'center', mb: 2 }}>
						<Typography variant='h5' fontWeight={700}>
							{title || 'Telegram Bot Platform'}
						</Typography>
						{subtitle && (
							<Typography variant='body2' color='text.secondary'>
								{subtitle}
							</Typography>
						)}
					</Box>
					{children}
				</Paper>
			</Box>
		</Container>
	)
}