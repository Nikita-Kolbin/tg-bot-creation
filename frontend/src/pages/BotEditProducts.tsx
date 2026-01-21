import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/ui/Sidebar'
import {
	Box,
	Container,
	Typography,
	Card,
	CardContent,
	Button,
	Switch,
	IconButton,
	Tabs,
	Tab,
	TextField,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Grid,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CreateProductModal from '../components/CreateProductModal'
import EditProductModal from '../components/EditProductModal'
import OrderDetailModal from '../components/OrderDetailModal'
import {
	useGetBotByIdQuery,
	useUpdateBotMutation,
	useGetProductsQuery,
	useGetBotOrdersQuery,
} from '../features/bots/botsApi'
import type { Product, Order } from '../types/bot'
import AddMiniAppModal from '../components/AddMiniAppModal'

export default function BotEditScenario() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { data: bot, isLoading, isError } = useGetBotByIdQuery(id!)
	const [updateBot, { isLoading: isUpdating }] = useUpdateBotMutation()
	const [localActive, setLocalActive] = useState(bot?.active ?? false)
	useEffect(() => {
		setLocalActive(bot?.active ?? false)
	}, [bot?.active])
	const [activeTab, setActiveTab] = useState(0)
	const [search, setSearch] = useState('')
	const [productModalOpen, setProductModalOpen] = useState(false)
	const [editProductModalOpen, setEditProductModalOpen] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false)
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const botUrl = useMemo(
		() => (bot?.username ? `https://t.me/${bot.username}` : ''),
		[bot],
	)
	const { data: products = [] } = useGetProductsQuery(id!, { skip: !id })
	const { data: orders = [] } = useGetBotOrdersQuery(id!, { skip: !id })

	const filteredProducts = useMemo(() => {
		if (search.length < 2) return products
		return products.filter(product =>
			product.name.toLowerCase().includes(search.toLowerCase()),
		)
	}, [products, search])

	const analytics = useMemo(() => {
		const now = new Date()
		const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
		const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

		const allOrders = orders
		const dayOrders = orders.filter(o => new Date(o.createdAt) > oneDayAgo)
		const weekOrders = orders.filter(o => new Date(o.createdAt) > oneWeekAgo)
		const monthOrders = orders.filter(o => new Date(o.createdAt) > oneMonthAgo)

		const uniqueCustomers = new Set(orders.map(o => o.username)).size

		const allTotal = orders.reduce((sum, o) => sum + o.totalAmount, 0)
		const dayTotal = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
		const weekTotal = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0)
		const monthTotal = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0)

		return {
			allOrders: allOrders.length,
			monthOrders: monthOrders.length,
			weekOrders: weekOrders.length,
			dayOrders: dayOrders.length,
			uniqueCustomers,
			allTotal,
			monthTotal,
			weekTotal,
			dayTotal,
		}
	}, [orders])

	const tabs = ['Товары', 'История заказов', 'Аналитика']

	const copyLink = async () => {
		if (botUrl) {
			try {
				await navigator.clipboard.writeText(botUrl)
				alert('Ссылка скопирована')
			} catch {
				alert('Не удалось скопировать')
			}
		}
	}

	const handleStatusChange = async (active: boolean) => {
		setLocalActive(active)
		try {
			await updateBot({
				id: bot.id,
				data: {
					name: bot.name,
					username: bot.username,
					description: bot.description || '',
					status: active ? 'active' : 'inactive',
					token: '',
				},
			}).unwrap()
		} catch {
			alert('Ошибка изменения статуса')
			setLocalActive(!active)
		}
		// setLocalActive(!active)
	}

	const [isAddMiniAppOpen, setIsAddMiniAppOpen] = useState(false)
	const handleAddMiniApp = () => setIsAddMiniAppOpen(true)

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue)
	}

	const handleCreateProduct = () => {
		setProductModalOpen(true)
	}

	const handleCloseProductModal = () => {
		setProductModalOpen(false)
	}

	const handleEditProduct = (product: Product) => {
		setSelectedProduct(product)
		setEditProductModalOpen(true)
	}

	const handleOrderClick = (order: Order) => {
		setSelectedOrder(order)
		setOrderDetailModalOpen(true)
	}

	const handleCloseOrderDetailModal = () => {
		setOrderDetailModalOpen(false)
		setSelectedOrder(null)
	}

	const handleCloseEditProductModal = () => {
		setEditProductModalOpen(false)
		setSelectedProduct(null)
	}

	const renderTabContent = () => {
		switch (activeTab) {
			case 0: // Товары
				return (
					<Box>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								mb: 2,
							}}
						>
							<TextField
								label='Поиск по наименованию'
								variant='outlined'
								value={search}
								onChange={e => setSearch(e.target.value)}
								sx={{ width: 300 }}
							/>
							<Button variant='contained' onClick={handleCreateProduct}>
								Создать товар
							</Button>
						</Box>
						<Table sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
							<TableHead sx={{ backgroundColor: 'primary.main' }}>
								<TableRow>
									<TableCell
										sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
									>
										Превью
									</TableCell>
									<TableCell
										sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
									>
										Наименование
									</TableCell>
									<TableCell
										sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
									>
										Описание
									</TableCell>
									<TableCell
										sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
									>
										Цена
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredProducts.map(product => (
									<TableRow
										key={product.id}
										onClick={() => handleEditProduct(product)}
										sx={{
											'&:hover': {
												backgroundColor: 'action.hover',
												cursor: 'pointer',
											},
											transition: 'background-color 0.2s ease',
										}}
									>
										<TableCell>
											{product.previewUrl ? (
												<img
													src={product.previewUrl}
													alt={product.name}
													style={{
														width: 50,
														height: 50,
														objectFit: 'cover',
														borderRadius: 4,
													}}
												/>
											) : (
												'Нет превью'
											)}
										</TableCell>
										<TableCell sx={{ fontWeight: 500 }}>
											{product.name}
										</TableCell>
										<TableCell
											sx={{
												maxWidth: 200,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										>
											{product.description}
										</TableCell>
										<TableCell sx={{ fontWeight: 500, color: 'primary.main' }}>
											{product.price} ₽
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Box>
				)
			case 1: // История заказов
				return (
					<Table sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
						<TableHead sx={{ backgroundColor: 'primary.main' }}>
							<TableRow>
								<TableCell
									sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
								>
									ID
								</TableCell>
								<TableCell
									sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
								>
									Username
								</TableCell>
								<TableCell
									sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
								>
									Статус
								</TableCell>
								<TableCell
									sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
								>
									Общая сумма
								</TableCell>
								<TableCell
									sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
								>
									Заказ создан
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{orders.map(order => (
								<TableRow
									key={order.id}
									onClick={() => handleOrderClick(order)}
									sx={{
										'&:hover': {
											backgroundColor: 'action.hover',
											cursor: 'pointer',
										},
										transition: 'background-color 0.2s ease',
									}}
								>
									<TableCell>{order.id}</TableCell>
									<TableCell>{order.username}</TableCell>
									<TableCell>{order.status}</TableCell>
									<TableCell>{order.totalAmount} ₽</TableCell>
									<TableCell>
										{new Date(order.createdAt).toLocaleString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)
			case 2: // Аналитика
				return (
					<Grid container spacing={3}>
						<Grid item xs={12} sm={6} md={3}>
							<Card sx={{ borderRadius: 2, boxShadow: 2 }}>
								<CardContent>
									<Typography variant='h6' color='text.secondary'>
										Заказы за все время
									</Typography>
									<Typography variant='h4' color='primary.main'>
										{analytics.allOrders}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<Card sx={{ borderRadius: 2, boxShadow: 2 }}>
								<CardContent>
									<Typography variant='h6' color='text.secondary'>
										Заказы за месяц
									</Typography>
									<Typography variant='h4' color='primary.main'>
										{analytics.monthOrders}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<Card sx={{ borderRadius: 2, boxShadow: 2 }}>
								<CardContent>
									<Typography variant='h6' color='text.secondary'>
										Заказы за неделю
									</Typography>
									<Typography variant='h4' color='primary.main'>
										{analytics.weekOrders}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<Card sx={{ borderRadius: 2, boxShadow: 2 }}>
								<CardContent>
									<Typography variant='h6' color='text.secondary'>
										Заказы за день
									</Typography>
									<Typography variant='h4' color='primary.main'>
										{analytics.dayOrders}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<Card sx={{ borderRadius: 2, boxShadow: 2 }}>
								<CardContent>
									<Typography variant='h6' color='text.secondary'>
										Сумма за все время
									</Typography>
									<Typography variant='h4' color='success.main'>
										{analytics.allTotal} ₽
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<Card sx={{ borderRadius: 2, boxShadow: 2 }}>
								<CardContent>
									<Typography variant='h6' color='text.secondary'>
										Сумма за месяц
									</Typography>
									<Typography variant='h4' color='success.main'>
										{analytics.monthTotal} ₽
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<Card sx={{ borderRadius: 2, boxShadow: 2 }}>
								<CardContent>
									<Typography variant='h6' color='text.secondary'>
										Сумма за неделю
									</Typography>
									<Typography variant='h4' color='success.main'>
										{analytics.weekTotal} ₽
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<Card sx={{ borderRadius: 2, boxShadow: 2 }}>
								<CardContent>
									<Typography variant='h6' color='text.secondary'>
										Сумма за день
									</Typography>
									<Typography variant='h4' color='success.main'>
										{analytics.dayTotal} ₽
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<Card sx={{ borderRadius: 2, boxShadow: 2 }}>
								<CardContent>
									<Typography variant='h6' color='text.secondary'>
										Количество покупателей
									</Typography>
									<Typography variant='h4' color='success.main'>
										{analytics.uniqueCustomers}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				)
			default:
				console.log(activeTab)

				return <Typography variant='h6'>Вкладка {tabs[activeTab]}</Typography>
		}
	}

	if (isLoading)
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
				<Typography>Загрузка...</Typography>
			</Box>
		)
	if (isError || !bot)
		return <Typography color='error'>Ошибка загрузки бота</Typography>

	return (
		<Box sx={{ display: 'flex' }}>
			<Sidebar />
			<Container maxWidth='xl' sx={{ mt: 4, ml: 4 }}>
				<Typography variant='h4' sx={{ mb: 2 }}>
					Настройка бота
				</Typography>
				<Card
					sx={{ width: '100%', borderRadius: 3, boxShadow: 3, p: 3, mb: 4 }}
				>
					<CardContent>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'flex-start',
							}}
						>
							<Box sx={{ flex: 1 }}>
								<Typography variant='h5' sx={{ mb: 2 }}>
									{bot.name}
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Typography variant='body2' sx={{ fontWeight: 500 }}>
										Статус:
									</Typography>
									<Switch
										checked={localActive}
										onChange={e => handleStatusChange(e.target.checked)}
										sx={{
											'& .MuiSwitch-switchBase.Mui-checked': {
												color: 'success.main',
												'& + .MuiSwitch-track': {
													backgroundColor: 'success.main',
												},
											},
											'& .MuiSwitch-switchBase': {
												color: 'error.main',
												'& + .MuiSwitch-track': {
													backgroundColor: 'error.main',
												},
											},
										}}
									/>
								</Box>
							</Box>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'flex-end',
									gap: 2,
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Button variant='contained' onClick={handleAddMiniApp}>
										Добавить Miniapp
									</Button>

									<Button
										variant='contained'
										onClick={() => navigate(`/app/bot/edit/${bot.id}/scenario`)}
									>
										Редактировать сценарий
									</Button>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<a
										href={botUrl}
										target='_blank'
										rel='noreferrer'
										style={{ color: 'inherit', textDecoration: 'none' }}
									>
										{botUrl}
									</a>
									<IconButton onClick={copyLink}>
										<ContentCopyIcon />
									</IconButton>
								</Box>
								<Typography variant='body2' color='text.secondary'>
									Создан: {new Date(bot.createdAt).toLocaleString()}
								</Typography>
							</Box>
						</Box>
					</CardContent>
				</Card>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					sx={{
						'& .MuiTabs-indicator': {
							backgroundColor: 'primary.main',
						},
						'& .MuiTab-root': {
							minWidth: 'auto',
							px: 2,
							py: 1,
						},
						borderBottom: 1,
						borderColor: 'divider',
					}}
				>
					{tabs.map(tab => (
						<Tab key={tab} label={tab} />
					))}
				</Tabs>
				<Box sx={{ mt: 2 }}>{renderTabContent()}</Box>
			</Container>
			<CreateProductModal
				open={productModalOpen}
				onClose={handleCloseProductModal}
				botId={bot.id}
			/>
			<EditProductModal
				open={editProductModalOpen}
				onClose={handleCloseEditProductModal}
				product={selectedProduct}
			/>
			<OrderDetailModal
				open={orderDetailModalOpen}
				onClose={handleCloseOrderDetailModal}
				order={selectedOrder}
				botId={bot.id}
			/>
			<AddMiniAppModal
				open={isAddMiniAppOpen}
				onClose={() => setIsAddMiniAppOpen(false)}
				bot={bot}
			/>
		</Box>
	)
}
