import React, { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNodesState, useEdgesState } from 'reactflow'
import { useParams, useNavigate } from 'react-router-dom'
import { useSetScenarioMutation } from '../features/bots/botsApi'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import type { GetScenarioResponse, ScenarioStep } from '../types/bot'
import type { Node, Edge } from 'reactflow'
import ScenarioEditor from '../components/ScenarioEditor'
import BlockListModal from '../components/BlockListModal'
import ImportScenarioModal from '../components/ImportScenarioModal'
import Notification from '../components/ui/Notification'

const transformStepsToNodesAndEdges = (steps: ScenarioStep[]) => {
	const nodes: Node[] = []
	const edges: Edge[] = []

	steps.forEach(step => {
		let type: string
		let data: any

		if (step.text === 'Начало' || step.text === 'Конец') {
			type = 'scenario'
			data = {
				title: step.text,
				rows: [],
				buttons: [],
			}
		} else {
			type = 'message'
			data = {
				text: step.text,
				buttons: step.buttons.map(b => ({
					text: b.text,
					next_step: b.next_step,
				})),
			}
		}

		nodes.push({
			id: step.number.toString(),
			type,
			position: { x: step.coord_x, y: step.coord_y },
			data,
		})

		step.buttons.forEach((button, index) => {
			edges.push({
				id: `${step.number}-${button.next_step}-${index}`,
				source: step.number.toString(),
				target: button.next_step.toString(),
				sourceHandle: `source-${index}`,
			})
		})
	})

	return { nodes, edges }
}

const start: Node = {
	id: 'start',
	type: 'scenario',
	position: { x: 100, y: 100 },
	data: {
		title: 'Начало',
		rows: [],
	},
}

const end: Node = {
	id: 'end',
	type: 'scenario',
	position: { x: 600, y: 100 },
	data: {
		title: 'Конец',
		rows: [],
	},
}

const initialNodes: Node[] = [start, end]

const initialEdges: Edge[] = []

const generateStepsFromNodesAndEdges = (nodes: Node[], edges: Edge[]) => {
	const relevantNodes = nodes
	const nodeIdToNumber = new Map<string, number>()
	relevantNodes.forEach((n, index) => {
		nodeIdToNumber.set(n.id, index)
	})
	const steps = relevantNodes.map(n => {
		const nodeNumber = nodeIdToNumber.get(n.id)!
		const outgoingEdges = edges.filter(e => e.source === n.id)
		let text = ''
		if (n.type === 'scenario') {
			text = n.data.title || ''
		} else if (n.type === 'message') {
			text = n.data.text || ''
		}
		let buttons: { text: string; next_step: number }[] = []
		if (n.type === 'scenario') {
			if (n.data.title === 'Начало') {
				const edge = outgoingEdges[0]
				const targetNumber = edge ? nodeIdToNumber.get(edge.target)! : 0
				buttons = [{ text: 'start', next_step: targetNumber }]
			} else {
				buttons = []
			}
		} else {
			buttons = n.data.buttons.map((b, index) => {
				const handleId = `source-${index}`
				const edge = outgoingEdges.find(e => e.sourceHandle === handleId)
				const targetNumber = edge ? nodeIdToNumber.get(edge.target) : 0
				return { text: b.text, next_step: targetNumber }
			})
		}
		return {
			number: nodeNumber,
			text,
			coord_x: Math.floor(n.position.x),
			coord_y: Math.floor(n.position.y),
			buttons,
		}
	})
	return steps
}

