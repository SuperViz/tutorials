# Step-by-Step Tutorial: How to add real-time synchronization to your web-application

In this tutorial, we will guide you through adding real-time synchronization to a productivity tool using the SuperViz SDK. Real-time synchronization is a crucial feature for collaborative applications, allowing multiple users to interact with shared content simultaneously and see each other's changes as they happen. With SuperViz, you can build interactive tools that update live, providing a seamless collaborative experience for users.

We'll demonstrate how to integrate real-time synchronization into a notes application, enabling users to collaborate on notes with real-time updates. This setup allows multiple participants to edit notes, move elements, and see changes instantly as they happen. Let's get started!

---

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the SuperViz SDK for real-time synchronization.

### 1. Create a New React Project

First, create a new React application using Create React App with TypeScript.

```bash
npm create vite@latest realtime-notes-app -- --template react-ts
cd realtime-notes-app
```

### 2. Install SuperViz SDK

Next, install the SuperViz SDK, which will enable us to add real-time synchronization features to our application.

```bash
npm install @superviz/sdk uuid
```

- **@superviz/sdk:** SDK for integrating real-time collaboration features, including synchronization.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

## Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle real-time synchronization in a notes application.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the collaborative environment.

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import SuperVizRoom, { LauncherFacade, MousePointers, Realtime, RealtimeComponentEvent, RealtimeComponentState, RealtimeMessage, WhoIsOnline } from '@superviz/sdk';
import { v4 as generateId } from 'uuid';
import { NoteNode } from "./components/note-node";
import { Note } from "./common/types";
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz SDK, and UUID for managing state, initializing SuperViz, and generating unique identifiers.

### 2. Define Constants

Define constants for the API key, room ID, and participant ID.

```tsx
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = 'video-huddle-application';
const PARTICIPANT_ID = generateId();
```

**Explanation:**

- **apiKey:** Retrieves the SuperViz API key from environment variables.
- **ROOM_ID:** Defines the room ID for the SuperViz session.
- **PARTICIPANT_ID:** Generates a unique participant ID using the `uuid` library.

### 3. Create the App Component

Set up the main `App` component and initialize state variables.

```tsx
export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const superviz = useRef<LauncherFacade | null>(null);
  const channel = useRef<any | null>(null);
```

**Explanation:**

- **initialized:** A state variable to track whether the SuperViz environment has been set up.
- **notes:** A state variable to manage the list of notes in the application.
- **superviz:** A ref to store the SuperViz room instance.
- **channel:** A ref to store the real-time communication channel.

### 4. Initialize SuperViz and Real-Time Components

Create an `initialize` function to set up the SuperViz environment and configure real-time synchronization.

```tsx
const initialize = useCallback(async () => {
  if (initialized) return;

  superviz.current = await SuperVizRoom(apiKey, {
    roomId: ROOM_ID,
    participant: {
      id: PARTICIPANT_ID,
      name: 'my participant',
    },
    group: {
      id: 'video-huddle-application',
      name: 'video-huddle-application',
    },
    environment: 'dev',
    debug: true,
  })
```

**Explanation:**

- **initialize:** An asynchronous function that initializes the SuperViz room and checks if it's already initialized to prevent duplicate setups.
- **SuperVizRoom:** Configures the room, participant, and group details for the session.

### 5. Set Up Real-Time Synchronization

Within the `initialize` function, set up real-time synchronization for notes.

```tsx
const realtime = new Realtime();
  realtime.subscribe(RealtimeComponentEvent.REALTIME_STATE_CHANGED, (state) => {
    if (state !== RealtimeComponentState.STARTED) return;

    channel.current = realtime.connect('video-huddle-application');
    channel.current.subscribe('note-change', (event: RealtimeMessage) => {
      const note = event.data as Note;

      if (event.participantId === PARTICIPANT_ID || !note) return;

      setNotes(previous => {
        return previous.map(n => {
          if (n.id === note.id) {
            return note;
          }

          return n;
        });
      });
    });
  });
```

**Explanation:**

- **Realtime:** Initializes the real-time component for synchronization.
- **RealtimeComponentEvent.REALTIME_STATE_CHANGED:** Subscribes to changes in the real-time component state.
- **note-change Subscription:** Listens for note changes and updates the local state accordingly, ignoring changes from the current participant to avoid redundancy.

### 6. Add Mouse Pointers and Online Status

Enhance the application with mouse pointers and online status indicators.

```tsx
const mousePointers = new MousePointers('mouse-container');
const whoIsOnline = new WhoIsOnline();
superviz.current.addComponent(mousePointers);
superviz.current.addComponent(realtime);
superviz.current.addComponent(whoIsOnline)
```

**Explanation:**

- **MousePointers:** Displays real-time mouse pointers to show where other participants are interacting.
- **WhoIsOnline:** Shows a list of currently online participants in the session.

### 7. Initialize Notes

Set the initial state of notes with example content.

