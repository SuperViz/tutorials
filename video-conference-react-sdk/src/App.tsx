import { RoomProvider, useRoom, useVideo } from '@superviz/react'
import { VideoConference } from "@superviz/video";

import { useState } from 'react';
import { ImSpinner2 } from "react-icons/im";

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

export const Children = () => {
  // SuperViz userRoom hook ::
  const { joinRoom, addComponent } = useRoom();

  // SuperViz useVideo hook ::
  useVideo({
    onMeetingStateUpdate: (meetingState: any) => {
      if (meetingState === 2) setIsLoading(false);
    },
    onParticipantLeft: () => setMeetingEnded(true),
  });

  // States ::
  const [isLoading, setIsLoading] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);

  // Initialize ::
  const initialize = async () => {
    setIsLoading(true);

    try {
      await joinRoom({
        participant: {
          id: Math.floor(Math.random() * 100).toString(),
          name: " ",
        },
        group: {
          name: "GROUP_NAME",
          id: "GROUP_ID",
        },
        roomId: `ROOM_ID`,
        environment: "dev",
      });

      const video = new VideoConference({
        participantType: 'host'
      });

      addComponent(video);

    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#121212]">
      {isLoading ? (
          <ImSpinner2 className="text-4xl text-white animate-spin" />
      ) : meetingEnded ? (
        <div className="text-lg font-semibold text-white">Thank you for joining the video conference</div>
      ) : (
        <button
          className="bg-[#6210cc] text-white px-5 py-3 text-xs rounded-lg"
          onClick={initialize}
        >
          START VIDEO CONFERENCE
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
  )
}

export default App;
