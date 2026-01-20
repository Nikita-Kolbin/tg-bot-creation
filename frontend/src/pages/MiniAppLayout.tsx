import React, { createContext, useContext, useState } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import BottomNavbar from '../components/BottomNavbar'
import {
	useAddToCartMutation,
	useGetCartQuery,
} from '../features/bots/botsApi'
import { getTelegramUsername } from '../utils/telegramUtils'
import type { Product, CartItem } from '../types/bot'

interface MiniAppContextType {
	showAddToCart: boolean
	selectedProduct: Product | null
	cart: CartItem[]
	onAddToCart: () => void
	onIncreaseQuantity: () => void
	onDecreaseQuantity: () => void
	updateCartItem: (cartItem: CartItem, newQuantity: number) => void
	setShowAddToCart: (value: boolean) => void
	setSelectedProduct: (value: Product | null) => void
	botId?: string
}

const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined)

export const useMiniAppContext = () => {
	const context = useContext(MiniAppContext)
	if (!context)
		throw new Error('useMiniAppContext must be used within MiniAppLayout')
	return context
}

const MiniAppLayout: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { botId } = useParams<{ botId: string }>()
	const [showAddToCart, setShowAddToCart] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [addToCartMutation] = useAddToCartMutation()

	const username = getTelegramUsername()
	const { data: cart = [] } = useGetCartQuery(
		{ botId: botId!, username: username! },
		{ skip: !botId || !username },
	)

	const handleHomeClick = () => {
		navigate('')
	}

	const handleCartClick = () => {
		setSelectedProduct(null)
		setShowAddToCart(false)
		navigate('cart')
	}

	const handleProfileClick = () => {
		setSelectedProduct(null)
		setShowAddToCart(false)
		navigate('profile')
	}

	const onAddToCart = () => {
		if (!selectedProduct) return
		const username = getTelegramUsername()
		if (!username) {
			console.error('No username from Telegram')
			return
		}
		addToCartMutation({
			botId: selectedProduct.botId,
			productId: selectedProduct.id,
			quantity: 1,
			username,
		})
	}

	const onIncreaseQuantity = () => {
		if (!selectedProduct || !username) return
		const existing = cart.find(item => item.product_id === selectedProduct.id)
		const newQuantity = existing ? existing.quantity + 1 : 1
		addToCartMutation({
			botId: selectedProduct.botId,
			productId: selectedProduct.id,
			quantity: newQuantity,
			username,
		})
	}

	const onDecreaseQuantity = () => {
		if (!selectedProduct || !username) return
		const existing = cart.find(item => item.product_id === selectedProduct.id)
		const newQuantity = existing ? Math.max(0, existing.quantity - 1) : 0
		addToCartMutation({
			botId: selectedProduct.botId,
			productId: selectedProduct.id,
			quantity: newQuantity,
			username,
		})
	}

	const updateCartItem = (cartItem: CartItem, newQuantity: number) => {
		if (!username) return
		addToCartMutation({
			botId: botId!,
			productId: cartItem.product_id,
			quantity: newQuantity,
			username,
		})
	}

	const value = {
		showAddToCart,
		selectedProduct,
		cart,
		onAddToCart,
		onIncreaseQuantity,
		onDecreaseQuantity,
		updateCartItem,
		setShowAddToCart,
		setSelectedProduct,
		botId,
	}

	return (
		<MiniAppContext.Provider value={value}>
			<div
				style={{
					paddingBottom: location.pathname.includes('/checkout')
						? '0px'
						: '80px',
				}}
			>
				<Outlet />
				{!location.pathname.includes('/checkout') && (
					<BottomNavbar
						onHomeClick={handleHomeClick}
						onCartClick={handleCartClick}
						onProfileClick={handleProfileClick}
						onAddToCart={onAddToCart}
					/>
				)}
			</div>
		</MiniAppContext.Provider>
	)
}

export default MiniAppLayout
