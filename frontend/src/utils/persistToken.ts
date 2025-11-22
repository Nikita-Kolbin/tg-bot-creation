const STORAGE_KEY = 'tg_platform_token_v1'

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
	} catch (e) {console.log(e)}
}
