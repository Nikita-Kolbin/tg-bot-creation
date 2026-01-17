import React, {
	useRef,
	useState,
	useEffect,
	useLayoutEffect,
	Fragment,
} from 'react'
import { Handle, Position, useReactFlow } from 'reactflow'
import type { MessageButton } from '../types/flow'
import NodeHoverActions from './NodeHoverActions'
import ConfirmDeleteModal from './ConfirmDeleteModal'

interface MessageNodeProps {
	id: string
	data: {
		text: string
		buttons: MessageButton[]
	}
	selected?: boolean
}

const MessageNode: React.FC<MessageNodeProps> = ({ id, data, selected }) => {
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const { setNodes, getNodes } = useReactFlow()

	const handleDeleteClick = () => setDeleteModalOpen(true)

	const handleConfirmDelete = () => {
		setNodes(nodes => nodes.filter(n => n.id !== id))
		setDeleteModalOpen(false)
	}

	const handleCloseModal = () => setDeleteModalOpen(false)

	const handleDuplicate = () => {
		const nodes = getNodes()
		const currentNode = nodes.find(n => n.id === id)
		if (!currentNode) return
		const newId = `${id}_copy_${Date.now()}`
		const newNode = {
			...currentNode,
			id: newId,
			position: { x: currentNode.position.x + 200, y: currentNode.position.y },
			data: { ...currentNode.data },
		}
		setNodes(nodes => [...nodes, newNode])
	}

	const nodeRef = useRef<HTMLDivElement>(null)
	const buttonRefs = useRef<(HTMLDivElement | null)[]>([])
	const [handlePositions, setHandlePositions] = useState<number[]>([])
	const [isHovered, setIsHovered] = useState(false)

	useEffect(() => {
		buttonRefs.current = new Array(data.buttons.length).fill(null)
	}, [data.buttons.length])

	useLayoutEffect(() => {
		if (nodeRef.current) {
			const nodeHeight = nodeRef.current.offsetHeight
			const positions: number[] = data.buttons.map((_, index) => {
				const buttonEl = buttonRefs.current[index]
				if (buttonEl) {
					const buttonTop = buttonEl.offsetTop
					const buttonHeight = buttonEl.offsetHeight
					return ((buttonTop + buttonHeight / 2) / nodeHeight) * 100
				}
				return 50
			})
			setHandlePositions(positions)
		}
	}, [data.buttons])

	return (
		<div>
			<div
				ref={nodeRef}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				style={{
					width: '250px',
					border: selected ? '3px solid #ff0000' : '2px solid #4a90e2',
					borderRadius: '10px',
					background: '#add8e6',
					boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
					fontFamily: 'Arial, sans-serif',
					position: 'relative',
				}}
			>
				{isHovered && (
					<NodeHoverActions
						onCopy={handleDuplicate}
						onDelete={handleDeleteClick}
					/>
				)}
				{/* Header */}
				<div
					style={{
						padding: '10px 15px',
						borderBottom: '1px solid #e0e0e0',
						display: 'flex',
						alignItems: 'center',
						background: '#f0f8ff',
						borderRadius: '8px 8px 0 0',
					}}
				>
					<span style={{ fontWeight: 'bold', color: '#333' }}>Сообщение</span>
				</div>
				{/* Body */}
				<div
					style={{
						padding: '10px 15px',
					}}
				>
					<div style={{ marginBottom: '10px' }}>
						<strong style={{ fontSize: '14px', color: '#333' }}>Текст:</strong>
						<div
							style={{
								marginTop: '5px',
								padding: '5px',
								background: '#fff',
								borderRadius: '4px',
								minHeight: '20px',
								wordBreak: 'break-word',
								maxWidth: '100%',
								overflowWrap: 'break-word',
							}}
						>
							{data.text || 'Введите текст сообщения'}
						</div>
					</div>
					{data.buttons.length > 0 && (
						<div>
							<strong style={{ fontSize: '12px', color: '#333' }}>
								Кнопки:
							</strong>
							{data.buttons.map((button, index) => (
								<div
									key={index}
									ref={el => {
										buttonRefs.current[index] = el
									}}
									style={{
										padding: '8px 12px',
										marginBottom: index < data.buttons.length - 1 ? '5px' : '0',
										fontSize: '12px',
										color: '#fff',
										background: '#4a90e2',
										border: '1px solid #4a90e2',
										borderRadius: '5px',
										cursor: 'pointer',
										minHeight: '32px',
									}}
								>
									{button.text}
								</div>
							))}
						</div>
					)}
				</div>
				{/* Handles */}
				<Handle
					type='target'
					position={Position.Left}
					style={{
						background: '#4a90e2',
						border: '2px solid #fff',
						width: '12px',
						height: '12px',
					}}
				/>
				<Handle
					id='source-0'
					type='source'
					position={Position.Right}
					style={{
						background: '#4a90e2',
						border: '2px solid #fff',
						width: '12px',
						height: '12px',
						top:
							data.buttons.length > 0 ? `${handlePositions[0] || 50}%` : '50%',
					}}
				/>
				{data.buttons.length > 1 &&
					data.buttons.slice(1).map((button, index) => (
						<Handle
							key={index + 1}
							id={`source-${index + 1}`}
							type='source'
							position={Position.Right}
							style={{
								background: '#4a90e2',
								border: '2px solid #fff',
								width: '12px',
								height: '12px',
								top: `${handlePositions[index + 1] || 50}%`,
							}}
						/>
					))}
			</div>
			<ConfirmDeleteModal
				open={deleteModalOpen}
				onClose={handleCloseModal}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	)
}

export default MessageNode
