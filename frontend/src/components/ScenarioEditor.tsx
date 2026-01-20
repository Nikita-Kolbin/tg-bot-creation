import React, { useCallback, useState, useEffect } from 'react'
import {
	ReactFlow,
	MiniMap,
	Controls,
	Background,
	addEdge,
	BackgroundVariant,
	Handle,
	Position,
	MarkerType,
} from 'reactflow'
import type {
	Node,
	Edge,
	Connection,
	
} from 'reactflow'
import 'reactflow/dist/style.css'
import MessageNode from './MessageNode'
import MessageNodeEditor from './MessageNodeEditor'

// Кастомный узел для сценария
const ScenarioNode = ({
	data,
	selected,
}: {
	id: string
	selected: boolean
	data: {
		title: string
		rows: string[]
		buttons?: Array<{ label: string }>
		onCopy: () => void
		onDelete: () => void
	}
}) => {
	return (
		<div
			style={{
				width: '250px',
				border: selected ? '2px solid #ff0000' : '2px solid #4a90e2',
				borderRadius: '10px',
				background: '#ffffff',
				boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
				fontFamily: 'Arial, sans-serif',
			}}
		>
			{/* Header */}
			<div
				style={{
					padding: '10px 15px',
					borderBottom: '1px solid #e0e0e0',
					display: 'flex',
					alignItems: 'center',
					background: '#f0f8ff',
					borderRadius:
						data.title === 'Начало' || data.title === 'Конец' ? '8px' : '8px 8px 0 0',
				}}
			>
				<span style={{ fontWeight: 'bold', color: '#333' }}>{data.title}</span>
			</div>
			{/* Body */}
			{data.title !== 'Начало' && data.title !== 'Конец' && (
				<div
					style={{
						padding: '10px 15px',
					}}
				>
					{data.rows.map((row, index) => (
						<div
							key={index}
							style={{
								padding: '5px 0',
								borderBottom:
									index < data.rows.length - 1 ? '1px solid #f0f0f0' : 'none',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<span style={{ fontSize: '14px', color: '#555' }}>{row}</span>
						</div>
					))}
				</div>
			)}
			{/* Handles */}
			{data.title === 'Начало' ? (
				<Handle
					type='source'
					position={Position.Right}
					style={{
						background: '#4a90e2',
						border: '2px solid #fff',
						width: '12px',
						height: '12px',
					}}
				/>
			) : data.title === 'Конец' ? (
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
			) : (
				<>
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
						type='source'
						position={Position.Right}
						style={{
							background: '#4a90e2',
							border: '2px solid #fff',
							width: '12px',
							height: '12px',
						}}
					/>
				</>
			)}
		</div>
	)
}

const nodeTypes = {
	scenario: ScenarioNode,
	message: MessageNode,
}

interface ScenarioEditorProps {
	nodes: Node[]
	setNodes: React.Dispatch<React.SetStateAction<Node[]>>
	onNodesChange: any
	edges: Edge[]
	setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
	onEdgesChange: any
	onAddNode: (type: string, title: string) => void
}

const ScenarioEditor: React.FC<ScenarioEditorProps> = ({
	nodes,
	setNodes,
	onNodesChange,
	edges,
	setEdges,
	onEdgesChange,

}) => {
	const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

	const onEdgeClick = useCallback(
		(event: React.MouseEvent, edge: Edge) => {
			event.stopPropagation()
			setEdges(edges => edges.map(e => ({ ...e, selected: e.id === edge.id })))
			setSelectedEdgeId(edge.id)
			setSelectedNodeId(null)
		},
		[setEdges]
	)

	const onPaneClick = useCallback(() => {
		setEdges(edges => edges.map(e => ({ ...e, selected: false })))
		setSelectedEdgeId(null)
		setSelectedNodeId(null)
	}, [setEdges])

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Delete' && selectedEdgeId) {
				setEdges(edges =>
					edges
						.filter(e => e.id !== selectedEdgeId)
						.map(e => ({ ...e, selected: false }))
				)
				setSelectedEdgeId(null)
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [selectedEdgeId, setEdges, selectedNodeId, setNodes])

	const onConnect = useCallback(
		(params: Connection) => {
			// Check if source handle already has a connection
			const hasSourceConnection = edges.some(
				edge =>
					edge.source === params.source &&
					edge.sourceHandle === params.sourceHandle
			)
			// Check if target handle already has a connection
			const hasTargetConnection = edges.some(
				edge =>
					edge.target === params.target &&
					edge.targetHandle === params.targetHandle
			)
			if (!hasSourceConnection && !hasTargetConnection) {
				setEdges(eds => addEdge(params, eds))
			}
		},
		[setEdges]
	)

	const handleDeleteNode = useCallback(() => {
		if (selectedNodeId) {
			setNodes(nodes => nodes.filter(n => n.id !== selectedNodeId))
			setSelectedNodeId(null)
		}
	}, [selectedNodeId, setNodes])

	const handleTitleChange = useCallback(
		(newTitle: string) => {
			if (selectedNodeId) {
				setNodes(nodes =>
					nodes.map(n =>
						n.id === selectedNodeId
							? { ...n, data: { ...n.data, title: newTitle } }
							: n
					)
				)
			}
		},
		[selectedNodeId, setNodes]
	)

	const handleRowsChange = useCallback(
		(newRows: string[]) => {
			if (selectedNodeId) {
				setNodes(nodes =>
					nodes.map(n =>
						n.id === selectedNodeId
							? { ...n, data: { ...n.data, rows: newRows } }
							: n
					)
				)
			}
		},
		[selectedNodeId, setNodes]
	)

	const selectedNode = selectedNodeId
		? nodes.find(n => n.id === selectedNodeId)
		: null

	return (
		<div style={{ width: '100%', height: '80vh', display: 'flex' }}>
			<div style={{ flex: 1 }}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					defaultEdgeOptions={{
						type: 'default',
						style: { stroke: '#ff6b6b', strokeWidth: 3 },
						markerEnd: { type: MarkerType.ArrowClosed },
					}}
					onNodeClick={(event, node) => {
						event.stopPropagation()
						setNodes(nodes =>
							nodes.map(n => ({ ...n, selected: n.id === node.id }))
						)
						if (node.data.title !== 'Начало' && node.data.title !== 'Конец') {
							setSelectedNodeId(node.id)
						} else {
							setSelectedNodeId(null)
						}
						setSelectedEdgeId(null)
					}}
					onEdgeClick={onEdgeClick}
					onPaneClick={onPaneClick}
					nodeTypes={nodeTypes}
					fitView
					style={{
						backgroundColor: '#023047',
						backgroundSize: '20px 20px',
					}}
				>
					<Controls />
					<MiniMap />
					<Background
						color='gray'
						lineWidth={0.5}
						variant={BackgroundVariant.Lines}
					/>
				</ReactFlow>
			</div>
			{selectedNode && (
				<div
					style={{
						width: '300px',
						background: '#f9f9f9',
						padding: '20px',
						borderLeft: '1px solid #ddd',
						overflowY: 'auto',
					}}
				>
					{selectedNode.type === 'message' ? (
						<MessageNodeEditor
							data={selectedNode.data}
							onUpdate={newData => {
								if (selectedNodeId) {
									setNodes(nodes =>
										nodes.map(n =>
											n.id === selectedNodeId ? { ...n, data: newData } : n
										)
									)
								}
							}}
							nodeId={selectedNodeId!}
							setEdges={setEdges}
						/>
					) : (
						<div>
							<h4>Настройки блока</h4>
							<div style={{ marginBottom: '20px' }}>
								<label>
									Название:
									<input
										type='text'
										value={selectedNode.data.title}
										onChange={e => handleTitleChange(e.target.value)}
										style={{ width: '100%', marginTop: '5px' }}
									/>
								</label>
							</div>
							<div style={{ marginBottom: '20px' }}>
								<label>
									Описание:
									<textarea
										value={selectedNode.data.rows.join('\n')}
										onChange={e =>
											handleRowsChange(
												e.target.value
													.split('\n')
													.map(r => r.trim())
													.filter(r => r)
											)
										}
										style={{ width: '100%', height: '100px', marginTop: '5px' }}
									/>
								</label>
							</div>
							<button
								onClick={handleDeleteNode}
								style={{
									background: '#ff6b6b',
									color: '#fff',
									border: 'none',
									padding: '10px',
									borderRadius: '5px',
									cursor: 'pointer',
									width: '100%',
								}}
							>
								Удалить блок
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default ScenarioEditor
