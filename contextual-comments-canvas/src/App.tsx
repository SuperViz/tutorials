import { createRoom } from "@superviz/room";
import { v4 as generateId } from "uuid";

import { useCallback, useEffect } from "react";
import { Comments, CanvasPin } from '@superviz/collaboration';

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

const App = () => {
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

	const pinAdapter = new CanvasPin("canvas");
	const comments = new Comments(pinAdapter);

	room.addComponent(comments);
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);



  return (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col relative">
      <canvas id="canvas" className="w-full h-full"></canvas>
    </div>
  );
};

export default App;
