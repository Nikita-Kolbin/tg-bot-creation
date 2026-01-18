import React from 'react'
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
import HomeIcon from '@mui/icons-material/Home'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { logout } from '../../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'

const drawerWidth = 260

export default function Sidebar() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const user = useAppSelector(s => s.auth.user)

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
				<Avatar>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Avatar>
				<Box>
					<Typography variant='subtitle1'>{user?.name ?? 'User'}</Typography>
					<Typography variant='caption' color='text.secondary'>
						{user?.email ?? ''}
					</Typography>
				</Box>
			</Box>

			<List>
				<ListItemButton onClick={() => navigate('/')}>
					<ListItemIcon>
						<HomeIcon />
					</ListItemIcon>
					<ListItemText primary='Домой' />
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
