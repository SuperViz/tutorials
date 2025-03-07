# Step-by-Step Tutorial: How to add real-time synchronization to your web-application

In this tutorial, we will guide you through adding real-time synchronization to a productivity tool using SuperViz Collaboration and SuperViz Real-time. Real-time synchronization is a crucial feature for collaborative applications, allowing multiple users to interact with shared content simultaneously and see each other's changes as they happen. With SuperViz, you can build interactive tools that update live, providing a seamless collaborative experience for users.

We'll demonstrate how to integrate real-time synchronization into a notes application, enabling users to collaborate on notes with real-time updates. This setup allows multiple participants to edit notes, move elements, and see changes instantly as they happen. Let's get started!

---

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate SuperViz for real-time synchronization.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest realtime-notes-app -- --template react-ts
cd realtime-notes-app
```

### 2. Install SuperViz Packages

Next, install the necessary SuperViz packages, which will enable us to add real-time synchronization features to our application.

```bash
npm install @superviz/room @superviz/collaboration @superviz/realtime uuid
```

- **@superviz/room:** Core package for creating and managing SuperViz rooms.
- **@superviz/collaboration:** Package containing components for collaboration features like mouse pointers and who-is-online.
- **@superviz/realtime:** SuperViz Real-Time library for integrating real-time synchronization into your application.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

### 3. Configure tailwind

In this tutorial, we'll use the [Tailwind css](tailwindcss.com) framework. First, install the tailwind package.

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

We then need to configure the template path. Open `tailwind.config.js` in the root of the project and insert the following code.

```javascript
/** @type {import('tailwindcss').Config} */
export default {
content: [
"./index.html",
"./src/**/*.{js,ts,jsx,tsx}",
],
theme: {
extend: {},
},
plugins: [],
}
```

Then we need to add the tailwind directives to the global CSS file. (src/index.css)

```javascript
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

## Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle real-time synchronization in a notes application.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component with necessary imports:

```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoom } from "@superviz/room";
import {
  MousePointers,
  WhoIsOnline,
} from "@superviz/collaboration";
import { Realtime, type Channel } from "@superviz/realtime/client";
import { v4 as generateId } from "uuid";
import { NoteNode } from "./components/note-node";
import { Note } from "./common/types";

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;

const ROOM_ID = "video-huddle-application";
const PARTICIPANT_ID = generateId();
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz packages, and UUID for managing state, initializing SuperViz, and generating unique identifiers.
- **Constants:** Define the developer token, room ID, and a unique participant ID.

### 2. Create the App Component

Set up the main `App` component and initialize state variables.

```typescript
export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const channel = useRef<Channel | null>(null);
}
```

**Explanation:**

- **initialized:** A state variable to track whether the SuperViz environment has been set up.
- **notes:** A state variable to manage the list of notes in the application.
- **channel:** A ref to store the real-time communication channel.

### 3. Initialize SuperViz and Real-Time Components

Create an `initialize` function to set up the SuperViz environment and configure real-time synchronization.

```typescript
const initialize = useCallback(async () => {
    if (initialized) return;

    try {
      const room = await createRoom({
        developerToken: DEVELOPER_TOKEN,
        roomId: ROOM_ID,
        participant: {
          id: PARTICIPANT_ID,
          name: "Participant",
        },
        group: {
          id: "GROUP_ID",
          name: "GROUP_NAME",
        },
      });


      const mousePointers = new MousePointers("mouse-container");
      const whoIsOnline = new WhoIsOnline();
      room.addComponent(mousePointers);
      room.addComponent(whoIsOnline);
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, [initialized]);
```

**Explanation:**

- **initialize:** An asynchronous function that checks if already initialized to prevent duplicate setups.
- **createRoom:** Creates a SuperViz room with participant and group details.
- **Components:** Creates and adds mouse pointers and who-is-online components to the room.

### 4. Set Up Real-Time Synchronization

Within the `initialize` function, set up real-time synchronization for notes.

```typescript
      const realtime = new Realtime(DEVELOPER_TOKEN, {
        participant: {
          id: PARTICIPANT_ID,
        },
      });

      channel.current = await realtime.connect("realtime-sync");
      channel.current.subscribe<Note>("note-change", (event) => {
        const note = event.data;

        if (event.participantId === PARTICIPANT_ID || !note) return;

        setNotes((previous) => {
          return previous.map((n) => {
            if (n.id === note.id) {
              return note;
            }

            return n;
          });
        });
      });
```

**Explanation:**

- **Realtime:** Initializes the real-time component for synchronization with participant information.
- **connect:** Connects to a specific channel named "realtime-sync".
- **subscribe:** Listens for "note-change" events and updates the local state accordingly, ignoring changes from the current participant to avoid redundancy.

### 5. Initialize Notes

Set the initial state of notes with example content and handle errors.

```typescript
      setInitialized(true);
      setNotes([
        {
          id: "note-1",
          title: `Unicorn's Shopping List`,
          content: "Rainbow sprinkles, cloud fluff, and pixie dust",
          x: 20,
          y: 50,
        },
        {
          id: "note-2",
          title: `Zombie's To-Do List`,
          content: "Find brains, practice groaning, shuffle aimlessly",
          x: 20,
          y: 50,
        },
        {
          id: "note-3",
          title: `Alien's Earth Observations`,
          content:
            "Humans obsessed with cat videos and avocado toast. Fascinating!",
          x: 20,
          y: 50,
        },
      ]);
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, [initialized, setNotes]);
```

**Explanation:**

- **setInitialized:** Marks the application as initialized to prevent reinitialization.
- **setNotes:** Sets the initial notes with predefined content and positioning.
- **Error Handling:** Catches and logs any errors that occur during initialization.

### 6. Handle Note Changes

Implement the `handleNoteChange` function to manage updates to notes.

```typescript
const handleNoteChange = useCallback((note: Note) => {
    setNotes((prevNotes) => {
      return prevNotes.map((n) => {
        if (n.id === note.id) {
          return note;
        }

        return n;
      });
    });

    if (channel.current) {
      channel.current.publish("note-change", note);
    }
  }, []);
```

**Explanation:**

- **handleNoteChange:** Updates the local state of notes when a note is edited and publishes the change to other participants.
- **channel.current.publish:** Sends the updated note to all participants through the real-time channel.

### 7. Use Effect Hook for Initialization

Use the `useEffect` hook to trigger the `initialize` function on component mount.

```typescript
useEffect(() => {
    initialize();
  });
```

**Explanation:**

- **useEffect:** Calls the `initialize` function when the component mounts, setting up the SuperViz environment and real-time synchronization.

### 8. Render the Application

Return the JSX structure for rendering the application, including notes and collaboration features.

```typescript
return (
    <>
      <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col">
        <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold">Real-Time Sync</h1>
        </header>
        <main
          id="mouse-container"
          className="flex-1 p-20 flex w-full gap-2 items-center justify-center overflow-hidden bg-canvas-background"
        >
          {notes.map((note, index) => (
            <NoteNode key={index} note={note} onChange={handleNoteChange} />
          ))}
        </main>
      </div>
    </>
  );
```

**Explanation:**

- **Header:** Displays the title of the application.
- **Main Container:** Has the ID "mouse-container" which matches the element ID used for mouse pointers.
- **Notes Rendering:** Maps through the notes array to render each note using the NoteNode component.

---

## Step 3: Create the NoteNode Component

The `NoteNode` component is responsible for displaying individual notes and handling edits.

### 1. Create the NoteNode Component

Create a new file named `src/components/note-node.tsx` and add the following implementation:

```typescript
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

```typescript
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
   - Creates a SuperViz room using the createRoom function.
   - Sets up collaboration components like mouse pointers and who-is-online.
   - Handles real-time synchronization using the Realtime client.
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
npm run dev
```

This command will start the development server and open your application in the default web browser. You can interact with the notes and see updates in real-time as other participants join the session.

### 2. Test the Application

- **Real-Time Notes:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that changes made to notes are reflected in real-time for all users.
- **Collaborative Interaction:** Test the responsiveness of the application by editing notes and observing how changes appear for other participants.

### Summary

In this tutorial, we built a collaborative notes application using SuperViz for real-time synchronization. We used the @superviz/room package to create a room, the @superviz/collaboration package for mouse pointers and who-is-online features, and the @superviz/realtime package for synchronizing note changes between participants. This setup enables multiple users to collaborate seamlessly on shared notes, seeing each other's edits in real-time.

