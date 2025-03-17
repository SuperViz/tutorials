# Step-by-Step Tutorial: How to Add a Contextual Comments Feature into a Canvas-Based React Application

In this tutorial, we will guide you through integrating a [contextual comments](https://docs.superviz.com/collaboration/components/contextual-comments/overview) feature into a canvas-based React application using SuperViz. Contextual comments are a powerful tool for collaborative applications, allowing users to annotate specific areas of a canvas. This feature is especially useful for design, brainstorming, and feedback applications where users need to discuss particular elements of a shared visual space.

We'll demonstrate how to use SuperViz to implement a contextual comments system in a React application with a canvas element. This setup will enable multiple users to add comments to different areas of the canvas, facilitating real-time collaboration and feedback. Let's get started!

---

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the SuperViz SDK for contextual comments.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest contextual-comments-canvas -- --template react-ts
cd contextual-comments-canvas
```

### 2. Install SuperViz SDK

Next, install SuperViz, which will enable us to add real-time contextual comments to our application.

```bash
npm install @superviz/react @superviz/collaboration uuid
```

- **@superviz/react:** React-specific package for SuperViz with hooks and providers.
- **@superviz/collaboration:** Package containing components for collaboration features like comments and canvas pinning.
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

## Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle contextual comments on a canvas.

### 1. Set Up the Required Imports

Open `src/App.tsx` and add the following imports:

```tsx
import { Comments, CanvasPin } from '@superviz/collaboration';
import { RoomProvider, useRoom } from '@superviz/react';
import { useCallback, useEffect } from "react";
import { v4 as generateId } from 'uuid';

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
```

**Explanation:**

- **Comments, CanvasPin:** Components from SuperViz collaboration package for adding comments and pin functionality.
- **RoomProvider, useRoom:** React provider and hook from SuperViz for room management.
- **useCallback, useEffect:** React hooks for optimizing performance and handling side effects.
- **generateId:** Function from uuid to generate unique IDs for participants.
- **DEVELOPER_TOKEN:** Retrieves the SuperViz API key from environment variables.

### 2. Create the Child Component

Next, create a child component that will use the SuperViz room context to join the room and initialize components:

```tsx
export const Children = () => {

  const { joinRoom, addComponent } = useRoom();

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

      const pinAdapter = new CanvasPin("canvas");
      const comments = new Comments(pinAdapter);
      addComponent(comments);

    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, [joinRoom, addComponent]);

  useEffect(() => {
    initializeSuperViz();
  }, [initializeSuperViz]);
```

**Explanation:**

- **useRoom:** React hook that provides access to the SuperViz room context.
- **joinRoom, addComponent:** Functions extracted from the useRoom hook.
- **initializeSuperViz:** Async callback function that handles joining the room and setting up components.
- **joinRoom:** Function to join a SuperViz room with participant, group, and room details.
- **CanvasPin:** Creates a pin adapter for the canvas element, enabling users to place pins.
- **Comments:** Creates a comments component that works with the canvas pin adapter.
- **addComponent:** Adds the comments component to the SuperViz room.
- **useEffect:** Calls the initialization function when the component mounts.

### 3. Render the Canvas

Add the JSX structure for the Children component to render the canvas element:

```tsx
  return (
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col relative'>
      <canvas id="canvas" className='w-full h-full bg-red-500'></canvas>
    </div>
  );
};
```

**Explanation:**

- **div:** A container for the application with full width and height.
- **canvas:** The HTML canvas element where users can add contextual comments. The ID 'canvas' matches the ID used in the CanvasPin initialization.

### 4. Create the Main App Component

Finally, create the main App component that provides the SuperViz room context:

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

- **RoomProvider:** Provides the SuperViz room context to child components.
- **developerToken:** Passes the developer token to authenticate with SuperViz.
- **Children:** The component that uses the room context to join a room and initialize components.

## Step 3: Understanding How Contextual Comments Work in React

The contextual comments feature in a React application works as follows:

1. **RoomProvider:** Provides a SuperViz room context to the entire application.
2. **useRoom Hook:** Allows components to access room functionality such as joining a room and adding components.
3. **CanvasPin:** This component enables pinning capability on the canvas element. Users can click anywhere on the canvas to create a pin.
4. **Comments:** This component provides a UI for adding and viewing comments attached to pins. When a user creates a pin, they can add a comment to it.
5. **Real-time Collaboration:** When multiple users are connected to the same room, they can see each other's pins and comments in real-time.

## Step 4: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can interact with the canvas and add comments in real-time as other participants join the session.

### 2. Test the Application

- **Adding Comments:** Click on the canvas to create a pin and add a comment.
- **Collaborative Testing:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that comments can be added and viewed in real-time.
- **Interaction:** Test the responsiveness of the application by placing comments on different areas of the canvas and observing how they appear for other participants.

## Summary

In this tutorial, we implemented a contextual comments feature in a canvas-based React application using SuperViz. We configured a React application with proper component structure to allow users to add comments to specific areas of a shared canvas, enabling seamless collaboration and interaction. This setup demonstrates how to effectively use SuperViz's React integration with hooks and providers for real-time collaborative features.
