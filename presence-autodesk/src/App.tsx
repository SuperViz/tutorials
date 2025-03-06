import { createRoom, Room } from "@superviz/room";
import { v4 as generateId } from "uuid";

import { useCallback, useEffect, useRef } from "react";
import { Presence3D, AutodeskPin } from "@superviz/autodesk-viewer-plugin";
import { Comments } from "@superviz/collaboration";

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
const CLIENT_ID = import.meta.env.VITE_FORGE_CLIENT_ID as string
const CLIENT_SECRET = import.meta.env.VITE_FORGE_CLIENT_SECRET as string
const DOCUMENT_ID = `urn:${btoa("urn:adsk.objects:os.object:e8d17563-1a4e-4471-bd72-a0a7e8d719bc/fileifc.ifc")}`

const App = () => {
  const autodeskViewer = useRef<Autodesk.Viewing.GuiViewer3D | null>(null)
  const roomRef = useRef<Room | null>(null);

  // Initialize ::
  const initializeSuperViz = useCallback(async () => {
    try {
      const room = await createRoom({
        developerToken: DEVELOPER_TOKEN,
        roomId: "ROOM_ID",
        participant: {
          id: generateId(),
          name: "Name " + Math.floor(Math.random() * 10),
        },
        group: {
          id: "GROUP_ID",
          name: "GROUP_NAME",
        },
      });

      // Store the room instance in the ref
      roomRef.current = room;

      const presence = new Presence3D(autodeskViewer.current!,{
        isAvatarsEnabled: false
      })
      room.addComponent(presence)

      const pinAdapter = new AutodeskPin(autodeskViewer.current!)
    const comments = new Comments(pinAdapter, {
        buttonLocation: 'top-right',
      })
      room.addComponent(comments)

    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);

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
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
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
      window.Autodesk.Viewing.Document.load(DOCUMENT_ID, onDocumentLoadSuccess, onDocumentLoadFailure);
    })

  }, [onDocumentLoadSuccess])

  useEffect(() => {
    initializeAutodesk();
  }, [initializeAutodesk]);




  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>SuperViz Presence Autodesk</h1>
      </header>
      <main className='w-full h-full flex items-center justify-center relative'>
        <div id='viewer' className='w-full h-full overflow-hidden absolute top-0 left-0 w-full! h-full! z-0'></div>
      </main>
    </div>
  );
};

export default App;
