# Step-by-Step Tutorial: How to see Who-Is-Online on your page with JavaScript

In this tutorial, we will guide you through integrating a "Who-Is-Online" feature into your JavaScript application using SuperViz. This feature allows users to see who else is currently online in a shared session, which is especially useful for collaborative tools, virtual events, and social platforms. We'll also add an optional video huddle that users can start.

We'll demonstrate how to set up a simple application that uses SuperViz to display the list of online participants and enable video conferencing. By the end of this tutorial, you'll have a fully functional "Who-Is-Online" feature with video capabilities that you can extend and customize to meet your specific needs.
Let's get started!

---

## Step 1: Set Up Your Application

To begin, you'll need to set up a new project where we will integrate SuperViz for the "Who-Is-Online" feature.

### 1. Create a New Project

First, create a new application using Vite with TypeScript.

```bash
npm create vite@latest who-is-online -- --template react-ts
cd who-is-online
```

Vite is a modern build tool that provides a faster and more efficient development experience compared to Create React App. It also supports TypeScript out of the box.

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/room @superviz/collaboration @superviz/video uuid
```

- **@superviz/room:** Core package for creating and managing SuperViz rooms.
- **@superviz/collaboration:** Contains components for collaboration features like the "Who-Is-Online" feature.
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

In this step, we'll implement the main application logic to initialize SuperViz and display the "Who-Is-Online" feature.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the online participants list.

```tsx
import { createRoom, ParticipantEvent, Room } from "@superviz/room";
import { v4 as generateId } from "uuid";

import { useCallback, useEffect, useState, useRef } from "react";
import { WhoIsOnline } from "@superviz/collaboration";
import { VideoEvent, VideoHuddle } from "@superviz/video";

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
```

**Explanation:**

- **createRoom, ParticipantEvent, Room:** From SuperViz room package for creating and managing rooms.
- **WhoIsOnline:** Component from SuperViz collaboration package for showing who is online.
- **VideoEvent, VideoHuddle:** From SuperViz video package for implementing video conferencing.
- **React hooks:** For managing state and component lifecycle.
- **DEVELOPER_TOKEN:** Environment variable for your SuperViz API key.

### 2. Create the App Component

Set up the main `App` component with state management.

```tsx
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

### 3. Initialize SuperViz Room

Create a function to initialize the SuperViz room and add the "Who-Is-Online" component.

```tsx
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

      const whoIsOnline = new WhoIsOnline();
      room.addComponent(whoIsOnline);
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);
```

**Explanation:**

- **initialize:** Async function that creates a new SuperViz room and adds the "Who-Is-Online" component.
- **createRoom:** Creates a room with the specified configuration.
- **roomRef.current:** Stores the room instance for later use.
- **room.subscribe:** Listens for the event when the local participant joins and updates state.
- **WhoIsOnline:** Creates the component that shows the list of online participants.
- **useEffect:** Calls the initialize function when the component mounts.

### 4. Implement Video Huddle Functionality

Create a function to start the video huddle.

```tsx
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
- **VideoHuddle:** Creates a new video huddle component with the current user as the host.
- **video.subscribe:** Listens for when the local participant joins the video huddle and updates state.
- **roomRef.current.addComponent:** Adds the video huddle component to the room.

## Step 3: Render the Interface

Finally, return the JSX structure for rendering the application interface.

```tsx
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

- **Canvas:** A full-width/height canvas element for the application background.
- **Conditional Button:** A button that appears only when the participant has joined but the huddle hasn't started yet.
- **startHuddle:** The button's click handler that starts the video huddle.
- **Note:** The "Who-Is-Online" component will be rendered automatically by SuperViz.

---

## Step 4: Understanding How the Components Work Together

Here's a quick overview of how the components work together in this application:

1. **Room Initialization**
   - When the application loads, it creates a SuperViz room and joins it.
   - Once joined, it adds the "Who-Is-Online" component to show current participants.
2. **Who-Is-Online Component**
   - Displays a list of participants currently in the room.
   - Updates automatically as participants join or leave.
3. **Video Huddle**
   - Can be started by clicking the "START VIDEO HUDDLE" button.
   - Once started, participants can communicate via video and audio.

---

## Step 5: Running the Application

### 1. Start the Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can see who else is online in real-time as other participants join.

### 2. Test the Application

- **Who-Is-Online Feature:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that the list of online users updates in real-time.
- **Video Huddle:** Test the video huddle by clicking the "START VIDEO HUDDLE" button and verifying that users can see and hear each other.
- **Collaborative Interaction:** Test how participants appear in the "Who-Is-Online" list and how video works across multiple simulated users.

---

## Summary

In this tutorial, we built a "Who-Is-Online" feature with optional video conferencing using SuperViz. We configured an application to handle real-time updates of online participants and enable video communication, allowing multiple users to see who else is in the session and communicate via video. This setup can be extended and customized to fit various scenarios where real-time presence information and communication are essential.
