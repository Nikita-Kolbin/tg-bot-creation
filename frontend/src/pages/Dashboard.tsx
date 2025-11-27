import React from 'react'
import Sidebar from '../components/ui/Sidebar'
import { Box, Container, Typography, CircularProgress } from '@mui/material'
import { useGetBotsQuery } from '../features/bots/botsApi'
import BotsGrid from '../components/BotsGrid'

export default function Dashboard() {
	const { data: bots = [], isLoading, isError } = useGetBotsQuery()

	const handleCreate = () => {
		// простой вариант: открыть страницу/модал создания
		alert('Открыть форму создания бота (реализовать позже)')
	}

	return (
		<Box sx={{ display: 'flex' }}>
			<Sidebar />
			<Container maxWidth='xl' sx={{ mt: 4, ml: 4 }}>
				<Typography variant='h4' sx={{ mb: 2 }}>
					Мои боты
				</Typography>

				{isLoading ? (
					<CircularProgress />
				) : isError ? (
					<Typography color='error'>Ошибка загрузки ботов</Typography>
				) : (
					<BotsGrid bots={bots} onCreate={handleCreate} />
				)}
			</Container>
		</Box>
	)
}
