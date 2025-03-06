# Step-by-Step Tutorial: How to Add Video Conferencing to a React Application

In this tutorial, we will guide you through integrating a video conference feature into your React application using SuperViz. This tutorial will use the dedicated React SDK from SuperViz to build the application.

Let's get started!

---

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the SuperViz SDK for video conferencing.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest video-conference-app -- --template react-ts
cd video-conference-app
```

### 2. Install SuperViz SDK

Next, install SuperViz, which will enable us to add video conferencing features to our application.

```bash
npm install @superviz/react @superviz/video react-icons uuid
```

- **@superviz/react:** The SuperViz core React package that contains the RoomProvider hooks.
- **@superviz/video:** Package that contains the video conference component.
- **react-icons:** A library for including icons in React applications, used here for a loading spinner icon.
- **uuid:** A library for generating unique identifiers, used for the participant ID.

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

In this step, we'll implement the main application logic to initialize the room and video conference.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the collaborative environment.

```typescript
import { RoomProvider, useRoom, useVideo } from '@superviz/react'
import { VideoConference, MeetingState } from "@superviz/video";

import { useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import { v4 as generateId } from 'uuid'
```

**Explanation:**

- **Imports:** Import necessary components and hooks from SuperViz, React, uuid, and React Icons.

### 2. Define Constants

Define constant for the DEVELOPER_TOKEN.

```typescript
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
```

**Explanation:**

- **DEVELOPER_TOKEN:** Retrieves the SuperViz API key from environment variables.

### 3. Add the Room Provider

Add the Room Provider to the main `App` component.

```typescript
export function App() {
  return (
    <RoomProvider developerToken={DEVELOPER_TOKEN}>
      <Children />
    </RoomProvider>
  )
}
```

**Explanation:**

- **RoomProvider:** A component that provides the SuperViz Room context to the application.
- **Children:** A component representing the main content of the application that will be rendered inside the RoomProvider.

### 4. Create the Children Component

Set up the `Children` component and initialize state variables.

```typescript
export const Children = () => {
  // States ::
  const [isLoading, setIsLoading] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
```

**Explanation:**

- **isLoading:** A state variable to track whether the conference is loading.
- **meetingEnded:** A state variable to track whether the meeting has ended.

### 5. Add hooks

Add the SuperViz useRoom hook and the useVideo Hook.

```typescript
// SuperViz userRoom hook ::
const { joinRoom, addComponent } = useRoom();

// SuperViz useVideo hook ::
useVideo({
  onMeetingStateUpdate: (state) => {
    if (state === MeetingState.MEETING_READY_TO_JOIN) setIsLoading(false);
  },
  onParticipantLeft: () => setMeetingEnded(true),
});
```

**Explanation:**

- **useRoom:** A hook to join the room and add components to the room.
- **useVideo:** A hook to manage the video conference component and handle events.

### 6. Initialize video conference

Create an `initialize` function to set up the SuperViz environment.

```typescript
// Initialize ::
const initialize = async () => {
  setIsLoading(true);

  try {
    await joinRoom({
      participant: {
        id: generateId(),
        name: " ",
      },
      group: {
        name: "GROUP_NAME",
        id: "GROUP_ID",
      },
      roomId: "ROOM_ID",
    });

    const video = new VideoConference({
      participantType: 'host',
      brand: {
        logoUrl: "https://docs.superviz.com/logo-white.svg",
      },
    });

    addComponent(video);

  } catch (error) {
    console.error("Error initializing SuperViz Room:", error);
  }
};
```

**Explanation:**

- **initialize:** An asynchronous function that initializes the SuperViz room
- **joinRoom:** Joins the SuperViz room with the specified participant, group, and room details.
- **VideoConference:** Creates a video conference component, setting the participant type to 'host'.
- **addComponent:** Adds the video conference component to the SuperViz room.

### 7. Render the application

Return the JSX structure for rendering the application.

```typescript
return (
  <div className="h-screen flex items-center justify-center bg-[#121212]">
    {isLoading ? (
        <ImSpinner2 className="text-4xl text-white animate-spin" />
    ) : meetingEnded ? (
      <div className="text-lg font-semibold text-white">Thank you for joining the video conference</div>
    ) : (
      <button
        className="bg-[#6210cc] text-white px-5 py-3 text-xs rounded-lg"
        onClick={initialize}
      >
        START VIDEO CONFERENCE
      </button>
    )}
  </div>
);
```

**Explanation:**

- **isLoading state:** Shows a loading spinner when the conference is loading.
- **meetingEnded state:** Shows a message when the meeting has ended.
- **button:** Renders a button that calls the `initialize` function.

### 8. Export the Component

Export the App component as the default export.

```typescript
export default App;
```

---

## Step 3: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```
This command will start the development server and open your application in the default web browser. You can initiate a video conference and invite other participants to join.

### 2. Test the Application

- **Video Conference:** Click the "START VIDEO CONFERENCE" button to start the video conference. Open the application in multiple browser windows or tabs to simulate multiple participants joining the conference.

## Summary

In this tutorial, we integrated a video conference feature into a React application using SuperViz. We configured a React application to handle video conferencing, enabling multiple users to join and participate in a video call seamlessly. This setup can be extended and customized to fit various scenarios where real-time communication and collaboration are required.
