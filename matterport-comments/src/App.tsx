import { v4 as generateId } from 'uuid'
import { useCallback, useEffect, useRef } from "react"
import SuperVizRoom, { Comments } from '@superviz/sdk'
import { MatterportPin } from '@superviz/matterport-plugin'
// @ts-expect-error TODO: fix types
import type { MpSdk } from '@superviz/matterport-plugin/dist/common/types/matterport.types.d.ts'

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string
const matterportKey = import.meta.env.VITE_MATTERPORT_KEY as string

const ROOM_ID = 'matterport-comments'
const PLAYER_ID = generateId()

interface MatterportIframe extends HTMLIFrameElement {
  window: Window & { MP_SDK: { connect: (window: Window, matterportKey: string) => Promise<MpSdk> } }
}

export default function App() {
  const matterportSDK = useRef<MpSdk | null>(null)

  useEffect(() => {
    initializeMatterport()
  }, [])

  const initializeSuperViz = useCallback(async () => { 
    const superviz = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: { 
        id: PLAYER_ID,
        name: 'player-name',
      },
      group: { 
        id: 'matterport-comments',
        name: 'matterport-comments',
      }
    })

    const pinAdapter = new MatterportPin(matterportSDK.current!, document.getElementById('showcase')!)
    const comments = new Comments(pinAdapter, {
      buttonLocation: 'top-right',
    })
    superviz.addComponent(comments)
  }, [])

  const initializeMatterport = useCallback(async () => {
    const showcase = document.getElementById('showcase') as MatterportIframe
    const showcaseWindow = showcase.contentWindow as MatterportIframe['window']
    const source = `/vendor/matterport/showcase.html?&play=1&qs=1&applicationKey=${matterportKey}&m=Zh14WDtkjdC`;
    showcase.setAttribute('src', source);

    await new Promise((resolve) => {
      showcase.addEventListener('load', async () => {
        matterportSDK.current = await showcaseWindow?.MP_SDK.connect(showcaseWindow, matterportKey);
        resolve(matterportSDK.current);
      });
    });

    initializeSuperViz()
  }, [initializeSuperViz])



  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>SuperViz Matterport Sales Tool</h1>
      </header>
      <main className='w-full h-full flex items-center justify-center relative'>
        <iframe id='showcase' className='w-full h-full' />
      </main>
    </div>
  )
}