import React from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'

interface NodeHoverActionsProps {
	onCopy: () => void
	onDelete: () => void
}

const NodeHoverActions: React.FC<NodeHoverActionsProps> = ({
	onCopy,
	onDelete,
}) => {
	return (
		<div
			style={{
				position: 'absolute',
				top: 10,
				right: 10,
				background: 'lightgray',
				zIndex: 10,
				padding: '5px',
				borderRadius: '5px',
				display: 'flex',
				gap: '5px',
			}}
		>
			<ContentCopyIcon
				onClick={onCopy}
				style={{ cursor: 'pointer', fontSize: '20px' }}
			/>
			<DeleteIcon
				onClick={onDelete}
				style={{ cursor: 'pointer', fontSize: '20px' }}
			/>
		</div>
	)
}

export default NodeHoverActions
