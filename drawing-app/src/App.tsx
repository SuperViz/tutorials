import { v4 as generateId } from 'uuid'
import { useCallback, useEffect, useRef, useState } from "react"
import SuperVizRoom, { LauncherFacade, Participant, ParticipantEvent, Realtime, RealtimeComponentEvent, RealtimeMessage, WhoIsOnline } from '@superviz/sdk'
import { Board } from './components/board'
import { BoardState } from './types/global.types'
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string
const ROOM_ID = 'drawing-app'
const PLAYER_ID = generateId()

type BoardStateMessage = RealtimeMessage & {
  data: BoardState
}

export default function App() {
  const [initialized, setInitialized] = useState(false)
  const [fillColor, setFillColor] = useState('#000')
  const [ready, setReady] = useState(false)
  const [state, setState] = useState<BoardState>({
    rectangles: [],
    circles: [],
    arrows: [],
    scribbles: [],
  })

  const contentRef = useRef<HTMLDivElement | null>(null)
  const channel = useRef<any | null>(null)
  const superviz = useRef<LauncherFacade | null>(null)

  useEffect(() => {
    initialize()
  }, [])


  const handleRealtimeMessage = useCallback((message: BoardStateMessage) => {
    if(message.participantId === PLAYER_ID) return

    setState(message.data)
  }, [])

  const updateState = useCallback((state: BoardState) => {
    setState(state)

    if(channel.current) { 
      channel.current.publish('update-state', state)
    }
  }, [])

  const initialize = useCallback(async () => { 
    if(initialized) return

    superviz.current = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: { 
        id: PLAYER_ID,
        name: 'player-name',
      },
      group: { 
        id: 'drawing-app',
        name: 'drawing-app',
      }
    })

    const realtime = new Realtime()
    const whoIsOnline = new WhoIsOnline()

    superviz.current?.addComponent(realtime)
    superviz.current?.addComponent(whoIsOnline)

    setInitialized(true)

    realtime.subscribe(RealtimeComponentEvent.REALTIME_STATE_CHANGED, () => { 
      channel.current = realtime.connect('board-topic')
      channel.current.subscribe('update-state', handleRealtimeMessage)
    })

    superviz.current?.subscribe(ParticipantEvent.LOCAL_UPDATED, (participant: Participant) => {
      setFillColor(participant.slot?.color || '#000')

      if(!ready && participant.slot?.index !== 0) { 
        setReady(true)
      }
    })
  }, [handleRealtimeMessage, initialized, ready])

  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>SuperViz Drawing App</h1>
      </header>
      <main ref={contentRef} className='w-full h-full flex items-center justify-center'>
        {
          ready && (
            <Board
              state={state}
              setState={updateState}
              width={contentRef.current?.clientWidth || 0} 
              height={contentRef.current?.clientHeight || 0} 
              fillColor={fillColor}
            />
          )
        }
        {
          !ready && (
            <div className='w-full h-full flex items-center justify-center'>
              Loading...
            </div>
          )
        }
      </main>
    </div>
  )
}