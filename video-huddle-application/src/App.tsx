import { useCallback, useEffect, useRef, useState } from "react"
import SuperVizRoom, { VideoConference, LauncherFacade, MousePointers, Realtime, RealtimeComponentEvent, RealtimeComponentState, RealtimeMessage } from '@superviz/sdk'
import { v4 as generateId } from 'uuid'
import { IoIosCall } from "react-icons/io";
import { NoteNode } from "./components/note-node";
import { Note } from "./common/types";


const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string
const ROOM_ID = 'video-huddle-application'
const PARTICIPANT_ID = generateId()

export default function App() {
  const [initialized, setInitialized] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const superviz = useRef<LauncherFacade | null>(null)
  const channel = useRef<any | null>(null)

  const initialize = useCallback(async () => { 
    if(initialized) return

    superviz.current = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: { 
        id: PARTICIPANT_ID,
        name: 'my participant',
      },
      group: { 
        id: 'video-huddle-application',
        name: 'video-huddle-application',
      }, 
      environment: 'dev',
      debug: true,
    })

    const realtime = new Realtime()
    realtime.subscribe(RealtimeComponentEvent.REALTIME_STATE_CHANGED, (state) => { 
      if(state !== RealtimeComponentState.STARTED) return

      channel.current = realtime.connect('video-huddle-application')
      channel.current.subscribe('note-change', (event: RealtimeMessage) => {
        const note = event.data as Note

        if(event.participantId === PARTICIPANT_ID || !note) return

        setNotes(previus => { 
          return previus.map(n => {
            if(n.id === note.id) {
              return note
            }

            return n
          })
        })
      })
    })

    const mousePointers = new MousePointers('mouse-container')
    superviz.current.addComponent(mousePointers)
    superviz.current.addComponent(realtime)

    setInitialized(true)
    setNotes([
      { id: 'note-1', title: 'Note 1', content: 'Content 1', x: 100, y: 100 },
      { id: 'note-2', title: 'Note 2', content: 'Content 2', x: 100, y: 100 },
      { id: 'note-3', title: 'Note 3', content: 'Content 3', x: 100, y: 100 },
    ])
  }, [initialized, setNotes])

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

  const handleNoteChange = useCallback((note: Note) => {
    setNotes((prevNotes) => {
      return prevNotes.map(n => {
        if(n.id === note.id) {
          return note
        }

        return n
      })
    })

    if(channel.current) {       
      channel.current.publish('note-change', note)
    }
  }, [])

  useEffect(() => {
    initialize()
  })

  return (
    <>
      <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
        <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
          <h1 className='text-white text-2xl font-bold'>Video Huddle</h1>
          <button className="rounded-full bg-green-400 p-3 text-white text-lg" onClick={initializeVideo}>
            <IoIosCall />
          </button>
        </header>
        <main id="mouse-container" className='flex-1 p-20 flex w-full gap-2 items-center justify-center overflow-hidden'>
          {
            notes.map((note, index) => (
              <NoteNode key={index} note={note} onChange={handleNoteChange} />
            ))
          }
        </main>
      </div>
    </>
  )
}