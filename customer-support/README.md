## Step-by-Step Tutorial: How to build a customer support solution with real-time forms

In this tutorial we'll demonstrate how to build a customer support application that uses SuperViz to integrate real-time collaborative forms and video conferencing. The real-time forms feature allows support agents and customers to edit form fields simultaneously, similar to how Google Docs works. When a support agent updates a form field, the customer can see the change in real-time, and vice versa. This collaborative approach ensures both parties are on the same page, leading to more efficient problem-solving. Additionally, we'll implement a video huddle feature, enabling more personalized support interactions through video calls. Let's dive in!

### Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate SuperViz for collaborative forms and video capabilities.

#### 1. Create a New React Project

First, create a new React application using Vite with TypeScript.

```bash
npm create vite@latest customer-support-form -- --template react-ts
cd customer-support-form
```

#### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/room @superviz/collaboration @superviz/video react-icons uuid
```

- **@superviz/room:** Core package for creating and managing SuperViz rooms.
- **@superviz/collaboration:** Contains components for collaboration features, including FormElements for synchronized form interactions.
- **@superviz/video:** Provides video conferencing functionality.
- **react-icons:** Library for using icons in React applications.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.

#### 3. Configure tailwind

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

#### 4. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

### Step 2: Implement the Customer Support Form Application

In this step, we'll implement the main application logic to create a collaborative customer support form with video call capability.

#### 1. Import Required Modules

Open `src/App.tsx` and add the necessary imports:

```typescript
import { FormElements } from "@superviz/collaboration";
import { createRoom, Room } from "@superviz/room";
import { VideoEvent, VideoHuddle } from "@superviz/video";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoIosCall } from "react-icons/io";
import { v4 as generateId } from 'uuid';

// SuperViz developer token ::
const DEVELOPER_TOKEN = import.meta.env.VITE_SUPERVIZ_API_KEY;
```

**Explanation:**

- **FormElements:** SuperViz component for synchronizing form inputs across participants.
- **createRoom, Room:** Used to create and manage a collaborative SuperViz room.
- **VideoEvent, VideoHuddle:** Components for implementing video conferencing.
- **IoIosCall:** Icon for the video call button.
- **generateId:** Function to create unique IDs for participants.

#### 2. Create the Main App Component

Now, let's implement the App component that will manage the form and collaboration features:

```typescript
export default function App() {
  // States ::
  const [huddleStarted, setHuddleStarted] = useState(false);

  const roomRef = useRef<Room | null>(null);
}
```

**Explanation:**

- **huddleStarted:** State to track whether the video huddle has been started.
- **roomRef:** Reference to store the SuperViz room instance.

#### 3. Initialize SuperViz Room

Create an initialization function to set up the SuperViz room and FormElements component:

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

      const formElements = new FormElements({
        fields: [
          'name',
          'email',
          'company',
          'role',
        ]
      })

      room.addComponent(formElements)

    } catch (error) {
      console.error("Error initializing SuperViz Room:", error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);
```

**Explanation:**

- **createRoom:** Creates a SuperViz room with participant and group information.
- **FormElements:** Initializes the component with the form fields we want to synchronize.
- **room.addComponent:** Adds the FormElements component to the room for real-time collaboration.
- **useEffect:** Calls the initialize function when the component mounts.

#### 4. Implement Video Huddle Functionality

Add a function to start a video huddle for direct communication with customers:

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

- **startHuddle:** Function to initialize and start a video call.
- **VideoHuddle:** Creates a new video conference component with the current user as host.
- **video.subscribe:** Listens for when the local participant joins the video huddle and updates state.
- **roomRef.current.addComponent:** Adds the video component to the room for real-time communication.

#### 5. Create the Form Interface

Finally, implement the JSX to render the customer support form with the call button:

