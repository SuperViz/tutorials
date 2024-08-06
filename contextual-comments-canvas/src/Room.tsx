import { useCanvasPin, useComments, Comments  } from "@superviz/react-sdk";

export default function Room() {

  const { openThreads, closeThreads } = useComments()
  const { pin } = useCanvasPin({ canvasId: 'canvas' })

  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>SuperViz Contextual Comments</h1>
        <div id="comments" className='flex gap-2'></div>
      </header>
      <main className='flex-1 w-full h-full'>
        <div className='w-full h-full'>
          <canvas id="canvas" className='w-full h-full'></canvas>
        </div>

        {/* SuperViz */}
        <Comments 
          pin={pin} 
          position='left' 
          buttonLocation='comments' 
          onPinActive={openThreads}
          onPinInactive={closeThreads}
        />
      </main>
    </div>
  )
}