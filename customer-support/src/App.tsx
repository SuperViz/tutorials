import { useCallback, useEffect, useRef, useState } from "react"
import SuperVizRoom, { FormElements, VideoConference, LauncherFacade } from '@superviz/sdk'
import { v4 as generateId } from 'uuid'
import { IoIosCall } from "react-icons/io";

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string
const ROOM_ID = 'customer-support'

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
        id: 'customer-support',
        name: 'customer-support',
      }
    })

    const formElements = new FormElements({
      fields: [
        'name', 
        'email',
        'company',
        'role',
      ]
    })

    superviz.current.addComponent(formElements)

    setInitialized(true)
  }, [initialized])

  const initializeVideo = useCallback(() => { 
    if(!initialized || !superviz.current) return

    const video = new VideoConference({
      participantType: 'host',
      collaborationMode: { 
        enabled: true,
      }
    })

    superviz.current.addComponent(video)
  }, [initialized])

  useEffect(() => {
    initialize()
  })

  return (
    <>
      <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
        <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
          <h1 className='text-white text-2xl font-bold'>Customer Support</h1>
          <button className="rounded-full bg-green-400 p-3 text-white text-lg" onClick={initializeVideo}>
            <IoIosCall />
          </button>
        </header>
        <main className='flex-1 p-20 flex w-full gap-2 items-center justify-center'>
          <form className="min-w-[500px] bg-white rounded-lg border border-solid border-gray-300 p-6 flex flex-col gap-6">
            <div>
              <label htmlFor='name' className='text-md font-bold'>Name</label>
              <input 
                type='text'
                id='name'
                name='name'
                placeholder='Your Name'
                className='w-full p-3 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label htmlFor='email' className='text-md font-bold'>Email</label>
              <input 
                type='text'
                id='email'
                name='email'
                placeholder='Your Email'
                className='w-full p-3 border border-gray-300 rounded-md' />
            </div>
            <div className="flex gap-2">
              <div>
                <label htmlFor='company' className='text-md font-bold'>Company</label>
                <input 
                  type='text'
                  id='company'
                  name='company'
                  placeholder='Your Company'
                  className='w-full p-3 border border-gray-300 rounded-md' />
              </div>
              <div>
                <label htmlFor='role' className='text-md font-bold'>Role</label>
                <input 
                  type='text'
                  id='role'
                  name='role'
                  placeholder='Your Role'
                  className='w-full p-3 border border-gray-300 rounded-md' />
              </div>
            </div>
            
            <button 
              type='button'
              className='bg-purple-400 text-white p-3 rounded-md disabled:bg-gray-300'
            >
              Start Chat
            </button>
          </form>
        </main>
      </div>
    </>
  )
}