```typescript
return (
    <>
      <div className='w-full h-full bg-gray-200 flex items-center justify-center flex-col'>
        <header className='w-full p-5 bg-purple-400 flex items-center justify-between'>
          <h1 className='text-white text-2xl font-bold'>Customer Support</h1>
          {!huddleStarted && (
            <button className="rounded-full bg-green-400 p-3 text-white text-lg" onClick={startHuddle}>
              <IoIosCall />
            </button>
          )}
        </header>
        <main className='flex-1 p-20 flex w-full gap-2 items-center justify-center'>
          <form className="min-w-[500px] bg-white rounded-lg border border-solid border-gray-300 p-6 flex flex-col gap-6">
            <div>
              <label htmlFor='name' className='text-md font-bold'>Name</label>
              <input
                type='text'
                id='name'
                name='name'
                placeholder='Your Name'
                className='w-full p-3 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label htmlFor='email' className='text-md font-bold'>Email</label>
              <input
                type='text'
                id='email'
                name='email'
                placeholder='Your Email'
                className='w-full p-3 border border-gray-300 rounded-md' />
            </div>
            <div className="flex gap-2">
              <div>
                <label htmlFor='company' className='text-md font-bold'>Company</label>
                <input
                  type='text'
                  id='company'
                  name='company'
                  placeholder='Your Company'
                  className='w-full p-3 border border-gray-300 rounded-md' />
              </div>
              <div>
                <label htmlFor='role' className='text-md font-bold'>Role</label>
                <input
                  type='text'
                  id='role'
                  name='role'
                  placeholder='Your Role'
                  className='w-full p-3 border border-gray-300 rounded-md' />
              </div>
            </div>

            <button
              type='button'
              className='bg-purple-400 text-white p-3 rounded-md disabled:bg-gray-300'
            >
              Start Chat
            </button>
          </form>
        </main>
      </div>
    </>
  )
}
```

**Explanation:**

- **Header:** Contains the application title and a call button that appears only when the video huddle hasn't started.
- **Form:** Contains input fields for name, email, company, and role, each with the correct ID and name attributes that match the fields specified in FormElements.
- **Start Chat Button:** A button to proceed after the form is filled out (in a real application, this would trigger the next step in your customer support flow).

---

### Step 3: Understanding How FormElements Works

Let's look at how SuperViz's FormElements enables collaborative form interactions:

1. **Field Specification**
   - The FormElements component is initialized with an array of field names that should be synchronized.
   - These fields correspond to the 'name' attributes of the input elements in your form.

2. **Real-time Synchronization**
   - As users type in form fields, their inputs are synchronized in real-time with other participants.
   - All participants can see what others are typing as they type it, enabling collaborative form completion.

3. **Customer Support Scenario**
   - A support agent can help a customer fill out a form by typing in fields directly, or by guiding them verbally via the video huddle.
   - Both the customer and agent see the same form state at all times, making it easier to provide assistance.

4. **Integration with Video**
   - The video huddle feature complements the form collaboration by providing face-to-face communication.
   - Support agents can explain complex fields or requirements while simultaneously helping with form completion.

---

### Step 4: Running the Application

#### 1. Start the Application

To run your application, use the following command in your project directory:

```bash
npm run dev
```

This command will start the development server and open your application in the default web browser. You can interact with the form and see updates in real-time across multiple participants.

#### 2. Test the Application

- **Collaborative Form:** Open the application in multiple browser windows or tabs to simulate different users (customer and support agent). Type in one form and observe how the input is synchronized in real-time with the other window.
- **Video Huddle:** Click the call button in one window to start a video huddle and test the face-to-face communication feature.
- **Combined Experience:** Test the full scenario by having one window represent the customer and another represent the support agent. Fill out the form collaboratively while communicating through the video huddle.

### Summary

In this tutorial, we built a customer support form application with real-time collaboration using SuperViz. We implemented form field synchronization using the FormElements component and added video calling capabilities for direct communication. This combination enables effective customer support scenarios where agents can assist users with form completion while maintaining visual and verbal communication.

This application demonstrates how SuperViz can enhance customer support experiences by providing real-time collaboration tools. The approach can be extended to various scenarios such as:

- Customer onboarding processes
- Technical support for complex application forms
- Sales assistance during purchase or registration
- Virtual consulting sessions

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/customer-support) for more details.