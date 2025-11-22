import { apiSlice } from '../../api/apiSlice'
import type { SignInDto, SignUpDto, AuthResponse } from '../../types/auth'

export const authApi = apiSlice.injectEndpoints({
	endpoints: build => ({
		signIn: build.mutation<AuthResponse, SignInDto>({
			query: body => ({
				url: 'api/admin/sign-in',
				method: 'POST',
				body,
			}),
		}),
		signUp: build.mutation<AuthResponse, SignUpDto>({
			query: body => ({
				url: 'api/admin/sign-up',
				method: 'POST',
				body,
			}),
		}),
	}),
	overrideExisting: false,
})

export const { useSignInMutation, useSignUpMutation } = authApi
