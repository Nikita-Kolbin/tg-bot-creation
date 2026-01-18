export type MessageButton = {
	text: string
}

export type MessageNode = {
	id: string
	type: 'message'
	position: {
		x: number
		y: number
	}
	data: {
		text: string
		buttons: MessageButton[]
	}
}
