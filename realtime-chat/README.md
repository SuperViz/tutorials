# Step-by-Step Tutorial: Learn how to build a real-time chat

In this tutorial, we will guide you through building a real-time chat application using SuperViz. Real-time chat is a crucial feature for modern web applications, enabling users to communicate instantly with each other. Whether you're building a collaborative platform, customer support tool, or social networking site, adding real-time chat enhances user interaction and engagement.

We'll demonstrate how to set up a simple chat interface where participants can send and receive messages in real-time. By the end of this tutorial, you'll have a fully functional chat application that you can extend and customize to meet your specific needs.

Let's get started!

---

### Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate SuperViz for real-time communication.

### 1. Create a New React Project

First, create a new React application using Create React App with TypeScript.

```bash
npm create vite@latest realtime-chat -- --template react-ts
cd realtime-chat
```

### 2. Install Required Libraries

Next, install the necessary libraries for our project:

```bash
npm install @superviz/realtime uuid react-icons
```

- **@superviz/realtime:** SuperViz Real-Time library for integrating real-time synchronization into your application.
- **uuid:** A library for generating unique identifiers, useful for creating unique participant IDs.
- **react-icons:** A library for including icons in React applications, used here for the send button icon.

### 3. Set Up Environment Variables

Create a `.env` file in your project root and add your SuperViz developer key. This key will be used to authenticate your application with SuperViz services.

```makefile
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_DEVELOPER_KEY
```

---

### Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle real-time chat messages.

### 1. Implement the App Component

Open `src/App.tsx` and set up the main application component using SuperViz to manage the chat functionality.

```tsx
import { v4 as generateId } from "uuid";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  Realtime,
  type RealtimeMessage,
  type Channel,
} from "@superviz/realtime/client";
import { IoMdSend } from "react-icons/io";
```

**Explanation:**

- **Imports:** Import necessary components from React, SuperViz, UUID, and React Icons for managing state, initializing SuperViz, and rendering the chat interface.

### 2. Define Constants

Define constants for the API key, room ID, and message types.

```tsx
const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;

type Message = {
  participantName: string;
  message: string;
};
```

**Explanation:**

- **apiKey:** Retrieves the SuperViz API key from environment variables.
- **Message:** A type that will be used to extend RealtimeMessage to include participant name and message content.

### 3. Create the App Component

Set up the main `App` component and initialize state variables and references.

```tsx
export default function App() {
  const url = new URL(window.location.href);
  const name = url.searchParams.get("name") || "Anonymous";

  const participant = useRef({
    id: generateId(),
    name: 'participant-name',
  });
  const channel = useRef<Channel | null>(null);
  const initialized = useRef(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
```

**Explanation:**

- **participant:** Stores the current participant's ID and name using `useRef`.
- **channel:** Stores the reference to the real-time communication channel.
- **initialized:** Tracks whether SuperViz has been initialized.
- **message & messages:** Manages the current message input and the list of chat messages.

### 4. Initialize SuperViz

Create a function to initialize SuperViz and set up real-time message handling.

```tsx
const initialize = useCallback(async () => {
  if (initialized.current) return;
  initialized.current = true;

  const realtime = new Realtime(apiKey, {
    participant: participant.current,
  });

  channel.current = await realtime.connect("message-topic");

  channel.current.subscribe<Message>("message", (data) => {
    setMessages((prev) =>
      [...prev, data].sort((a, b) => a.timestamp - b.timestamp)
    );
  });
}, [initialized]);
```

**Explanation:**

- **initialize:** Initializes SuperViz, sets up the real-time component, and subscribes to the message topic.
- **Realtime:** Handles real-time communication for the chat.
- **channel.current:** Stores the connection to the 'message-topic' channel, where messages are published and subscribed.

### 5. Handle Sending Messages

Create a function to send messages to the chat.

```tsx
const sendMessage = useCallback(() => {
  if (!channel.current) return;

  channel.current.publish("message", {
    message,
    participantName: participant.current!.name,
  });

  setMessage("");
}, [message]);
```

**Explanation:**

- **sendMessage:** Publishes the current message to the 'message-topic' channel and resets the message input.

### 6. Use Effect Hook for Initialization

Use the `useEffect` hook to trigger the `initialize` function on component mount.

```tsx
useEffect(() => {
  initialize();
}, [initialize]);
```

**Explanation:**

- **useEffect:** Calls the `initialize` function once when the component mounts, setting up the SuperViz environment and real-time chat.

---

### Step 3: Render the Chat Interface

Finally, return the JSX structure for rendering the chat interface.

```tsx
return (
  <div className="w-full h-full bg-[#e9e5ef] flex items-center justify-center flex-col">
    <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
      <h1 className="text-white text-2xl font-bold">Realtime Chat</h1>
    </header>
    <main className="flex-1 flex w-full flex-col justify-between overflow-hidden">
      <div className="bg-[#e9e5ef] w-full p-2 overflow-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.participantId === participant.current!.id
                ? "justify-end"
                : "justify-start"
            } w-full flex mb-2`}
          >
            <div
              className={`${
                message.participantId === participant.current!.id
                  ? "bg-[#f29ee8]"
                  : "bg-[#baa9ff]"
              } text-black p-2 rounded-lg max-w-xs`}
            >
              <div
                className={`${
                  message.participantId === participant.current!.id
                    ? "text-right"
                    : "text-left"
                } text-xs text-[#57535f]`}
              >
                {message.participantId === participant.current!.id
                  ? "You"
                  : message.data.participantName}
              </div>
              {message.data.message}
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 flex items-center justify-between gap-2 w-full h-[58px]">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="bg-purple-400 text-white px-4 py-2 rounded-full disabled:opacity-50"
          onClick={sendMessage}
          disabled={!message || !channel.current}
        >
          <IoMdSend />
        </button>
      </div>
    </main>
  </div>
);
```

**Explanation:**

- **Chat Interface:** Displays the chat messages and an input field with a send button. Messages are styled differently based on whether they are sent by the current participant or others.

---

### Step 4: Understanding the Project Structure

Here's a quick overview of how the project structure supports a real-time chat application:

1. **`App.tsx`**
   - Initializes SuperViz and sets up real-time chat functionality.
   - Handles sending and receiving chat messages in real-time.
2. **Chat Interface**
   - Displays messages in a chat bubble format.
   - Provides an input field and send button for users to send messages.
3. **Real-Time Communication**
   - Manages real-time communication between participants using SuperViz.

---

### Step 5: Running the Application

### 1. Start the React Application

To run your application, use the following command in your project directory:

```bash
npm start
```

This command will start the development server and open your application in the default web browser. You can interact with the chat interface and see messages in real-time as other participants join.

### 2. Test the Application

- **Real-Time Messaging:** Open the application in multiple browser windows or tabs to simulate multiple participants and verify that messages are sent and received in real-time.
- **Collaborative Interaction:** Test the responsiveness of the application by sending messages and observing how the chat updates for all participants.

### Summary

In this tutorial, we built a real-time chat application using SuperViz. We configured a React application to handle real-time messaging, enabling multiple users to communicate seamlessly. This setup can be extended and customized to fit various scenarios where real-time communication is essential.

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/realtime-chat) for more details.
