# Step-by-Step Tutorial: How to build a collaborative Drawing App

In this tutorial, we will guide you through creating a collaborative drawing application using SuperViz. This type of application allows multiple users to draw, annotate, and interact with a shared canvas in real-time. It's perfect for brainstorming sessions, collaborative design work, and interactive presentations.

We'll demonstrate how to set up a React application that leverages SuperViz to synchronize drawing activities between participants. By the end of this tutorial, you'll have a fully functional collaborative drawing app that you can extend and customize to suit your needs.

Let's get started!

---

### Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate SuperViz for real-time collaboration.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest drawing-app -- --template react-ts
cd drawing-app
```

Vite is a modern build tool that provides a faster and more efficient development experience compared to Create React App. It also supports TypeScript out of the box.

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/sdk konva react-konva uuid
```

- **@superviz/sdk:** For integrating real-time collaboration features.
- **konva & react-konva:** Libraries for creating and managing a canvas-based drawing interface in React.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

### Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and manage the collaborative drawing board.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the collaborative drawing experience.

```tsx
import { v4 as generateId } from 'uuid';
import { useCallback, useEffect, useRef, useState } from "react";
import SuperVizRoom, { LauncherFacade, MousePointers, Participant, ParticipantEvent, Realtime, RealtimeComponentEvent, RealtimeMessage, WhoIsOnline } from '@superviz/sdk';
import { Board } from './components/board';
import { BoardState } from './types/global.types';
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz, UUID, and the Konva-based Board component for managing the drawing interface and real-time collaboration.

### 2. Define Constants

Define constants for the API key, room ID, and participant ID.

```tsx
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = 'drawing-app';
const PLAYER_ID = generateId();
```

**Explanation:**

- **apiKey:** Retrieves the SuperViz API key from environment variables.
- **ROOM_ID & PLAYER_ID:** Defines the room ID for the SuperViz session and generates a unique player ID for each participant.

### 3. Create the App Component

Set up the main `App` component and initialize the drawing board and SuperViz.

```tsx
export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [fillColor, setFillColor] = useState('#000');
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<BoardState>({
    rectangles: [],
    circles: [],
    arrows: [],
    scribbles: [],
  });

  const contentRef = useRef<HTMLDivElement | null>(null);
  const channel = useRef<any | null>(null);
  const superviz = useRef<LauncherFacade | null>(null);
```

**Explanation:**

- **useState & useRef:** Manages the initialization state, drawing color, readiness of the board, and the SuperViz instance.
- **state:** Holds the current state of the drawing board, including all shapes and scribbles.

### 4. Initialize SuperViz

Create a function to initialize SuperViz and set up real-time collaboration for the drawing board.

```tsx
const initialize = useCallback(async () => {
  if (initialized) return;

  superviz.current = await SuperVizRoom(apiKey, {
    roomId: ROOM_ID,
    participant: {
      id: PLAYER_ID,
      name: 'player-name',
    },
    group: {
      id: 'drawing-app',
      name: 'drawing-app',
    }
  });

  const realtime = new Realtime();
  const whoIsOnline = new WhoIsOnline();

  superviz.current?.addComponent(realtime);
  superviz.current?.addComponent(whoIsOnline);

  setInitialized(true);

  realtime.subscribe(RealtimeComponentEvent.REALTIME_STATE_CHANGED, () => {
    channel.current = realtime.connect('board-topic');
    channel.current.subscribe('update-state', handleRealtimeMessage);
  });

  superviz.current?.subscribe(ParticipantEvent.LOCAL_UPDATED, (participant: Participant) => {
    setFillColor(participant.slot?.color || '#000');

    if (!ready && participant.slot?.index !== 0) {
      setReady(true);

      const mousePointers = new MousePointers('board-container');
      superviz.current?.addComponent(mousePointers);
    }
  });
}, [handleRealtimeMessage, initialized, ready]);
```

**Explanation:**

- **initialize:** Sets up SuperViz, integrates real-time updates for the drawing board, and adds mouse pointers to track participant actions.
- **Realtime & WhoIsOnline:** Handles real-time communication and displays online participants.

### 5. Handle Real-Time Messages

Create functions to handle incoming real-time messages and update the board state.

```tsx
const handleRealtimeMessage = useCallback((message: BoardStateMessage) => {
  if (message.participantId === PLAYER_ID) return;
  setState(message.data);
}, []);

const updateState = useCallback((state: BoardState) => {
  setState(state);
  if (channel.current) {
    channel.current.publish('update-state', state);
  }
}, []);
```

**Explanation:**

- **handleRealtimeMessage:** Updates the board state when receiving real-time messages from other participants.
- **updateState:** Publishes updates to the board state to synchronize changes across all participants.

---

### Step 3: Render the Drawing Board

Finally, return the JSX structure for rendering the collaborative drawing board.

```tsx
return (
  <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
    <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
      <h1 className='text-white text-2xl font-bold'>SuperViz Drawing App</h1>
    </header>
    <main ref={contentRef} className='w-full h-full flex items-center justify-center' id='board-container'>
      {
        ready && (
          <Board
            state={state}
            setState={updateState}
            width={contentRef.current?.clientWidth || 0}
            height={contentRef.current?.clientHeight || 0}
            fillColor={fillColor}
          />
        )
      }
      {
        !ready && (
          <div className='w-full h-full flex items-center justify-center'>
            Loading...
          </div>
        )
      }
    </main>
  </div>
);
```

**Explanation:**

- **Drawing Board:** Renders the collaborative drawing board, where users can interact with shapes and scribbles in real-time. The board is only shown when the app is fully ready.

---

### Step 4: Understanding the Project Structure

Here's a quick overview of how the project structure supports a collaborative drawing application:

1. **`App.tsx`**
    - Initializes SuperViz and sets up real-time collaboration for the drawing board.
    - Manages the state and updates of the drawing board.
2. **`Board` Component**
    - Handles the rendering and interaction logic for the drawing board, including creating shapes, scribbles, and allowing users to manipulate them.
    - Updates the drawing state in real-time as participants interact with the board.
3. **Real-Time Communication**
    - Manages real-time communication between participants using SuperViz, ensuring that the drawing board is synchronized across all users.

---

### Step 5: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm start
```

This command will start the development server and open your application in the default web browser. You can interact with the drawing board and see updates in real-time as other participants join.

### 2. Test the Application

- **Collaborative Drawing:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that drawing actions are synchronized in real-time.
- **Collaborative Interaction:** Test the responsiveness of the application by drawing shapes, scribbles, and moving objects, and observing how the board updates for all participants.

### Summary

In this tutorial, we built a collaborative drawing application using SuperViz. We configured a React application to handle real-time updates of a drawing board, enabling multiple users to draw and interact seamlessly. This setup can be extended and customized to fit various scenarios where real-time collaboration is essential.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/drawing-app) for more details.

const realtime = new Realtime()