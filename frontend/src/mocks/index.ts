export async function startMockServer() {
	if (import.meta.env.VITE_MODE === 'development') {
		const { worker } = await import('./browser')
		await worker.start({ onUnhandledRequest: 'bypass' })
	}
}
