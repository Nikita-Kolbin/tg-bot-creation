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

// Функция для сортировки узлов (начало -> сообщения -> конец)
const sortNodes = (nodes: Node[]): Node[] => {
	return [...nodes].sort((a, b) => {
		// Начальный узел всегда первый
		if (a.data?.title === 'Начало') return -1
		if (b.data?.title === 'Начало') return 1

		// Конечный узел всегда последний
		if (a.data?.title === 'Конец') return 1
		if (b.data?.title === 'Конец') return -1

		// Сортировка по координатам X, затем Y для стабильного порядка
		if (a.position.x !== b.position.x) {
			return a.position.x - b.position.x
		}
		return a.position.y - b.position.y
	})
}

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

		// Создаем edges для каждой кнопки
		step.buttons.forEach((button, index) => {
			// Только если есть корректный next_step
			if (button.next_step !== undefined && button.next_step !== -1) {
				edges.push({
					id: `${step.number}-${button.next_step}-${index}`,
					source: step.number.toString(),
					target: button.next_step.toString(),
					sourceHandle: `source-${index}`,
					// Сохраняем индекс кнопки в data для надежного сопоставления
					data: { buttonIndex: index },
				})
			}
		})
	})

	return { nodes, edges }
}

// Начальные узлы
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

// Основная функция преобразования узлов и связей в шаги сценария
const generateStepsFromNodesAndEdges = (nodes: Node[], edges: Edge[]) => {
	// Сортируем узлы для стабильной нумерации
	const sortedNodes = sortNodes(nodes)

	// Создаем карту ID -> номер в отсортированном порядке
	const nodeIdToNumber = new Map<string, number>()
	sortedNodes.forEach((node, index) => {
		nodeIdToNumber.set(node.id, index)
	})

	const steps = sortedNodes.map((node, index) => {
		// Находим все исходящие связи для этого узла
		const outgoingEdges = edges.filter(e => e.source === node.id)

		// Определяем текст шага
		let text = ''
		if (node.type === 'scenario') {
			text = node.data?.title || ''
		} else if (node.type === 'message') {
			text = node.data?.text || ''
		}

		// Обрабатываем кнопки
		let buttons: { text: string; next_step: number }[] = []

		if (node.type === 'scenario') {
			// Обработка начального узла
			if (node.data?.title === 'Начало') {
				// Для начального узла берем первую исходящую связь
				if (outgoingEdges.length > 0) {
					const edge = outgoingEdges[0]
					const targetNumber = nodeIdToNumber.get(edge.target)
					// Проверяем, что связь ведет на существующий узел и не на себя
					if (targetNumber !== undefined && targetNumber !== index) {
						buttons = [{ text: 'start', next_step: targetNumber }]
					} else {
						// Если связь неверная, оставляем пустой массив
						buttons = []
					}
				} else {
					buttons = []
				}
			}
			// Для конечного узла и других scenario-узлов кнопок нет
		} else if (node.type === 'message') {
			const nodeButtons = node.data?.buttons || []

			buttons = nodeButtons.map((button: any, buttonIndex: number) => {
				// Ищем связь для этой конкретной кнопки
				const edge = outgoingEdges.find(e => {
					// Проверяем по sourceHandle (основной способ)
					if (e.sourceHandle === `source-${buttonIndex}`) return true
					// И по buttonIndex в data (резервный способ)
					if (e.data?.buttonIndex === buttonIndex) return true
					return false
				})

				if (edge) {
					const targetNumber = nodeIdToNumber.get(edge.target)
					if (targetNumber !== undefined) {
						return {
							text: button.text || 'Кнопка',
							next_step: targetNumber,
						}
					}
				}

				// Проверяем, есть ли сохраненный next_step в данных кнопки (при импорте)
				if (button.next_step !== undefined && button.next_step !== -1) {
					// Ищем узел с таким номером
					const targetNode = sortedNodes.find(
						n => nodeIdToNumber.get(n.id) === button.next_step,
					)
					if (targetNode) {
						return {
							text: button.text || 'Кнопка',
							next_step: button.next_step,
						}
					}
				}

				// Если связи нет, используем -1 (а не 0!)
				return {
					text: button.text || 'Кнопка',
					next_step: -1,
				}
			})
		}

		return {
			number: index,
			text,
			coord_x: Math.floor(node.position.x),
			coord_y: Math.floor(node.position.y),
			buttons,
		}
	})

	return steps
}

// Функция для валидации связей
const validateConnections = (nodes: Node[], edges: Edge[]): string[] => {
	const errors: string[] = []
	const nodeIds = nodes.map(n => n.id)

	nodes.forEach(node => {
		if (node.type === 'message') {
			const buttons = node.data?.buttons || []
			buttons.forEach((button: any, index: number) => {
				const edge = edges.find(
					e =>
						e.source === node.id &&
						(e.sourceHandle === `source-${index}` ||
							e.data?.buttonIndex === index),
				)

				if (!edge) {
					errors.push(
						`Кнопка "${button.text || 'Без названия'}" в сообщении "${node.data?.text || node.id}" не имеет связи`,
					)
				} else if (!nodeIds.includes(edge.target)) {
					errors.push(
						`Связь от кнопки "${button.text || 'Без названия'}" ведет на несуществующий узел`,
					)
				}
			})
		}
	})

	return errors
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
		null,
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
					scenarioData.steps,
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
		setNodes(importedNodes)
		setEdges(importedEdges)
	}

	// Обработчик публикации сценария
	const handlePublish = () => {
		if (id) {
			// Валидация связей
			const validationErrors = validateConnections(nodes, edges)
			if (validationErrors.length > 0) {
				alert(`Ошибки в сценарии:\n${validationErrors.join('\n')}`)
				return
			}

			// Проверка наличия начального и конечного узлов
			const hasStartNode = nodes.some(n => n.data?.title === 'Начало')
			const hasEndNode = nodes.some(n => n.data?.title === 'Конец')

			if (!hasStartNode || !hasEndNode) {
				alert('Сценарий должен содержать начальный и конечный узлы')
				return
			}

			const steps = generateStepsFromNodesAndEdges(nodes, edges)

			// Отладочный вывод
			console.log('Сгенерированные шаги:', steps)
			steps.forEach((step, idx) => {
				step.buttons.forEach((btn, btnIdx) => {
					if (btn.next_step === 0 && step.text !== 'Начало') {
						console.warn(
							`Шаг ${idx} (${step.text}): кнопка ${btnIdx} имеет next_step=0`,
						)
					}
				})
			})

			setScenario({ botId: parseInt(id), steps })
				.unwrap()
				.then(() => {
					setShowNotification(true)
				})
				.catch(error => {
					console.error('Ошибка публикации сценария:', error)
					alert('Ошибка при публикации сценария')
				})
		}
	}

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					height: '60px',
				}}
			>
				<div
					style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
					onClick={() => navigate(`/app/bot/edit/${id}`)}
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
				<Button variant='contained' color='secondary' onClick={handlePublish}>
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
