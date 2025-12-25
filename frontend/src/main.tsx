import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

import { CssBaseline, ThemeProvider } from '@mui/material'

import theme from './theme'


const container = document.getElementById('root')!
const root = createRoot(container)

// mock switch
//import { startMockServer } from './mocks'
 
//startMockServer()

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<BrowserRouter>
					<Routes>
						<Route path='/signin' element={<SignIn />} />
						<Route path='/signup' element={<SignUp />} />
						<Route path='/*' element={<App />} />
					</Routes>
				</BrowserRouter>
			</ThemeProvider>
		</Provider>
	</React.StrictMode>
)
