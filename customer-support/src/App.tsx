import { FormElements } from "@superviz/collaboration";
import { createRoom, Room } from "@superviz/room";
import { VideoEvent, VideoHuddle } from "@superviz/video";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoIosCall } from "react-icons/io";
import { v4 as generateId } from 'uuid';

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

export default function App() {
  // States ::
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

      const formElements = new FormElements({
        fields: [
          'name',
          'email',
          'company',
          'role',
        ]
      })

      room.addComponent(formElements)


    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const startHuddle = async () => {
    const video = new VideoHuddle({
      participantType: "host",
    });

    video.subscribe(VideoEvent.MY_PARTICIPANT_JOINED, () =>
      setHuddleStarted(true)
    );

    // Use the room instance from the ref
    if (roomRef.current) {
      roomRef.current.addComponent(video);
    }
  };

  return (
    <>
      <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
        <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
          <h1 className='text-white text-2xl font-bold'>Customer Support</h1>
          {!huddleStarted && (
            <button className="rounded-full bg-green-400 p-3 text-white text-lg" onClick={startHuddle}>
              <IoIosCall />
            </button>
          )}
        </header>
        <main className='flex-1 p-20 flex w-full gap-2 items-center justify-center'>
          <form className="min-w-[500px] bg-white rounded-lg border border-solid border-gray-300 p-6 flex flex-col gap-6">
            <div>
              <label htmlFor='name' className='text-md font-bold'>Name</label>
              <input
                type='text'
                id='name'
                name='name'
                placeholder='Your Name'
                className='w-full p-3 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label htmlFor='email' className='text-md font-bold'>Email</label>
              <input
                type='text'
                id='email'
                name='email'
                placeholder='Your Email'
                className='w-full p-3 border border-gray-300 rounded-md' />
            </div>
            <div className="flex gap-2">
              <div>
                <label htmlFor='company' className='text-md font-bold'>Company</label>
                <input
                  type='text'
                  id='company'
                  name='company'
                  placeholder='Your Company'
                  className='w-full p-3 border border-gray-300 rounded-md' />
              </div>
              <div>
                <label htmlFor='role' className='text-md font-bold'>Role</label>
                <input
                  type='text'
                  id='role'
                  name='role'
                  placeholder='Your Role'
                  className='w-full p-3 border border-gray-300 rounded-md' />
              </div>
            </div>

            <button
              type='button'
              className='bg-purple-400 text-white p-3 rounded-md disabled:bg-gray-300'
            >
              Start Chat
            </button>
          </form>
        </main>
      </div>
    </>
  )
}