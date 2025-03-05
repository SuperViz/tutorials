import { MousePointers } from '@superviz/collaboration';
import { RoomProvider, useRoom } from '@superviz/react';
import { VideoHuddle } from "@superviz/video";
import { useCallback, useEffect, useState } from "react";
import { v4 as generateId } from 'uuid';

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

export const Children = () => {
  const [participantJoined, setParticipantJoined] = useState(false);

  const { joinRoom, addComponent } = useRoom({
    onMyParticipantJoined: () => {
      setParticipantJoined(true);
    },
  });

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

      const mousePointers = new MousePointers("canvas");
      addComponent(mousePointers);
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, [joinRoom, addComponent]);

  useEffect(() => {
    initializeSuperViz();
  }, [initializeSuperViz]);

  useEffect(() => {
  }, [participantJoined]);

  const initialize = async () => {
    const video = new VideoHuddle({
      participantType: 'host',
    });
    addComponent(video);
  };

  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col relative'>
      <canvas id="canvas" className='w-full h-full'></canvas>

      {participantJoined && (
        <button
          className="bg-[#6210cc] text-white px-5 py-3 text-xs rounded-lg absolute top-5 left-5 z-10"
          onClick={initialize}
        >
          START VIDEO HUDDLE
        </button>
      )}
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