const ScenarioPage: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isImportModalOpen, setIsImportModalOpen] = useState(false)
	const [showNotification, setShowNotification] = useState(false)
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const [setScenario] = useSetScenarioMutation()
	const token = useSelector((state: RootState) => state.auth.token)
	const [scenarioData, setScenarioData] = useState<GetScenarioResponse | null>(
		null
	)

	useEffect(() => {
		if (id) {
			const baseUrl = import.meta.env.VITE_API_BASE_URL || '/'
			fetch(`${baseUrl}/api/bot/scenario?bot_id=${id}`, {
				headers: {
					'Content-Type': 'application/json',
					...(token && { 'X-Token': token }),
				},
			})
				.then(res => res.json())
				.then(data => setScenarioData(data))
				.catch(console.error)
		}
	}, [id, token])

	useEffect(() => {
		if (scenarioData?.steps) {
			if (scenarioData.steps.length > 0) {
				const { nodes, edges } = transformStepsToNodesAndEdges(
					scenarioData.steps
				)

				setNodes(nodes)

				setEdges(edges)
			} else {
				setNodes([start, end])
				setEdges([])
			}
		}
	}, [scenarioData])

	const onAddNode = (type: string, title: string) => {
		const newNode: Node = {
			id: Date.now().toString(),
			type,
			position: { x: Math.random() * 500, y: Math.random() * 500 },
			data:
				type === 'message'
					? { text: '', buttons: [{ text: 'Кнопка' }] }
					: {
							title,
							icon: 'https://via.placeholder.com/20',
							rows: [],
							buttons: [],
						},
		}
		setNodes(nodes => [...nodes, newNode])
	}

	const handleExportToJson = (filename: string = 'scenario.json') => {
		const steps = generateStepsFromNodesAndEdges(nodes, edges)
		const data = { steps }
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json',
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename
		a.click()
		URL.revokeObjectURL(url)
	}

	const handleImport = async (file: File, exportFirst: boolean) => {
		if (exportFirst) {
			handleExportToJson('backup_scenario.json')
		}
		const text = await file.text()
		const data = JSON.parse(text)
		const { nodes: importedNodes, edges: importedEdges } =
			transformStepsToNodesAndEdges(data.steps)
		console.log('importedEdges:', importedEdges)
		setNodes(importedNodes)
		setEdges(importedEdges)
	}

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					height: '60px'
				}}
			>
				<div
					style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
					onClick={() => navigate(`/api/bot/edit/${id}`)}
				>
					<ArrowBack />
					<span>Настройки бота</span>
				</div>
				<div>
					<Button
						variant='contained'
						onClick={() => setIsModalOpen(true)}
						style={{ marginRight: '10px' }}
					>
						Добавить блок
					</Button>
					<Button
						variant='contained'
						onClick={() => handleExportToJson()}
						style={{ marginRight: '10px' }}
					>
						Экспорт в JSON
					</Button>
					<Button
						variant='contained'
						onClick={() => setIsImportModalOpen(true)}
						style={{ marginRight: '10px' }}
					>
						Импорт
					</Button>
				</div>
				<Button
					variant='contained'
					color='secondary'
					onClick={() => {
						if (id) {
							const relevantNodes = nodes
							const startNode = nodes.find(n => n.data.title === 'Начало')
							console.log('relevantNodes:', relevantNodes)
							console.log('startNode:', startNode)
							const nodeIdToNumber = new Map<string, number>()
							relevantNodes.forEach((n, index) => {
								nodeIdToNumber.set(n.id, index)
							})
							const steps = relevantNodes.map(n => {
								const nodeNumber = nodeIdToNumber.get(n.id)!
								const outgoingEdges = edges.filter(e => e.source === n.id)
								let text = ''
								if (n.type === 'scenario') {
									text = n.data.title || ''
								} else if (n.type === 'message') {
									text = n.data.text || ''
								}
								let buttons: { text: string; next_step: number }[] = []
								if (n.type === 'scenario') {
									if (n.data.title === 'Начало') {
										const edge = outgoingEdges[0]
										const targetNumber = edge
											? nodeIdToNumber.get(edge.target)!
											: 0
										buttons = [{ text: 'start', next_step: targetNumber }]
									} else {
										buttons = []
									}
								} else {
									buttons = n.data.buttons.map((b, index) => {
										const handleId = `source-${index}`
										const edge = outgoingEdges.find(
											e => e.sourceHandle === handleId
										)
										const targetNumber = edge
											? nodeIdToNumber.get(edge.target)
											: 0
										return { text: b.text, next_step: targetNumber }
									})
								}
								return {
									number: nodeNumber,
									text,
									coord_x: Math.floor(n.position.x),
									coord_y: Math.floor(n.position.y),
									buttons,
								}
							})
							console.log('Steps:', steps)
							setScenario({ botId: parseInt(id), steps })
								.unwrap()
								.then(() => {
									setShowNotification(true)
								})
						}
					}}
				>
					Опубликовать сценарий
				</Button>
			</div>
			<ScenarioEditor
				nodes={nodes}
				setNodes={setNodes}
				onNodesChange={onNodesChange}
				edges={edges}
				setEdges={setEdges}
				onEdgesChange={onEdgesChange}
				onAddNode={onAddNode}
			/>
			<BlockListModal
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onAddBlock={onAddNode}
			/>
			<ImportScenarioModal
				open={isImportModalOpen}
				onClose={() => setIsImportModalOpen(false)}
				onImport={handleImport}
			/>
			<Notification
				open={showNotification}
				message='Сценарий опубликован успешно!'
				onClose={() => setShowNotification(false)}
			/>
		</div>
	)
}

export default ScenarioPage
