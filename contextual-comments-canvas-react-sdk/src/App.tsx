import { Comments, CanvasPin } from '@superviz/collaboration';
import { RoomProvider, useRoom } from '@superviz/react';
import { useCallback, useEffect } from "react";
import { v4 as generateId } from 'uuid';

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

export const Children = () => {

  const { joinRoom, addComponent } = useRoom();

  // Use the joinRoom function from the hook in the callback
  const initializeSuperViz = useCallback(async () => {
    try {
      await joinRoom({
        participant: {
          id: generateId(),
          name: "Name " + Math.floor(Math.random() * 10),
        },
        group: {
          name: "GROUP_NAME",
          id: "GROUP_ID",
        },
        roomId: `ROOM_ID`,
      });

      const pinAdapter = new CanvasPin("canvas");
      const comments = new Comments(pinAdapter);
      addComponent(comments);

    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, [joinRoom, addComponent]);

  useEffect(() => {
    initializeSuperViz();
  }, [initializeSuperViz]);


  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col relative'>
      <canvas id="canvas" className='w-full h-full bg-red-500'></canvas>
    </div>
  );
};

export function App() {
  return (
    <RoomProvider developerToken={DEVELOPER_TOKEN}>
      <Children />
    </RoomProvider>
  );
}

export default App;
