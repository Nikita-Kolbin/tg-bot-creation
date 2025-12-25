import React, { useState, useEffect } from 'react'
import { Grid, Box, Typography, Button, Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import BotCard from './BotCard'
import CreateBotModal from './CreateBotModal'
import EditBotModal from './EditBotModal'
import { useDeleteBotMutation, useUpdateBotMutation } from '../features/bots/botsApi'
import type { Bot, UpdateBotDto } from '../types/bot'

type Props = {
	bots: Bot[]
}

export default function BotsGrid({ bots }: Props) {
	const navigate = useNavigate()
	const [modalOpen, setModalOpen] = useState(false)
	const [editModalOpen, setEditModalOpen] = useState(false)
	const [selectedBot, setSelectedBot] = useState<Bot | null>(null)
	const [deleteError, setDeleteError] = useState<string | null>(null)
	const [saveError, setSaveError] = useState<string | null>(null)
	const [statusErrors, setStatusErrors] = useState<Record<string, string | null>>({})
	const [deleteBot, { isLoading: isDeleting }] = useDeleteBotMutation()
	const [updateBot, { isLoading: isSaving }] = useUpdateBotMutation()

	useEffect(() => {
		setStatusErrors({})
	}, [bots])

	const handleCreate = () => {
		setModalOpen(true)
	}

	const handleCloseModal = () => {
		setModalOpen(false)
	}

	const handleEdit = (bot: Bot) => {
		setSelectedBot(bot)
		setEditModalOpen(true)
		setSaveError(null)
	}

	const handleEditScenario = (bot: Bot) => {
		navigate(`/api/bot/edit/${bot.id}`)
	}

	const handleCloseEditModal = () => {
		setEditModalOpen(false)
		setSelectedBot(null)
		setDeleteError(null)
		setSaveError(null)
	}

	const handleSaveEdit = async (data: UpdateBotDto) => {
		if (!selectedBot) return
		setSaveError(null)
		try {
			await updateBot({ id: selectedBot.id, data }).unwrap()
			handleCloseEditModal()
		} catch (err: any) {
			setSaveError(err?.data?.message || err?.message || 'Не удалось сохранить изменения')
		}
	}

	const handleDelete = async () => {
		if (!selectedBot) return
		setDeleteError(null)
		try {
			await deleteBot(selectedBot.id).unwrap()
			handleCloseEditModal()
		} catch (err: any) {
			setDeleteError(err?.data?.message || err?.message || 'Ошибка удаления бота')
		}
	}

	const handleStatusChange = async (bot: Bot, active: boolean) => {
		setStatusErrors(prev => ({ ...prev, [bot.id]: null }))
		try {
			await updateBot({
				id: bot.id,
				data: {
					name: bot.name,
					description: bot.description || '',
					status: active ? 'active' : 'inactive',
					token: '', // токен не меняем
				}
			}).unwrap()
		} catch (err: any) {
			setStatusErrors(prev => ({ ...prev, [bot.id]: err?.data?.message || err?.message || 'Ошибка изменения статуса' }))
		}
	}

	return (
		<Box>
			{bots.length > 0 && (
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
					<Button variant='contained' onClick={handleCreate}>
						Создать бота
					</Button>
				</Box>
			)}

			{bots.length === 0 ? (
				<Box sx={{ display: 'flex', justifyContent: 'center' }}>
					<Card sx={{ width: '90%', borderRadius: 2, boxShadow: 3, p: 4, textAlign: 'center' }}>
						<CardContent>
							<AddIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
							<Typography variant='h5' sx={{ mb: 1 }}>
								У вас пока нет ботов
							</Typography>
							<Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
								Боты еще не созданы. Для создания нового бота нажмите кнопку "Создать бота"
							</Typography>
							<Button variant='contained' onClick={handleCreate}>
								Создать бота
							</Button>
						</CardContent>
					</Card>
				</Box>
			) : (
				<Grid container spacing={2}>
					{bots.map(b => (
						<Grid item key={b.id} xs={12} sm={6} md={4}>
							<BotCard
								bot={b}
								onEdit={handleEdit}
								onEditScenario={handleEditScenario}
								onStatusChange={handleStatusChange}
								statusError={statusErrors[b.id] || null}
							/>
						</Grid>
					))}
				</Grid>
			)}

			<CreateBotModal open={modalOpen} onClose={handleCloseModal} />
			<EditBotModal
				open={editModalOpen}
				onClose={handleCloseEditModal}
				bot={selectedBot}
				onSave={handleSaveEdit}
				onDelete={handleDelete}
				deleteError={deleteError}
				isDeleting={isDeleting}
				saveError={saveError}
				isSaving={isSaving}
			/>
		</Box>
	)
}
