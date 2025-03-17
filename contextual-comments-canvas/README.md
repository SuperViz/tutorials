# Step-by-Step Tutorial: How to Add a Contextual Comments Feature into a Canvas-Based Web Application

In this tutorial, we will guide you through integrating a [contextual comments](https://docs.superviz.com/react-sdk/contextual-comments) feature into a canvas-based web application using SuperViz. Contextual comments are a powerful tool for collaborative applications, allowing users to annotate specific areas of a canvas. This feature is especially useful for design, brainstorming, and feedback applications where users need to discuss particular elements of a shared visual space.

We'll demonstrate how to use SuperViz to implement a contextual comments system in a JavaScript application with a canvas element. This setup will enable multiple users to add comments to different areas of the canvas, facilitating real-time collaboration and feedback. Let's get started!

---

## Step 1: Set Up Your Application

To begin, you'll need to set up a new project where we will integrate the SuperViz SDK for contextual comments.

### 1. Create a New Project

First, create a new application using Vite with JavaScript or TypeScript.

```bash
npm create vite@latest contextual-comments-canvas -- --template vanilla-ts
cd contextual-comments-canvas
```

### 2. Install SuperViz SDK

Next, install SuperViz, which will enable us to add real-time contextual comments to our application.

```bash
npm install @superviz/room @superviz/collaboration uuid
```

- **@superviz/room:** Core package for creating and managing SuperViz rooms.
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

### 1. Implement the App Component

Open `src/main.js` or `src/App.js` and set up the main application component to manage the collaborative environment.

```javascript
import { createRoom } from "@superviz/room";
import { v4 as generateId } from "uuid";

import { useCallback, useEffect } from "react";
import { Comments, CanvasPin } from '@superviz/collaboration';

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
```

**Explanation:**

- **createRoom:** Function from SuperViz that creates a new room instance.
- **generateId:** Function from uuid to generate unique IDs for participants.
- **Comments, CanvasPin:** Components from SuperViz collaboration package for adding comments and pin functionality.
- **DEVELOPER_TOKEN:** Retrieves the SuperViz API key from environment variables.

### 2. Create the App Component

Define the main component that will initialize SuperViz and render the canvas.

```javascript
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
```

**Explanation:**

- **initialize:** An asynchronous function that sets up the SuperViz room and components.
- **createRoom:** Creates a new SuperViz room with the specified configuration.
- **CanvasPin:** Creates a pinning adapter for the canvas element.
- **Comments:** Creates a comments component that uses the canvas pin adapter.
- **room.addComponent:** Adds the comments component to the SuperViz room.
- **useEffect:** Runs the initialize function when the component mounts.

### 3. Render the Canvas

Add the JSX structure to render the canvas element.

```javascript
return (
  <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col relative">
    <canvas id="canvas" className="w-full h-full"></canvas>
  </div>
);

export default App;
```

**Explanation:**

- **div:** A container for the application with full width and height.
- **canvas:** The HTML canvas element where users can add contextual comments. The ID 'canvas' matches the ID used in the CanvasPin initialization.

## Step 3: Understanding How Contextual Comments Work

The contextual comments feature works as follows:

1. **CanvasPin:** This component enables pinning capability on the canvas element. Users can click anywhere on the canvas to create a pin.
2. **Comments:** This component provides a UI for adding and viewing comments attached to pins. When a user creates a pin, they can add a comment to it.
3. **Real-time Collaboration:** When multiple users are connected to the same room, they can see each other's pins and comments in real-time.

## Step 4: Running the Application

### 1. Start the Application

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

In this tutorial, we implemented a contextual comments feature in a canvas-based web application using SuperViz. We configured an application to allow users to add comments to specific areas of a shared canvas, enabling seamless collaboration and interaction. This setup can be extended and customized to fit various scenarios where real-time feedback and collaboration are required.
