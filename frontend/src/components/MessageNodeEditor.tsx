import React, { useState, useEffect } from 'react'
import type { MessageButton } from '../types/flow'
import type { Edge } from 'reactflow'

interface MessageNodeEditorProps {
	data: {
		text: string
		buttons: MessageButton[]
	}
	onUpdate: (newData: { text: string; buttons: MessageButton[] }) => void
	nodeId: string
	setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
}

const MessageNodeEditor: React.FC<MessageNodeEditorProps> = ({
	data,
	onUpdate,
	nodeId,
	setEdges,
}) => {
	const [text, setText] = useState<string>(data.text)
	const [buttons, setButtons] = useState<MessageButton[]>(data.buttons)

	useEffect(() => {
		setText(data.text)
		setButtons(data.buttons)
	}, [data])

	const handleTextChange = (value: string) => {
		setText(value)
		onUpdate({ text: value, buttons })
	}

	const handleButtonChange = (
		index: number,
		field: keyof MessageButton,
		value: string
	) => {
		const newButtons = buttons.map((btn, i) =>
			i === index ? { ...btn, [field]: value } : btn
		)
		setButtons(newButtons)
		onUpdate({ text, buttons: newButtons })
	}

	const addButton = () => {
		const newButtons = [...buttons, { text: 'Кнопка' }]
		setButtons(newButtons)
		onUpdate({ text, buttons: newButtons })
	}

	const removeButton = (index: number) => {
		if (buttons.length <= 1) return
		const handleId = `source-${index}`
		setEdges(edges => {
			let newEdges = edges.filter(
				e => !(e.source === nodeId && e.sourceHandle === handleId)
			)
			newEdges = newEdges.map(e => {
				if (e.source === nodeId && e.sourceHandle) {
					const handleNum = parseInt(e.sourceHandle.split('-')[1])
					if (handleNum > index) {
						const newHandleNum = handleNum - 1
						return {
							...e,
							sourceHandle: `source-${newHandleNum}`,
						}
					}
				}
				return e
			})
			return newEdges
		})
		const newButtons = buttons.filter((_, i) => i !== index)
		setButtons(newButtons)
		onUpdate({ text, buttons: newButtons })
	}

	return (
		<div style={{ background: '#f9f9f9', width: 'auto' }}>
			<h4>Редактирование сообщения</h4>
			<div style={{ marginBottom: '20px' }}>
				<label>Текст сообщения:</label>
				<textarea
					value={text}
					onChange={e => handleTextChange(e.target.value)}
					placeholder='Введите текст сообщения'
					style={{
						width: '100%',
						height: '80px',
						marginTop: '5px',
						padding: '5px',
						border: '1px solid #ccc',
						borderRadius: '4px',
						resize: 'vertical',
					}}
				/>
			</div>
			<div style={{ marginBottom: '20px' }}>
				<label>Кнопки:</label>
				{buttons.map((button, index) => (
					<div
						key={index}
						style={{
							display: 'flex',
							alignItems: 'center',
							marginBottom: '10px',
							gap: '10px',
						}}
					>
						<input
							type='text'
							placeholder='Текст кнопки'
							value={button.text}
							onChange={e => handleButtonChange(index, 'text', e.target.value)}
							style={{
								flex: 1,
								padding: '5px',
								border: '1px solid #ccc',
								borderRadius: '4px',
							}}
						/>
						<button
							onClick={() => removeButton(index)}
							style={{
								background: '#ff6b6b',
								color: '#fff',
								border: 'none',
								padding: '5px 10px',
								borderRadius: '4px',
								cursor: 'pointer',
							}}
						>
							X
						</button>
					</div>
				))}
				<button
					onClick={addButton}
					style={{
						background: '#4a90e2',
						color: '#fff',
						border: 'none',
						padding: '10px',
						borderRadius: '4px',
						cursor: 'pointer',
						width: '100%',
					}}
				>
					Добавить кнопку
				</button>
			</div>
		</div>
	)
}

export default MessageNodeEditor
