import { type JSX } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

type Props = { children: JSX.Element }

export const PrivateRoute = ({ children }: Props) => {
	const token = useAppSelector(s => s.auth.token)
	if (!token) {
		return <Navigate to='/signin' replace />
	}
	return children
}
