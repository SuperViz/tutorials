import { useCallback, useEffect, useRef, useState } from "react"
import SuperVizRoom, { LauncherFacade, WhoIsOnline } from '@superviz/sdk'
import { v4 as generateId } from 'uuid'

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string
const ROOM_ID = 'who-is-online'

export default function App() {
  const [initialized, setInitialized] = useState(false)
  const superviz = useRef<LauncherFacade | null>(null)

  const initialize = useCallback(async () => { 
    if(initialized) return

    superviz.current = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: { 
        id: generateId(),
        name: 'participant-name',
      },
      group: { 
        id: 'who-is-online',
        name: 'who-is-online',
      }
    })


    const whoIsOnline = new WhoIsOnline({
      position: 'who-is-online',
      disablePresenceControls: true,
    })
    
    superviz.current.addComponent(whoIsOnline)

    setInitialized(true)
  }, [initialized])

  useEffect(() => {
    initialize()

    return () => {
      superviz.current?.destroy()
    }
  }, [])

  return (
    <>
      <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
        <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
          <h1 className='text-white text-2xl font-bold'>Who is Online</h1>
        </header>
        <main className='flex-1 p-20 flex w-full gap-2 items-center justify-center'>
          <div id="who-is-online"></div>
        </main>
      </div>
    </>
  )
}