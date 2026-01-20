const STORAGE_KEY = 'tg_platform_token_v1'
const USER_STORAGE_KEY = 'tg_platform_user_v1'

export const saveToken = (token: string) => {
	try {
		localStorage.setItem(STORAGE_KEY, token)
	} catch (e) {
		console.log(e)
	}
}

export const loadToken = (): string | null => {
	try {
		return localStorage.getItem(STORAGE_KEY)
	} catch (e) {
		console.log(e)
		return null
	}
}

export const clearToken = () => {
	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch (e) {
		console.log(e)
	}
}

export const saveUser = (user: any) => {
	try {
		localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
	} catch (e) {
		console.log(e)
	}
}

export const loadUser = (): any => {
	try {
		const item = localStorage.getItem(USER_STORAGE_KEY)
		return item ? JSON.parse(item) : null
	} catch (e) {
		console.log(e)
		return null
	}
}

export const clearUser = () => {
	try {
		localStorage.removeItem(USER_STORAGE_KEY)
	} catch (e) {
		console.log(e)
	}
}
