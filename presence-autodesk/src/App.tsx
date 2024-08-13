import { v4 as generateId } from 'uuid'
import { useCallback, useEffect, useRef } from "react"
import SuperVizRoom, { Comments } from '@superviz/sdk'
import { Presence3D, AutodeskPin } from '@superviz/autodesk-viewer-plugin'

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string
const clientId = import.meta.env.VITE_AUTODESK_CLIENT_ID as string
const clientSecret = import.meta.env.VITE_AUTODESK_CLIENT_SECRET as string
const documentId = `urn:${btoa("urn:adsk.objects:os.object:e8d17563-1a4e-4471-bd72-a0a7e8d719bc/fileifc.ifc")}`

const ROOM_ID = 'presence-autodesk'
const PLAYER_ID = generateId()

export default function App() {
  const autodeskViewer = useRef<Autodesk.Viewing.GuiViewer3D | null>(null)

  useEffect(() => {
    initializeAutodesk()
  }, [])

  const initializeSuperViz = useCallback(async () => { 
    const superviz = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: { 
        id: PLAYER_ID,
        name: 'player-name',
      },
      group: { 
        id: 'presence-autodesk',
        name: 'presence-autodesk',
      }
    })

    const presence = new Presence3D(autodeskViewer.current!)
    superviz.addComponent(presence)

    const pinAdapter = new AutodeskPin(autodeskViewer.current!)
    const comments = new Comments(pinAdapter, {
      buttonLocation: 'top-right',
    })
    superviz.addComponent(comments)
  }, [])


  const onDocumentLoadSuccess = useCallback(async (document: Autodesk.Viewing.Document) => {
    const viewable = document.getRoot().getDefaultGeometry();

    if(!viewable) return

    try {
      await autodeskViewer.current!.loadDocumentNode(document, viewable, {
        applyScaling: 'meters'
      })

      await initializeSuperViz()
    } catch (error) { 
      console.log('Document loaded failed', error)
    }

  }, [initializeSuperViz])

  const onDocumentLoadFailure = () => {
    console.log('Document loaded failed')
  }

  const initializeAutodesk = useCallback(async () => {
    const viewerElement = document.getElementById('viewer')!

    const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'data:read bucket:read',
      }).toString()
    })

    const data = await response.json()

    const options = {
      env: 'AutodeskProduction2',
      api: 'streamingV2',
      accessToken: data.access_token,
    }

    window.Autodesk.Viewing.Initializer(options, async () => {
      const viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerElement)
      await viewer.start()

      viewer.setTheme("dark-theme");
      viewer.setQualityLevel(false, false);
      viewer.setGhosting(false);
      viewer.setGroundShadow(false);
      viewer.setGroundReflection(false);
      viewer.setOptimizeNavigation(true);
      viewer.setProgressiveRendering(true);

      autodeskViewer.current = viewer
      window.Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    })

  }, [onDocumentLoadSuccess])



  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>SuperViz Presence Autodesk</h1>
      </header>
      <main className='w-full h-full flex items-center justify-center relative'>
        <div id='viewer' className='w-full h-full overflow-hidden absolute top-0 left-0 w-full! h-full! z-0'></div>
      </main>
    </div>
  )
}