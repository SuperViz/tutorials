import { SuperVizRoomProvider } from '@superviz/react-sdk'
import { v4 as generateId } from 'uuid'
import Room from './Room'
import { ReactFlowProvider } from 'reactflow';

const developerKey = import.meta.env.VITE_SUPERVIZ_API_KEY;
const participantId = generateId()

export default function App() {
	return (
		<SuperVizRoomProvider
			developerKey={developerKey}
			group={{
				id: 'react-flow-tutorial',
				name: 'react-flow-tutorial',
			}}
			participant={{
				id: participantId,
				name: 'Participant',
			}}
			roomId='react-flow-tutorial'
		>
			<ReactFlowProvider>
				<Room participantId={participantId} />
			</ReactFlowProvider>
		</SuperVizRoomProvider>
	)
}