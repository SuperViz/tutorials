import { SuperVizRoomProvider } from '@superviz/react-sdk'
import { v4 as generateId } from 'uuid'
import Room from './Room'

const developerKey = import.meta.env.VITE_SUPERVIZ_API_KEY;
const participantId = generateId()

export default function App() {
	return (
		<SuperVizRoomProvider
			developerKey={developerKey}
			group={{
				id: 'realtime-mouse-pointers',
				name: 'realtime-mouse-pointers',
			}}
			participant={{
				id: participantId,
				name: 'Participant',
			}}
			roomId='realtime-mouse-pointers'
		>
			<Room />
		</SuperVizRoomProvider>
	)
}