```tsx
setInitialized(true);
setNotes([
    { id: 'note-1', title: `Unicorn's Shopping List`, content: 'Rainbow sprinkles, cloud fluff, and pixie dust', x: 20, y: 50 },
    { id: 'note-2', title: `Zombie's To-Do List`, content: 'Find brains, practice groaning, shuffle aimlessly', x: 20, y: 50 },
    { id: 'note-3', title: `Alien's Earth Observations`, content: 'Humans obsessed with cat videos and avocado toast. Fascinating!', x: 20, y: 50 },
  ]);
}, [initialized, setNotes]);
```

**Explanation:**

- **setInitialized:** Marks the application as initialized to prevent reinitialization.
- **setNotes:** Sets the initial notes with predefined content, positioning them on the screen.

### 8. Handle Note Changes

Implement the `handleNoteChange` function to manage updates to notes.

```tsx
const handleNoteChange = useCallback((note: Note) => {
  setNotes((prevNotes) => {
    return prevNotes.map(n => {
      if (n.id === note.id) {
        return note;
      }

      return n;
    });
  });

  if (channel.current) {
    channel.current.publish('note-change', note);
  }
}, []);
```

**Explanation:**

- **handleNoteChange:** Updates the local state of notes when a note is edited and publishes the change to other participants.
- **channel.current.publish:** Sends the updated note to all participants through the real-time channel.

### 9. Use Effect Hook for Initialization

Use the `useEffect` hook to trigger the `initialize` function on component mount.

```tsx
useEffect(() => {
  initialize();
}, [initialize]);
```

**Explanation:**

- **useEffect:** Calls the `initialize` function once when the component mounts, setting up the SuperViz environment and real-time synchronization.

### 10. Render the Application

Return the JSX structure for rendering the application, including notes and collaboration features.

```tsx
return (
  <>
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>Real-Time Sync</h1>
      </header>
      <main id="mouse-container" className='flex-1 p-20 flex w-full gap-2 items-center justify-center overflow-hidden'>
        {
          notes.map((note, index) => (
            <NoteNode key={index} note={note} onChange={handleNoteChange} />
          ))
        }
      </main>
    </div>
  </>
)
```

**Explanation:**

- **Header:** Displays the title of the application.
- **Main Container:** Wraps the notes and collaboration elements, providing a space for interaction.
- **NoteNode Component:** Renders each note, allowing for real-time updates and changes.

---

## Step 3: Create the NoteNode Component

The `NoteNode` component is responsible for displaying individual notes and handling edits.

### 1. Create the NoteNode Component

Create a new file named `src/components/note-node.tsx` and add the following implementation:

```tsx
import React, { useState } from "react";
import { Note } from "../common/types";

interface NoteNodeProps {
  note: Note;
  onChange: (note: Note) => void;
}

export const NoteNode: React.FC<NoteNodeProps> = ({ note, onChange }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    onChange({ ...note, title: newTitle });
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    onChange({ ...note, content: newContent });
  };

  return (
    <div className="note-node p-4 bg-white rounded shadow-lg" style={{ position: "absolute", left: note.x, top: note.y }}>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="font-bold mb-2 w-full border-none focus:outline-none"
      />
      <textarea
        value={content}
        onChange={handleContentChange}
        className="w-full border-none focus:outline-none"
        rows={5}
      />
    </div>
  );
}
```

**Explanation:**

- **NoteNode Component:** Displays each note with editable fields for title and content.
- **handleTitleChange & handleContentChange:** Updates the state and calls the `onChange` callback to propagate changes.

### 2. Define the Note Type

Create a new file named `src/common/types.ts` and define the `Note` type.

```tsx
export interface Note {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
}
```

**Explanation:**

- **Note Type:** Defines the structure of a note, including ID, title, content, and position.

---

## Step 4: Understanding the Project Structure

Here's a quick overview of how the project structure supports real-time synchronization:

1. **`App.tsx`**
    - Initializes the SuperViz environment.
    - Sets up participant information and room details.
    - Handles real-time synchronization and mouse pointers.
2. **`NoteNode.tsx`**
    - Displays individual notes with editable fields.
    - Handles local state updates and propagates changes to the parent component.
3. **`types.ts`**
    - Defines the data structure for notes used throughout the application.

---

### Step 5: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm start
```

This command will start the development server and open your application in the default web browser. You can interact with the notes and see updates in real-time as other participants join the session.

### 2. Test the Application

- **Real-Time Notes:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that changes made to notes are reflected in real-time for all users.
- **Collaborative Interaction:** Test the responsiveness of the application by editing notes and observing how changes appear for other participants.

### Summary

In this tutorial, we built a collaborative notes application using SuperViz for real-time synchronization. We configured a React application to handle note editing, enabling multiple users to collaborate seamlessly on shared notes. This setup can be extended and customized to fit various scenarios where real-time collaboration and document editing are required.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/realtime-notes-application) for more details.