import { useState } from "react";
import { createRoom } from "@superviz/room";
import { VideoHuddle } from "@superviz/video";
import { ImSpinner2 } from "react-icons/im";

const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);

  const initialize = async () => {

    setIsLoading(true);

    try {
      const room = await createRoom({
        developerToken: DEVELOPER_TOKEN,
        roomId: "ROOM_ID",
        participant: {
          id: Math.floor(Math.random() * 100).toString(),
          name: " ",
        },
        group: {
          id: "GROUP_ID",
          name: "GROUP_NAME",
        },
        environment: "dev",
      });

      const huddle = new VideoHuddle({
        participantType: "host",
      });

      huddle.subscribe("meeting.state.update", onMeetingStateUpdate);
      huddle.subscribe("participant.left", onParticipantLeft);

      room.addComponent(huddle);
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  };

  const onMeetingStateUpdate = (meetingState: any) => {

    // settings mounted remove loading ::
    if (meetingState === 2) setIsLoading(false);

  };

  const onParticipantLeft = (participant: any) => {
    setMeetingEnded(true);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#121212]">
      {isLoading ? (
          <ImSpinner2 className="text-4xl text-white animate-spin" />
      ) : meetingEnded ? (
        <div className="text-lg font-semibold text-white">Thank you for joining the video huddle</div>
      ) : (
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

export default App;
