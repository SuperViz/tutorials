import { createRoom, ParticipantEvent, Room } from "@superviz/room";
import { v4 as generateId } from 'uuid';

import { useCallback, useEffect, useState, useRef } from "react";
import { MousePointers } from "@superviz/collaboration";
import { VideoEvent, VideoHuddle } from "@superviz/video";

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

const App = () => {
  // States ::
  const [participantJoined, setParticipantJoined] = useState(false);
  const [huddleStarted, setHuddleStarted] = useState(false);

  const roomRef = useRef<Room | null>(null);

  // Initialize ::
  const initialize = useCallback(async () => {

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

      room.subscribe(ParticipantEvent.MY_PARTICIPANT_JOINED, () => setParticipantJoined(true));

      const mousePointers = new MousePointers("canvas");
      room.addComponent(mousePointers);


    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const startHuddle = async () => {
    const video = new VideoHuddle({
      participantType: 'host',
    });

    video.subscribe(VideoEvent.MY_PARTICIPANT_JOINED, () => setHuddleStarted(true));

    // Use the room instance from the ref
    if (roomRef.current) {
      roomRef.current.addComponent(video);
    }
  };


  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col relative'>
      <canvas id="canvas" className='w-full h-full'></canvas>

      {participantJoined && !huddleStarted && (
        <button
          className="bg-[#6210cc] text-white px-5 py-3 text-xs rounded-lg absolute top-5 left-5 z-10"
          onClick={startHuddle}
        >
          START VIDEO HUDDLE
        </button>
      )}
    </div>
  );
};

export default App;
