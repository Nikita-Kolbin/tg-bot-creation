import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../types/auth'
import {
	loadToken,
	saveToken,
	clearToken,
	loadUser,
	saveUser,
	clearUser,
} from '../../utils/persistToken'

interface AuthState {
	user: User | null
	token: string | null
	status: 'idle' | 'loading' | 'failed'
}

const initialState: AuthState = {
	user: loadUser(),
	token: loadToken(),
	status: 'idle',
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setCredentials: (
			state,
			action: PayloadAction<{ user: User; token: string }>,
		) => {
			state.user = action.payload.user
			state.token = action.payload.token
			saveToken(action.payload.token)
			saveUser(action.payload.user)
		},
		logout: state => {
			state.user = null
			state.token = null
			clearToken()
			clearUser()
		},
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload
		},
	},
})

export const { setCredentials, logout, setUser } = authSlice.actions
export default authSlice.reducer
