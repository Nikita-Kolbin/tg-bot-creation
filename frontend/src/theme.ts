import { createTheme } from '@mui/material/styles'

const theme = createTheme({
	palette: {
		mode: 'light',
		primary: { main: '#0088CC' }, // Telegram blue
		secondary: { main: '#9932CC' },
		background: {
			default: '#ffffff',
			paper: '#f5f5f5',
		},
	},
	typography: {
		fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(
			',',
		),
		h4: {
			fontSize: '1.5rem',
			'@media (max-width:600px)': {
				fontSize: '1.25rem',
			},
		},
		h6: {
			fontSize: '1.125rem',
			'@media (max-width:600px)': {
				fontSize: '1rem',
			},
		},
		body2: {
			fontSize: '0.875rem',
			'@media (max-width:600px)': {
				fontSize: '0.75rem',
			},
		},
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 960,
			lg: 1280,
			xl: 1920,
		},
	},
	components: {
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: {
				root: {
					borderRadius: 12,
					textTransform: 'none',
					fontWeight: 600,
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
				},
			},
		},
	},
})

export default theme
