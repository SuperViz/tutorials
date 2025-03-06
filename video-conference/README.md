# Step-by-Step Tutorial: How to Add Video Conferencing to a JavaScript Application

In this tutorial, we will guide you through integrating a video conference feature into your JavaScript application using SuperViz.

Let's get started!

---

## Step 1: Set Up Your JavaScript Application

To begin, you'll need to set up a new project where we will integrate the SuperViz SDK for video conferencing.

### 1. Create a New Project

First, create a new application using Vite with JavaScript.

```bash
npm create vite@latest video-conference-app -- --template vanilla
cd video-conference-app
```

### 2. Install SuperViz SDK

Next, install SuperViz, which will enable us to add video conferencing features to our application.

```bash
npm install @superviz/room @superviz/video react-icons uuid
```

- **@superviz/room:** The SuperViz core package that contains the room creation functionality.
- **@superviz/video:** Package that contains the video conference component.
- **react-icons:** A library for including icons in applications, used here for a loading spinner icon.
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

Then we need to add the tailwind directives to the global CSS file. (src/style.css)

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

### 1. Set Up the Main Component

Open `src/main.js` and set up the main application component using SuperViz to manage the collaborative environment.

```javascript
import { createRoom } from "@superviz/room";
import { MeetingState, VideoConference, VideoEvent } from "@superviz/video";

import { useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import { v4 as generateId } from 'uuid'
```

**Explanation:**

- **createRoom:** Function from SuperViz that creates a new room instance.
- **MeetingState, VideoConference, VideoEvent:** Components and enums from SuperViz for video conferencing.
- **useState:** React hook for state management (if using React).
- **ImSpinner2:** Loading spinner icon from react-icons.
- **generateId:** Function from uuid to generate unique IDs.

### 2. Define Constants

Define constant for the DEVELOPER_TOKEN.

```javascript
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
```

**Explanation:**

- **DEVELOPER_TOKEN:** Retrieves the SuperViz API key from environment variables.

### 3. Create the App Component

Set up the main `App` component and initialize state variables.

```javascript
const App = () => {
  // States ::
  const [isLoading, setIsLoading] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
```

**Explanation:**

- **isLoading:** A state variable to track whether the conference is loading.
- **meetingEnded:** A state variable to track whether the meeting has ended.

### 4. Define Event Handlers

Create event handler functions to respond to video conference events.

```javascript
const onMeetingStateUpdate = (meetingState: MeetingState) => {
  // settings mounted remove loading ::
  if (meetingState === MeetingState.MEETING_READY_TO_JOIN) setIsLoading(false);
};

const onParticipantLeft = () => {
  setMeetingEnded(true);
};
```

**Explanation:**

- **onMeetingStateUpdate:** Handles updates to the meeting state, turning off loading when ready.
- **onParticipantLeft:** Handles when a participant leaves the meeting.

### 5. Initialize Video Conference

Create an `initialize` function to set up the SuperViz environment.

```javascript
const initialize = async () => {
  setIsLoading(true);

  try {
    const room = await createRoom({
      developerToken: DEVELOPER_TOKEN,
      roomId: "ROOM_ID",
      participant: {
        id: generateId(),
        name: " ",
      },
      group: {
        id: "GROUP_ID",
        name: "GROUP_NAME",
      },
    });

    const video = new VideoConference({
      participantType: "host",
      brand: {
        logoUrl: "https://docs.superviz.com/logo-white.svg",
      },
    });

    video.subscribe(VideoEvent.MEETING_STATE_UPDATE, onMeetingStateUpdate);
    video.subscribe(VideoEvent.MY_PARTICIPANT_LEFT, onParticipantLeft);

    room.addComponent(video);
  } catch (error) {
    console.error("Error initializing SuperViz Room:", error);
  }
};
```

**Explanation:**

- **createRoom:** Creates a new SuperViz room with the specified configuration.
- **VideoConference:** Creates a video conference component, setting the participant type to 'host'.
- **subscribe:** Registers event handlers for various video conference events.
- **addComponent:** Adds the video conference component to the SuperViz room.

### 6. Render the Application

Return the JSX structure for rendering the application.

```javascript
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

### 7. Export the Component

Export the App component as the default export.

```javascript
export default App;
```

---

## Step 3: Running the Application

### 1. Start the Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can initiate a video conference and invite other participants to join.

### 2. Test the Application

- **Video Conference:** Click the "START VIDEO CONFERENCE" button to start the video conference. Open the application in multiple browser windows or tabs to simulate multiple participants joining the conference.

## Summary

In this tutorial, we integrated a video conference feature into a JavaScript application using SuperViz. We configured an application to handle video conferencing, enabling multiple users to join and participate in a video call seamlessly. This setup can be extended and customized to fit various scenarios where real-time communication and collaboration are required.
