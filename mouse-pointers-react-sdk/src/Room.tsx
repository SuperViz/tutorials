import { MousePointers  } from "@superviz/react-sdk";

export default function Room() {
  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>SuperViz Real-Time Mouse Pointers</h1>
      </header>
      <main className='flex-1 w-full h-full'>
        <div className='w-full h-full'>
          <canvas id="canvas" className='w-full h-full'></canvas>
        </div>

        <MousePointers elementId="canvas" />
      </main>
    </div>
  )
}