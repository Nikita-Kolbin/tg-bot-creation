import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles'

interface NotificationProps {
	open: boolean
	message: string
	onClose: () => void
}

const NotificationContainer = styled('div')<{ open: boolean }>(
	({ theme, open }) => ({
		position: 'fixed',
		top: '80px',
		right: open ? '20px' : '-400px',
		backgroundColor: theme.palette.success.main,
		color: theme.palette.success.contrastText,
		padding: '12px 16px',
		borderRadius: '4px',
		boxShadow: theme.shadows[4],
		transition: 'right 0.3s ease-in-out',
		zIndex: 1000,
	})
)

const Notification: React.FC<NotificationProps> = ({
	open,
	message,
	onClose,
}) => {
	useEffect(() => {
		console.log('open')

		if (open) {
			const timer = setTimeout(() => {
				console.log('calling setShowNotification (onClose)')
				onClose()
			}, 3000)
			return () => clearTimeout(timer)
		}
	}, [open, onClose])

	if (!open) return null

	return <NotificationContainer open={open}>{message}</NotificationContainer>
}

export default Notification
