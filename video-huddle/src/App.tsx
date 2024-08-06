import { useCallback, useEffect, useRef, useState } from "react"
import SuperVizRoom, { VideoConference, LauncherFacade } from '@superviz/sdk'
import { v4 as generateId } from 'uuid'
import { IoIosCall } from "react-icons/io";

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string
const ROOM_ID = 'video-huddle'

export default function App() {
  const [initialized, setInitialized] = useState(false)
  const [videoInitialized, setVideoInitialized] = useState(false)
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
        id: 'video-huddle',
        name: 'video-huddle',
      }
    })

    setInitialized(true)
  }, [initialized])

  const initializeVideo = useCallback(() => { 
    if(!initialized || !superviz.current) return

    const video = new VideoConference({
      participantType: 'host',
    })

    superviz.current.addComponent(video)
    setVideoInitialized(true)
  }, [initialized])

  useEffect(() => {
    initialize()
  })

  return (
    <>
      <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
        <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
          <h1 className='text-white text-2xl font-bold'>Video Huddle</h1>
          {
            !videoInitialized && (
              <button className="rounded-full bg-green-400 p-3 text-white text-lg disabled:opacity-75" onClick={initializeVideo} disabled={!initialized}>
                <IoIosCall />
              </button>
            ) 
          }
        </header>
        <main className='w-full h-full bg-app-background bg-[24px_10%] bg-no-repeat bg-[length:70%_auto]'></main>
      </div>
    </>
  )
}