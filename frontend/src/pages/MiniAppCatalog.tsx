
import { useParams } from 'react-router-dom'
import { Container, Typography, CircularProgress } from '@mui/material'
import { Grid } from '@mui/material'
import { useGetPublicProductsQuery } from '../features/bots/botsApi'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'
import { useMiniAppContext } from './MiniAppLayout'
import { useState } from 'react'

export default function MiniAppCatalog() {
	const { setShowAddToCart, setSelectedProduct, selectedProduct } =
		useMiniAppContext()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { botId } = useParams<{ botId: string }>()

	const {
		data: products = [],
		isLoading,
		isError,
	} = useGetPublicProductsQuery(botId!, { skip: !botId })

	if (isLoading) {
		return (
			<Container
				maxWidth='xl'
				sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
			>
				<CircularProgress />
			</Container>
		)
	}

	if (isError || !products.length) {
		return (
			<Container maxWidth='xl' sx={{ mt: 4 }}>
				<Typography variant='h6' color='error'>
					{isError ? 'Ошибка загрузки продуктов' : 'Продукты не найдены'}
				</Typography>
			</Container>
		)
	}

	return (
		<Container
			maxWidth='xl'
			sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 } }}
		>
			<Typography variant='h4' sx={{ mb: { xs: 1, sm: 2 } }}>
				Каталог продуктов
			</Typography>
			<Grid container spacing={{ xs: 1, sm: 2 }}>
				{products.map(product => (
					<Grid key={product.id} size={{ xs: 6, md: 4 }}>
						<ProductCard
							product={product}
							onClick={selected => {
								setSelectedProduct(selected)
								setShowAddToCart(true)
								setIsModalOpen(true)
							}}
						/>
					</Grid>
				))}
			</Grid>
			<ProductDetailModal
				open={isModalOpen}
				onClose={() => {
					setIsModalOpen(false)
					setSelectedProduct(null)
					setShowAddToCart(false)
				}}
				product={selectedProduct}
			/>
		</Container>
	)
}
