import { createSlice, type PayloadAction,  } from '@reduxjs/toolkit'
import type { User } from '../../types/auth'
import { loadToken, saveToken, clearToken } from '../../utils/persistToken'

interface AuthState {
	user: User | null
	accessToken: string | null
	status: 'idle' | 'loading' | 'failed'
}

const initialState: AuthState = {
	user: null,
	accessToken: loadToken(),
	status: 'idle',
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setCredentials: (
			state,
			action: PayloadAction<{ user: User; accessToken: string }>
		) => {
			state.user = action.payload.user
			state.accessToken = action.payload.accessToken
			saveToken(action.payload.accessToken)
		},
		logout: state => {
			state.user = null
			state.accessToken = null
			clearToken()
		},
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload
		},
	},
})

export const { setCredentials, logout, setUser } = authSlice.actions
export default authSlice.reducer
