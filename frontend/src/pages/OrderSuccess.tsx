import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const OrderSuccess: React.FC = () => {
	const navigate = useNavigate()
	const { botId } = useParams()

	return (
		<Box
			display='flex'
			flexDirection='column'
			alignItems='center'
			justifyContent='center'
			minHeight='100vh'
			sx={{ textAlign: 'center', padding: 2 }}
		>
			<CheckCircleIcon color='success' sx={{ fontSize: 100, mb: 2 }} />
			<Typography variant='h4' gutterBottom>
				Заказ успешно оформлен
			</Typography>
			<Button
				variant='contained'
				color='primary'
				onClick={() => navigate('/miniApp/' + botId)}
				sx={{ mt: 2 }}
			>
				Вернуться в каталог
			</Button>
		</Box>
	)
}

export default OrderSuccess
