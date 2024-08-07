# Step-by-Step Tutorial: How to Add a Video Huddle to your web-application

In this tutorial, we will guide you through integrating a video huddle feature into your web application using the SuperViz SDK. Video huddles are essential for real-time communication and collaboration, enabling users to interact via video conferencing directly within your application. This feature is perfect for remote teams, educational platforms, and any scenario where visual communication enhances collaboration. Let's get started!

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the SuperViz SDK for video huddles.

### 1. Create a New React Project

First, create a new React application using Create React App with TypeScript.

```bash
npm create vite@latest video-huddle-app -- --template react-ts
cd video-huddle-app
```

### 2. Install SuperViz SDK

Next, install the SuperViz SDK, which will enable us to add video conferencing features to our application.

```bash
npm install @superviz/sdk uuid react-icons
```

- **@superviz/sdk:** SDK for integrating real-time collaboration features, including video conferencing.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.
- **react-icons:** A library for including icons in React applications, used here for a call button icon.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

### Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle video conferencing.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the collaborative environment.

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import SuperVizRoom, { VideoConference, LauncherFacade } from '@superviz/sdk';
import { v4 as generateId } from 'uuid';
import { IoIosCall } from "react-icons/io";
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz SDK, UUID, and React Icons for managing state, initializing SuperViz, and rendering the call button.

### 2. Define Constants

Define constants for the API key and room ID.

```tsx
typescriptCopy code
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = 'video-huddle';
```

**Explanation:**

- **apiKey:** Retrieves the SuperViz API key from environment variables.
- **ROOM_ID:** Defines the room ID for the SuperViz session, representing the video huddle room.

### 3. Create the App Component

Set up the main `App` component and initialize state variables.

```tsx
export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [videoInitialized, setVideoInitialized] = useState(false);
  const superviz = useRef<LauncherFacade | null>(null);
```

**Explanation:**

- **initialized:** A state variable to track whether the SuperViz environment has been set up.
- **videoInitialized:** A state variable to track whether the video conferencing component has been initialized.
- **superviz:** A ref to store the SuperViz room instance.

### 4. Initialize SuperViz

Create an `initialize` function to set up the SuperViz environment.

```tsx
const initialize = useCallback(async () => {
  if (initialized) return;

  superviz.current = await SuperVizRoom(apiKey, {
    roomId: ROOM_ID,
    participant: {
      id: generateId(),
      name: 'participant-name',
    },
    group: {
      id: 'video-huddle',
      name: 'video-huddle',
    }
  });

  setInitialized(true);
}, [initialized]);
```

**Explanation:**

- **initialize:** An asynchronous function that initializes the SuperViz room and checks if it's already initialized to prevent duplicate setups.
- **SuperVizRoom:** Configures the room, participant, and group details for the session.

### 5. Initialize Video Conference

Create a function to initialize the video conferencing component.

```tsx
const initializeVideo = useCallback(() => {
  if (!initialized || !superviz.current) return;

  const video = new VideoConference({
    participantType: 'host',
  });

  superviz.current.addComponent(video);
  setVideoInitialized(true);
}, [initialized]);
```

**Explanation:**

- **initializeVideo:** Checks if SuperViz is initialized before setting up the video conference component.
- **VideoConference:** Creates a video conference component, setting the participant type to 'host'.
- **addComponent:** Adds the video conference component to the SuperViz room.

### 6. Use Effect Hook for Initialization

Use the `useEffect` hook to trigger the `initialize` function on component mount.

```tsx
useEffect(() => {
  initialize();
}, [initialize]);
```

**Explanation:**

- **useEffect:** Calls the `initialize` function once when the component mounts, setting up the SuperViz environment.

### 7. Render the Application

Return the JSX structure for rendering the application, including the video conference button.

```tsx
return (
  <>
    <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
      <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
        <h1 className='text-white text-2xl font-bold'>Video Huddle</h1>
        {
          !videoInitialized && (
            <button className="rounded-full bg-green-400 p-3 text-white text-lg disabled:opacity-75" onClick={initializeVideo} disabled={!initialized}>
              <IoIosCall />
            </button>
          )
        }
      </header>
      <main className='w-full h-full bg-app-background bg-[24px_10%] bg-no-repeat bg-[length:70%_auto]'></main>
    </div>
  </>
);
```

**Explanation:**

- **Header:** Displays the title of the application.
- **Video Call Button:** Renders a button to initialize the video conference, using the `IoIosCall` icon from React Icons. The button is disabled until SuperViz is initialized.

---

### Step 3: Understanding the Project Structure

Here's a quick overview of how the project structure supports video huddles:

1. **`App.tsx`**
    - Initializes the SuperViz environment.
    - Sets up participant information and room details.
    - Handles video conferencing initialization and interaction.
2. **Video Conferencing**
    - Uses the `VideoConference` component from SuperViz to manage video huddles.
    - Allows users to start a video call directly within the application.
3. **Real-Time Collaboration**
    - Supports real-time communication and interaction between participants during the video huddle.

---

### Step 4: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm start
```

This command will start the development server and open your application in the default web browser. You can initiate a video huddle and invite other participants to join.

### 2. Test the Application

- **Video Huddle:** Click the video call button to start a video conference. Open the application in multiple browser windows or tabs to simulate multiple participants joining the call.
- **Collaborative Interaction:** Test the responsiveness of the application by interacting with participants during the video huddle.

### Summary

In this tutorial, we integrated a video huddle feature into a web application using SuperViz. We configured a React application to handle video conferencing, enabling multiple users to join and participate in a video call seamlessly. This setup can be extended and customized to fit various scenarios where real-time communication and collaboration are required.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/video-huddle) for more details.