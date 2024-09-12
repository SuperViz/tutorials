import { v4 as generateId } from 'uuid'
import { useCallback, useEffect, useState, useRef } from "react"
import SuperVizRoom, { Realtime, RealtimeComponentEvent, RealtimeMessage } from '@superviz/sdk'
import { IoMdSend } from "react-icons/io";

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string
const ROOM_ID = 'realtime-chat'

type Message = RealtimeMessage & {
  data: {
    participantName: string
    message: string
  }
}

export default function App() {
  const url = new URL(window.location.href);
  const name = url.searchParams.get('name') || 'Anonymous';

  const participant = useRef({
    id: generateId(),
    name: name,
  })
  const channel = useRef<any | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const initialize = useCallback(async () => { 
    if(initialized) return

    const superviz = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: participant.current,
      group: { 
        id: 'realtime-chat',
        name: 'realtime-chat',
      }, 
    })

    const realtime = new Realtime()
    superviz.addComponent(realtime)
    setInitialized(true)

    realtime.subscribe(RealtimeComponentEvent.REALTIME_STATE_CHANGED, () => { 
      channel.current = realtime.connect('message-topic')

      channel.current.subscribe('message', (data: Message) => {
        setMessages((prev) => [...prev, data].sort((a, b) => a.timestamp - b.timestamp))
      })
    })
  }, [initialized])

  const sendMessage = useCallback(() => {
    if(!channel.current) return

    channel.current.publish('message', {
      message,
      participantName: participant.current!.name,
    })

    setMessage('')
  }, [message])


  useEffect(() => {
    initialize()
  }, [])

  return (
    <div className='w-full h-full bg-[#e9e5ef] flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>Realtime Chat</h1>
      </header>
      <main className='flex-1 flex w-full flex-col overflow-hidden'>
        <div className='flex-1 bg-[#e9e5ef] w-full p-2'>
          {
            messages.map((message) => (
              <div className={`${message.participantId === participant.current!.id ? 'justify-end' : 'justify-start'} w-full flex mb-2`}>
                <div className={`${message.participantId === participant.current!.id ? 'bg-[#f29ee8]' : 'bg-[#baa9ff]'} text-black p-2 rounded-lg max-w-xs`}>
                  <div className={`${message.participantId === participant.current!.id ? 'text-right' : 'text-left'} text-xs text-[#57535f]`}>
                    {message.participantId === participant.current!.id ? 'You' : message.data.participantName}
                  </div>
                  {message.data.message}
                </div>
              </div>
            ))
          }
        </div>
        <div className='p-2 flex items-center justify-between gap-2 w-full'>
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
          />
          <button 
            className='bg-purple-400 text-white px-4 py-2 rounded-full disabled:opacity-50'
            onClick={sendMessage}
            disabled={!message || !channel.current}
          >
            <IoMdSend />
          </button>
        </div>
      </main>
    </div>
  )
}