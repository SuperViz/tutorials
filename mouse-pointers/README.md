# Step-by-Step Tutorial: How to implement real-time mouse pointers and video huddles into a web application.

In this tutorial, we will guide you through adding real-time mouse pointers to a web application using SuperViz. Real-time mouse pointers are essential for collaborative applications, allowing users to see each other's cursor movements and interactions on a shared screen. We'll also add an optional video huddle feature for enhanced collaboration.

We'll demonstrate how to use SuperViz to implement real-time mouse pointers in a JavaScript application. Although we'll use a `<canvas>` element for rendering shared content, the real-time mouse pointers component is versatile and can be used with other HTML elements as well. This flexibility allows developers to integrate real-time pointers in a variety of web application contexts, providing a dynamic and interactive experience similar to collaborative platforms like Google Docs or Figma. Let's get started!

---

### Step 1: Set Up Your Application

To begin, you'll need to set up a new project where we will integrate the SuperViz packages for real-time mouse pointers and video collaboration.

### 1. Create a New Project

First, create a new application using Vite with TypeScript.

```bash
npm create vite@latest mouse-pointers-demo -- --template react-ts
cd mouse-pointers-demo
```

### 2. Install SuperViz Packages

Next, install the required SuperViz packages which will enable us to add real-time mouse pointer and video features to our application.

```bash
npm install @superviz/room @superviz/collaboration @superviz/video uuid
```

- **@superviz/room:** Core package for creating and managing SuperViz rooms.
- **@superviz/collaboration:** Contains components for collaboration features, including mouse pointers.
- **@superviz/video:** Provides video conferencing functionality.
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

Then we need to add the tailwind directives to the global CSS file the `src/index.css`.

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

### Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle real-time mouse pointers with an optional video huddle feature.

### 1. Import Required Packages

Open `src/App.tsx` and replace its contents with the following code. Let's start with importing all necessary components:

```typescript
import { createRoom, ParticipantEvent, Room } from "@superviz/room";
import { v4 as generateId } from "uuid";

import { useCallback, useEffect, useState, useRef } from "react";
import { MousePointers } from "@superviz/collaboration";
import { VideoEvent, VideoHuddle } from "@superviz/video";

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
```

**Explanation:**

- **createRoom, ParticipantEvent, Room:** From SuperViz room package for creating and managing rooms.
- **MousePointers:** Component from SuperViz collaboration package for showing mouse pointers.
- **VideoEvent, VideoHuddle:** From SuperViz video package for implementing video conferencing.
- **React hooks:** For managing state and component lifecycle.
- **DEVELOPER_TOKEN:** Environment variable for your SuperViz API key.

### 2. Create the App Component

Next, implement the main App component with state management:

```typescript
const App = () => {
  // States ::
  const [participantJoined, setParticipantJoined] = useState(false);
  const [huddleStarted, setHuddleStarted] = useState(false);

  const roomRef = useRef<Room | null>(null);
```

**Explanation:**

- **participantJoined:** State to track when the local participant has joined the room.
- **huddleStarted:** State to track when the video huddle has started.
- **roomRef:** Ref to store the room instance for later use.

### 3. Initialize SuperViz Room and Mouse Pointers

Add the initialization function that will create the room and add the mouse pointers component:

```typescript
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

      room.subscribe(ParticipantEvent.MY_PARTICIPANT_JOINED, () =>
        setParticipantJoined(true)
      );

      const mousePointers = new MousePointers("canvas");
      room.addComponent(mousePointers);
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);
```

**Explanation:**

- **initialize:** Async function that sets up the SuperViz room and mouse pointers.
- **createRoom:** Creates a room with the specified configuration.
- **room.subscribe:** Listens for when the local participant joins the room and updates state.
- **MousePointers:** Creates a new instance that will track mouse movements on the canvas element.
- **room.addComponent:** Adds the mouse pointers to the room for real-time collaboration.
- **useEffect:** Calls the initialize function when the component mounts.

### 4. Implement Video Huddle Functionality

Add the function to start a video huddle for enhanced collaboration:

```typescript
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
```

**Explanation:**

- **startHuddle:** Function to create and start a video huddle when called.
- **VideoHuddle:** Creates a new video component with the local user as the host.
- **video.subscribe:** Listens for when the local participant joins the video huddle and updates state.
- **roomRef.current.addComponent:** Adds the video component to the room for real-time video communication.

### 5. Render the User Interface

Finally, add the render function to display the canvas and video huddle button:

```typescript
return (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col relative">
      <canvas id="canvas" className="w-full h-full"></canvas>

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
```

**Explanation:**

- **Canvas Element:** A `<canvas>` element that serves as the shared space where mouse pointers will be tracked.
- **Conditional Button:** A button that appears only when the participant has joined but the video huddle hasn't started.
- **onClick Handler:** Calls the startHuddle function when the button is clicked.

---

### Step 3: Understanding the Application Structure

Here's a quick overview of how the application components work together:

1. **Room Creation and Management**
   - The application creates a SuperViz room when it loads.
   - It subscribes to events from the room to track when participants join.
2. **Mouse Pointers**
   - The MousePointers component tracks cursor movements on the canvas.
   - It renders other participants' cursors in real-time on the canvas element.
3. **Video Huddle**
   - Optionally, participants can start a video huddle for face-to-face communication.
   - The video huddle enhances collaboration alongside mouse pointer tracking.

---

### Step 4: Running the Application

### 1. Start the Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser.

### 2. Test the Application

- **Real-Time Mouse Pointers:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that mouse movements are displayed in real-time for all users.
- **Video Huddle Feature:** Click the "START VIDEO HUDDLE" button in one window to start a video conference and verify that other participants can join the conference.
- **Collaborative Interaction:** Test how mouse pointers and video conferencing work together to create a complete collaborative environment.

### Summary

In this tutorial, we implemented real-time mouse pointers and an optional video huddle feature in a web application using SuperViz. We used the @superviz/room package to create and manage the room, the @superviz/collaboration package for mouse pointers, and the @superviz/video package for video conferencing. This setup provides a powerful foundation for collaborative applications where users need to see each other's interactions and communicate in real-time.
