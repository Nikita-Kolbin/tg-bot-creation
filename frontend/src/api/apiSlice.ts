import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../app/store'

export const apiSlice = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_API_BASE_URL || '/',
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth.token
			if (token) {
				headers.set('X-Token', token)
			}
			headers.set('content-type', 'application/json')
			return headers
		},
	}),
	tagTypes: ['Bots', 'Products', 'Orders'],
	endpoints: () => ({}),
})
