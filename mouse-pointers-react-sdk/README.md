# Step-by-Step Tutorial: How to Add Real-Time Mouse Pointers to a React Application

In this tutorial, we will guide you through adding real-time mouse pointers to a React application using SuperViz dedicated React SDK. Real-time mouse pointers are essential for collaborative applications, allowing users to see each other's cursor movements and interactions on a shared screen. We'll also add an optional video huddle feature for enhanced collaboration.

We'll demonstrate how to use SuperViz to implement real-time mouse pointers in a React application. Although we'll use a `<canvas>` element for rendering shared content, the real-time mouse pointers component is versatile and can be used with other HTML elements as well. This flexibility allows developers to integrate real-time pointers in a variety of web application contexts, providing a dynamic and interactive experience similar to collaborative platforms like Google Docs or Figma. Let's get started!

---

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the SuperViz packages for real-time mouse pointers and video collaboration.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest mouse-pointers-demo -- --template react-ts
cd mouse-pointers-demo
```

### 2. Install SuperViz Packages

Next, install the required SuperViz packages which will enable us to add real-time mouse pointer and video features to our application.

```bash
npm install @superviz/react @superviz/collaboration @superviz/video uuid
```

- **@superviz/react:** React-specific package for SuperViz with hooks and providers.
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

## Step 2: Implement the Main Application

In this step, we'll implement the main application logic using React components and hooks to handle real-time mouse pointers with an optional video huddle feature.

### 1. Set Up Required Imports

Open `src/App.tsx` and add the following imports:

```typescript
import { MousePointers } from '@superviz/collaboration';
import { RoomProvider, useRoom } from '@superviz/react';
import { VideoHuddle } from "@superviz/video";
import { useCallback, useEffect, useState } from "react";
import { v4 as generateId } from 'uuid';

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
```

**Explanation:**

- **MousePointers:** Component from SuperViz collaboration package for showing mouse pointers.
- **RoomProvider, useRoom:** React-specific components from SuperViz for providing and accessing room functionality.
- **VideoHuddle:** Component from SuperViz video package for implementing video conferencing.
- **React hooks:** For managing state and component lifecycle.
- **generateId:** Function from uuid to generate unique participant IDs.
- **DEVELOPER_TOKEN:** Environment variable for your SuperViz API key.

### 2. Create the Children Component

Next, create a Children component that will use the SuperViz room hooks to manage the application:

```typescript
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

      const mousePointers = new MousePointers("canvas");
      addComponent(mousePointers);
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
- **initializeSuperViz:** Callback that joins the room and adds the MousePointers component.
- **MousePointers:** Creates a new instance that will track mouse movements on the canvas element.
- **useEffect:** Calls the initialization function when the component mounts.

### 3. Implement Video Huddle Functionality

Add a function to start the video huddle:

```typescript
  const initialize = async () => {
    const video = new VideoHuddle({
      participantType: 'host',
    });
    addComponent(video);
  };
```

**Explanation:**

- **initialize:** Function to create and start a video huddle when called.
- **VideoHuddle:** Creates a new video component with the local user as the host.
- **addComponent:** Adds the video component to the room using the function from useRoom.

### 4. Add the Render Function for Children

Complete the Children component with the render function:

```typescript
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

- **Canvas Element:** A `<canvas>` element that serves as the shared space where mouse pointers will be tracked.
- **Conditional Button:** A button that appears only when the participant has joined.
- **onClick Handler:** Calls the initialize function when the button is clicked to start the video huddle.

### 5. Create the Main App Component

Finally, create the App component that wraps everything with the RoomProvider:

```typescript
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

## Step 3: Understanding How the React Components Work Together

Here's a quick overview of how the React components work together in this application:

1. **Component Structure**
   - The App component provides the RoomProvider context.
   - The Children component uses the useRoom hook to access room functionality.

2. **Room Initialization**
   - When the Children component mounts, it joins a SuperViz room.
   - It adds the MousePointers component to track cursor movements.

3. **Mouse Pointers**
   - The MousePointers component tracks cursor movements on the canvas.
   - It renders other participants' cursors in real-time on the canvas element.

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

This command will start the development server and open your application in the default web browser.

### 2. Test the Application

- **Real-Time Mouse Pointers:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that mouse movements are displayed in real-time for all users.
- **Video Huddle Feature:** Click the "START VIDEO HUDDLE" button in one window to start a video conference and verify that other participants can join the conference.
- **React Integration:** Observe how the React components and hooks integrate with SuperViz to provide real-time collaboration features.

## Summary

In this tutorial, we implemented real-time mouse pointers and an optional video huddle feature in a React application using SuperViz. We used the @superviz/react package with its hooks and providers to create a well-structured component hierarchy that handles real-time tracking of mouse pointers and enables video communication. This React-specific approach leverages React's component model to create a maintainable and scalable collaborative application.
