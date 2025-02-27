import { Presence3D } from '@superviz/matterport-plugin';
import { VideoHuddle } from "@superviz/video";
import { useCallback, useEffect, useRef } from "react";
import { v4 as generateId } from 'uuid';
// @ts-expect-error TODO: fix types
import type { MpSdk } from '@superviz/matterport-plugin/dist/common/types/matterport.types.d.ts';
import { createRoom } from '@superviz/room';

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
const MATTERPORT_KEY = import.meta.env.VITE_MATTERPORT_KEY as string

const ROOM_ID = 'matterport-sales-tool'

interface MatterportIframe extends HTMLIFrameElement {
  window: Window & { MP_SDK: { connect: (window: Window, matterportKey: string) => Promise<MpSdk> } }
}

export default function App() {
  const matterportSDK = useRef<MpSdk | null>(null)

  useEffect(() => {
    initializeMatterport()
  }, [])

  const initializeSuperViz = useCallback(async () => {
    try {
      const room = await createRoom({
        developerToken: DEVELOPER_TOKEN,
        roomId: ROOM_ID,
        participant: {
          id: generateId(),
          name: " ",
        },
        group: {
          id: "GROUP_ID",
          name: "GROUP_NAME",
        },
      });

      const presence = new Presence3D(matterportSDK.current!)
      room.addComponent(presence)

      const video = new VideoHuddle({
        participantType: "host",
      });

     room.addComponent(video);
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, [])

  const initializeMatterport = useCallback(async () => {
    const showcase = document.getElementById('showcase') as MatterportIframe
    const showcaseWindow = showcase.contentWindow as MatterportIframe['window']
    const source = `/vendor/matterport/showcase.html?&play=1&qs=1&applicationKey=${MATTERPORT_KEY}&m=5m4i274y1aV`;
    showcase.setAttribute('src', source);

    await new Promise((resolve) => {
      showcase.addEventListener('load', async () => {
        matterportSDK.current = await showcaseWindow?.MP_SDK.connect(showcaseWindow, MATTERPORT_KEY);
        resolve(matterportSDK.current);
      });
    });

    initializeSuperViz()
  }, [initializeSuperViz])



  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <main className='w-full h-full flex items-center justify-center relative'>
        <iframe id='showcase' className='w-full h-full' />
      </main>
    </div>
  )
}