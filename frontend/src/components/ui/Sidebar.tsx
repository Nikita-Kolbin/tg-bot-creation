import { useEffect } from 'react'
import {
	Drawer,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Avatar,
	Box,
	Typography,
} from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { logout } from '../../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'

const drawerWidth = 260

export default function Sidebar() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const user = useAppSelector(s => s.auth.user)
	const token = useAppSelector(s => s.auth.token)

	useEffect(() => {
		if (!token) {
			navigate('/signin')
		}
	}, [token, navigate])

	return (
		<Drawer
			variant='permanent'
			sx={{
				width: drawerWidth,
				flexShrink: 0,
				'& .MuiDrawer-paper': {
					width: drawerWidth,
					boxSizing: 'border-box',
					px: 2,
					py: 3,
				},
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
				<Avatar>{user?.username?.[0]?.toUpperCase() ?? 'U'}</Avatar>
				<Box>
					<Typography variant='subtitle1'>
						{user?.username ?? 'User'}
					</Typography>
				</Box>
			</Box>

			<List>
				<ListItemButton onClick={() => navigate('/')}>
					<ListItemIcon>
						<SmartToyIcon />
					</ListItemIcon>
					<ListItemText primary='Список ботов' />
				</ListItemButton>

				<ListItemButton
					onClick={() => {
						dispatch(logout())
						navigate('/signin')
					}}
				>
					<ListItemIcon>
						<LogoutIcon />
					</ListItemIcon>
					<ListItemText primary='Выход' />
				</ListItemButton>
			</List>
		</Drawer>
	)
}
