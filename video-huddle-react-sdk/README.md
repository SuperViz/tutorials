# Step-by-Step Tutorial: How to Add Video Huddles to a React Application

In this tutorial, we will guide you through integrating a video huddle feature into your React application using SuperViz. This tutorial will use the dedicated React SDK from SuperViz to build the application.

Video huddles are essential for real-time communication and collaboration, enabling users to interact via video conferencing directly within your application. This feature is perfect for remote teams, educational platforms, and any scenario where visual communication enhances collaboration. Let's get started!

---

## Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the SuperViz SDK for video huddles.

### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest video-huddle-app -- --template react-ts
cd video-huddle-app
```

### 2. Install SuperViz SDK

Next, install SuperViz, which will enable us to add video conferencing features to our application.

```bash
npm install @superviz/react @superviz/video react-icons uuid
```

- **@superviz/react:** The SuperViz core react package that contains the RoomProvider hooks.
- **@superviz/video:** Package that contains the video huddle component.
- **react-icons:** A library for including icons in React applications, used here for a call button icon.
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

In this step, we'll implement the main application logic to initialize the room and video huddle.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the collaborative environment.

```typescript
import { RoomProvider, useRoom, useVideo } from '@superviz/react'
import { VideoHuddle, MeetingState } from "@superviz/video";

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

- **apiKey:** Retrieves the SuperViz API key from environment variables.

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

Set up the main `App` component and initialize state variables.

```typescript
export const Children = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);
```

**Explanation:**

- **isLoading:** A state variable to track whether the the huddle is loading.
- **meetingEnded:** A state variable to track whether the meeting has ended.
- **meetingStarted:** A state variable to track whether the meeting has started.

### 5. Add hooks

Add the SuperViz userRoom hook and the Video useVideo Hook.

```typescript
const { joinRoom, addComponent } = useRoom();

useVideo({
  onMeetingStateUpdate: (state: MeetingState) => {
    if (state === MeetingState.MEETING_READY_TO_JOIN) setIsLoading(false);
  },
  onParticipantLeft: () => setMeetingEnded(true),
  onParticipantJoined: () => setMeetingStarted(true),
});
```

**Explanation:**

- **useRoom:** A hook to join the room and add components to the room.
- **useVideo:** A hook to manage the video conference component.

### 6. Initialize video huddle

Create an `initialize` function to set up the SuperViz environment.

```typescript
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

    const video = new VideoHuddle({
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
- **VideoHuddle:** Creates a video conference component, setting the participant type to 'host'.
- **addComponent:** Adds the video conference component to the SuperViz room.

### 7. Render the application

Return the JSX structure for rendering the application.

```typescript
return (
    <div className="h-screen flex items-center justify-center bg-[#121212]">
      {isLoading ? (
          <ImSpinner2 className="text-4xl text-white animate-spin" />
      ) : meetingEnded ? (
        <div className="text-lg font-semibold text-white">Thank you for joining the video huddle</div>
      ) : meetingStarted ? (
        <div className="text-lg font-semibold text-white">Content going here</div>
      ): (
        <button
          className="bg-[#6210cc] text-white px-5 py-3 text-xs rounded-lg"
          onClick={initialize}
        >
          START VIDEO HUDDLE
        </button>
      )}
    </div>
  );
```

**Explanation:**

- **isLoading state:** Shows a loading spinner when the huddle is loading.
- **meetingEnded state:** Shows a message when the meeting has ended.
- **meetingStarted state:** Shows the content of the application when the meeting has started.
- **button:** Renders a button that calls the `initialize` function.

---

## Step 4: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can initiate a video huddle and invite other participants to join.

### 2. Test the Application

- **Video Huddle:** Click the video call button to start the video huddle. Open the application in multiple browser windows or tabs to simulate multiple participants joining the huddle.

## Summary

In this tutorial, we integrated a video huddle feature into a web application using SuperViz. We configured a React application to handle video huddle, enabling multiple users to join and participate in a video call seamlessly. This setup can be extended and customized to fit various scenarios where real-time communication and collaboration are required.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/video-huddle-react-sdk) for more details.
