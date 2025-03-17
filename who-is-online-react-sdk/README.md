# Step-by-Step Tutorial: How to Add a Who-Is-Online Feature to a React Application

In this tutorial, we will guide you through integrating a "Who-Is-Online" feature into your React application using SuperViz. This feature allows users to see who else is currently online in a shared session, which is especially useful for collaborative tools, virtual events, and social platforms. We'll also add an optional video huddle that users can start.

We'll demonstrate how to set up a simple React application that uses SuperViz to display the list of online participants and enable video conferencing. By the end of this tutorial, you'll have a fully functional "Who-Is-Online" feature with video capabilities that you can extend and customize to meet your specific needs.
Let's get started!

---

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate SuperViz for the "Who-Is-Online" feature.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest who-is-online -- --template react-ts
cd who-is-online
```

Vite is a modern build tool that provides a faster and more efficient development experience compared to Create React App. It also supports TypeScript out of the box.

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/react @superviz/collaboration @superviz/video uuid
```

- **@superviz/react:** React-specific package for SuperViz with hooks and providers.
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

In this step, we'll implement the main application logic using React components and SuperViz hooks to display the "Who-Is-Online" feature.

### 1. Set Up Required Imports

Open `src/App.tsx` and add the following imports:

```tsx
import { WhoIsOnline } from '@superviz/collaboration';
import { RoomProvider, useRoom } from '@superviz/react';
import { VideoHuddle } from "@superviz/video";
import { useCallback, useEffect, useState } from "react";
import { v4 as generateId } from 'uuid';

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
```

**Explanation:**

- **WhoIsOnline:** Component from SuperViz collaboration package for showing who is online.
- **RoomProvider, useRoom:** React-specific components from SuperViz for providing and accessing room functionality.
- **VideoHuddle:** Component from SuperViz video package for implementing video conferencing.
- **React hooks:** For managing state and component lifecycle.
- **generateId:** Function from uuid to generate unique participant IDs.
- **DEVELOPER_TOKEN:** Environment variable for your SuperViz API key.

### 2. Create the Children Component

Next, create a Children component that will use the SuperViz room hooks to manage the application:

```tsx
export const Children = () => {
  const [participantJoined, setParticipantJoined] = useState(false);

  const { joinRoom, addComponent } = useRoom({
    onMyParticipantJoined: () => {
      setParticipantJoined(true);
    },
  });

  // Use the joinRoom function from the hook in the callback
  const initializeSuperViz = useCallback(async () => {
    try {
      await joinRoom({
        participant: {
          id: generateId(),
          name: "Name " + Math.floor(Math.random() * 10),
        },
        group: {
          name: "GROUP_NAME",
          id: "GROUP_ID",
        },
        roomId: `ROOM_ID`,
      });

      const whoIsOnline = new WhoIsOnline();
      addComponent(whoIsOnline);
    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, [joinRoom, addComponent]);

  useEffect(() => {
    initializeSuperViz();
  }, [initializeSuperViz]);

  useEffect(() => {
  }, [participantJoined]);
```

**Explanation:**

- **participantJoined:** State to track when the local participant has joined the room.
- **useRoom:** React hook that provides access to SuperViz room functionality with a callback for when participant joins.
- **joinRoom, addComponent:** Functions extracted from the useRoom hook for joining a room and adding components.
- **initializeSuperViz:** Callback that joins the room and adds the "Who-Is-Online" component.
- **useEffect:** Calls the initialization function when the component mounts.

### 3. Implement Video Huddle Functionality

Add a function to start the video huddle:

```tsx
  const initialize = async () => {
    const video = new VideoHuddle({
      participantType: 'host',
    });
    addComponent(video);
  };
```

**Explanation:**

- **initialize:** Function to create and start a video huddle when called.
- **VideoHuddle:** Creates a new video huddle component with the current user as the host.
- **addComponent:** Adds the video huddle component to the room using the function from useRoom.

### 4. Add the Render Function for Children

Complete the Children component with the render function:

```tsx
  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col relative'>
      <canvas id="canvas" className='w-full h-full'></canvas>

      {participantJoined && (
        <button
          className="bg-[#6210cc] text-white px-5 py-3 text-xs rounded-lg absolute top-5 left-5 z-10"
          onClick={initialize}
        >
          START VIDEO HUDDLE
        </button>
      )}
    </div>
  );
};
```

**Explanation:**

- **Canvas:** A full-width/height canvas element for the application background.
- **Conditional Button:** A button that appears only when the participant has joined.
- **onClick:** The button's click handler that starts the video huddle when clicked.
- **Note:** The "Who-Is-Online" component will be rendered automatically by SuperViz.

### 5. Create the Main App Component

Finally, create the App component that wraps everything with the RoomProvider:

```tsx
export function App() {
  return (
    <RoomProvider developerToken={DEVELOPER_TOKEN}>
      <Children />
    </RoomProvider>
  );
}

export default App;
```

**Explanation:**

- **RoomProvider:** Provides the SuperViz room context to all child components.
- **developerToken:** Passes your SuperViz API key to authenticate with the service.
- **Children:** The component that contains all the room functionality and UI.

---

## Step 3: Understanding How the Components Work Together

Here's a quick overview of how the React components work together in this application:

1. **Component Structure**
   - The App component provides the RoomProvider context.
   - The Children component uses the useRoom hook to access room functionality.
2. **Room Initialization**
   - When the Children component mounts, it joins a SuperViz room.
   - It adds the "Who-Is-Online" component to show current participants.
3. **Who-Is-Online Component**
   - Displays a list of participants currently in the room.
   - Updates automatically as participants join or leave.
4. **Video Huddle**
   - Can be started by clicking the "START VIDEO HUDDLE" button.
   - Once started, participants can communicate via video and audio.

---

## Step 4: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can see who else is online in real-time as other participants join.

### 2. Test the Application

- **Who-Is-Online Feature:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that the list of online users updates in real-time.
- **Video Huddle:** Test the video huddle by clicking the "START VIDEO HUDDLE" button and verifying that users can see and hear each other.
- **React Integration:** Observe how the React components and hooks integrate with SuperViz to provide real-time collaboration features.

---

## Summary

In this tutorial, we built a "Who-Is-Online" feature with optional video conferencing using SuperViz in a React application. We used the SuperViz React hooks and providers to create a well-structured component hierarchy that handles real-time updates of online participants and enables video communication. This React-specific approach leverages React's component model to create a maintainable and scalable application.
