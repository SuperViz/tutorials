import { createRoom } from "@superviz/room";
import { MeetingState, VideoHuddle, VideoEvent } from "@superviz/video";

import { useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import { v4 as generateId } from 'uuid'

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

const App = () => {
  // States ::
  const [isLoading, setIsLoading] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);

  // Initialize ::
  const initialize = async () => {

    setIsLoading(true);

    try {
      const room = await createRoom({
        developerToken: DEVELOPER_TOKEN,
        roomId: "ROOM_ID",
        participant: {
          id: generateId(),
          name: " ",
        },
        group: {
          id: "GROUP_ID",
          name: "GROUP_NAME",
        },
      });

      const video = new VideoHuddle({
        participantType: "host",
      });

      video.subscribe(VideoEvent.MEETING_STATE_UPDATE, onMeetingStateUpdate);
      video.subscribe(VideoEvent.MY_PARTICIPANT_JOINED, onMeetingStarted);
      video.subscribe(VideoEvent.MY_PARTICIPANT_LEFT, onParticipantLeft);

      room.addComponent(video);
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  };

  const onMeetingStateUpdate = (meetingState: MeetingState) => {
    // settings mounted remove loading ::
    if (meetingState === MeetingState.MEETING_READY_TO_JOIN) setIsLoading(false);
  };

  const onParticipantLeft = () => {
    setMeetingEnded(true);
  };

  const onMeetingStarted = () => {
    setMeetingStarted(true);
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
          START VIDEO CONFERENCE
        </button>
      )}
    </div>
  );
};

export default App;
