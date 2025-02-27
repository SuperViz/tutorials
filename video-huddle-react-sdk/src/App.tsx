import { RoomProvider, useRoom, useVideo } from '@superviz/react'
import { VideoHuddle, MeetingState } from "@superviz/video";

import { useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import { v4 as generateId } from 'uuid'

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

export const Children = () => {
  // States ::
  const [isLoading, setIsLoading] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);

  // SuperViz userRoom hook ::
  const { joinRoom, addComponent } = useRoom();

  // Video useVideo Hook ::
  useVideo({
    onMeetingStateUpdate: (state: MeetingState) => {
       if (state === MeetingState.MEETING_READY_TO_JOIN) setIsLoading(false);
    },
    onParticipantLeft: () => setMeetingEnded(true),
    onParticipantJoined: () => setMeetingStarted(true),
  });

  // Initialize ::
  const initialize = async () => {
    setIsLoading(true);

    try {
      await joinRoom({
        participant: {
          id: generateId(),
          name: " ",
        },
        group: {
          name: "GROUP_NAME",
          id: "GROUP_ID",
        },
        roomId: `ROOM_ID`,
        environment: "dev",
      });

      const video = new VideoHuddle({
        participantType: 'host',
        brand: {
          logoUrl: "https://docs.superviz.com/logo-white.svg",
        },
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
        <div className="text-lg font-semibold text-white">Thank you for joining the video huddle</div>
      ) : meetingStarted ? (
        <div className="text-lg font-semibold text-white">Content going here</div>
      ): (
        <button
          className="bg-[#6210cc] text-white px-5 py-3 text-xs rounded-lg"
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
  )
}

export default App;
