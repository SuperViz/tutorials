import { v4 as generateId } from 'uuid'
import { useCallback, useEffect, useRef, useState } from "react"
import SuperVizRoom, { Realtime, Channel, RealtimeComponentEvent, RealtimeMessage, WhoIsOnline } from '@superviz/sdk'
import { Chessboard } from "react-chessboard";
import { Chess, Square } from 'chess.js';

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string
const ROOM_ID = 'chess-game'
const PLAYER_ID = generateId()

type ChessMessageUpdate = RealtimeMessage & {
  data: {
    sourceSquare: Square
    targetSquare: Square
  }
}

export default function App() {
  const [initialized, setInitialized] = useState(false)
  const [gameState, setGameState] = useState<Chess>(new Chess())
  const [gameFen, setGameFen] = useState<string>(gameState.fen())

  const channel = useRef<Channel | null>(null)

  useEffect(() => {
    initialize()
  })

  const makeMove = useCallback((sourceSquare: Square, targetSquare: Square) => { 
    try {
      const gameCopy = gameState
      gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })

      setGameState(gameCopy)
      setGameFen(gameCopy.fen())

      return true
    } catch (error) {
      console.log('Invalid Move', error)
      return false
    }
  }, [gameState])

  const onPieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    const result = makeMove(sourceSquare, targetSquare)

    if(result) { 
      channel.current?.publish('new-move', {
        sourceSquare,
        targetSquare,
      })
    }

    return result
  }

  const handleRealtimeMessage = useCallback((message: ChessMessageUpdate) => {
    if(message.participantId === PLAYER_ID) return

    const { sourceSquare, targetSquare } = message.data
    makeMove(sourceSquare, targetSquare)
  }, [makeMove])

  const initialize = useCallback(async () => { 
    if(initialized) return

    const superviz = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: { 
        id: PLAYER_ID,
        name: 'player-name',
      },
      group: { 
        id: 'chess-game',
        name: 'chess-game',
      }
    })

    const realtime = new Realtime()
    const whoIsOnline = new WhoIsOnline()

    superviz.addComponent(realtime)
    superviz.addComponent(whoIsOnline)

    setInitialized(true)

    realtime.subscribe(RealtimeComponentEvent.REALTIME_STATE_CHANGED, async () => { 
      channel.current = await realtime.connect('move-topic')

      channel.current.subscribe('new-move', handleRealtimeMessage)
    })
  }, [handleRealtimeMessage, initialized])

  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>SuperViz Chess Game</h1>
      </header>
      <main className='w-full h-full flex items-center justify-center'>
        <div className='w-[500px] h-[500px] shadow-sm border-2 border-gray-300 rounded-md'>
          <Chessboard position={gameFen} onPieceDrop={onPieceDrop} />
          <div className='w-[500px] h-[50px] bg-gray-300 flex items-center justify-center'>
            <p className='text-gray-800 text-2xl font-bold'>Turn: {gameState.turn() === 'b' ? 'Black' : 'White'}</p>
          </div>
        </div>
      </main>
    </div>
  )
}