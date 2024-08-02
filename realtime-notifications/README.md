# Step-by-Step Tutorial: Creating Real-Time Notifications with SuperViz

### Step 1: Setting Up the Server with Express.js

In this tutorial, we'll guide you through building a real-time notification system using SuperViz, a powerful SDK for real-time communication and data synchronization. Real-time notifications are a critical feature for many applications, enabling instant communication and engagement with users as events unfold.

We'll use SuperViz's [Real-Time Data Engine](https://docs.superviz.com/SDK/real-time) to send and receive notifications, demonstrating how to integrate this functionality into a React application. Although we’ll use a simple example for illustrative purposes, the techniques you’ll learn can be applied to various scenarios such as messaging apps, live updates for e-commerce sites, or alert systems in business applications. Let's dive in!

The server will handle incoming notification requests and use SuperViz to send real-time updates to clients.

**1. Create a New Project and Install Dependencies**

First, set up a new Node.js project and install the necessary packages for the server.

```bash

mkdir realtime-notifications-server
cd realtime-notifications-server
npm init -y
npm install express body-parser dotenv cors node-fetch
```

- **express:** A web application framework for setting up the server.
- **body-parser:** Middleware to parse incoming JSON request bodies.
- **dotenv:** Loads environment variables from a `.env` file.
- **cors:** Middleware to enable Cross-Origin Resource Sharing.
- **node-fetch:** Fetch API for making HTTP requests.

**2. Set Up the Express Server**

Create a file named `server.js` and configure the server.

```jsx
// server.js
import process from "node:process";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config(); // Load environment variables

const app = express(); // Initialize Express application

app.use(bodyParser.json()); // Use body-parser to parse JSON
app.use(cors()); // Enable CORS

// Basic route to check server uptime
app.get("/", (req, res) => {
  res.send(
    JSON.stringify({
      uptime: process.uptime(),
    })
  );
});

```

- **Express App:** An Express application is created to handle requests.
- **Middlewares:** `bodyParser` is used for JSON parsing, and `cors` is enabled for cross-origin requests.

**3. Implement the Notification Endpoint**

Define an endpoint to schedule and send notifications using SuperViz.

```jsx
app.post("/notify", (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: "error",
      message: "Missing body",
    });
  }

  const { channel, message, msToWait, roomId } = req.body;

  if (!channel || !message || !msToWait || !roomId) {
    return res.status(400).send({
      status: "error",
      message: "Missing required fields: channel, message, msToWait, roomId",
    });
  }

  setTimeout(async () => {
    const response = await fetch(
      `https://nodeapi.superviz.com/realtime/${roomId}/${channel}/publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiKey: process.env.VITE_SUPERVIZ_API_KEY,
        },
        body: JSON.stringify({
          name: "new-notification",
          data: message,
        }),
      }
    );

    console.log(
      `Sending data to ${channel}, message: ${message}`,
      response.status
    );
  }, msToWait);

  res.send({
    status: "success",
    message: "Notification scheduled",
  });
});

```

- **Notify Endpoint:** The `/notify` endpoint accepts POST requests to schedule notifications.
- **Request Validation:** Validates the presence of `channel`, `message`, `msToWait`, and `roomId`.
- **Delayed Execution:** Uses `setTimeout` to wait `msToWait` milliseconds before sending the notification using the SuperViz API.

**4. Start the Server**

Launch the server to listen for requests.

```jsx
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

```

- **Server Listening:** The server listens on port 3000 and logs a confirmation message when it's running.

### Step 2: Setting Up the Frontend with React

The frontend will display notifications in real time using React and the SuperViz SDK.

**1. Create a New React Project**

Initialize a new React application using Create React App with TypeScript.

```bash
npx create-react-app realtime-notifications-frontend --template typescript
cd realtime-notifications-frontend

```

**2. Install SuperViz SDK and React Toastify**

Add the necessary packages to the project.

```bash
npm install @superviz/sdk react-toastify uuid

```

- **@superviz/sdk:** SDK for real-time collaboration features.
- **react-toastify:** Library for showing notifications as toast messages.
- **uuid:** Library for generating unique identifiers.

**3. Set Up Environment Variables**

Create a `.env` file in the frontend directory and add your SuperViz API key.

```
VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_API_KEY
```

- **Environment Variables:** Store the API key securely using `.env` and access it through `import.meta.env`.

**4. Implement the Main App Component**

Open `src/App.tsx` and set up the main component to handle notifications.

```tsx
import { v4 as generateId } from "uuid";
import { useCallback, useEffect, useState } from "react";
import SuperVizRoom, {
  Realtime,
  RealtimeComponentEvent,
} from "@superviz/sdk";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
const ROOM_ID = generateId();

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [message, setMessage] = useState("");
  const [msToWait, setMsToWait] = useState(1000);

  const initialize = useCallback(async () => {
    if (initialized) return;

    const superviz = await SuperVizRoom(apiKey, {
      roomId: ROOM_ID,
      participant: {
        id: generateId(),
        name: "participant-name",
      },
      group: {
        id: "realtime-notifications",
        name: "realtime-notifications",
      },
    });

    const realtime = new Realtime();
    superviz.addComponent(realtime);
    setInitialized(true);

    realtime.subscribe(RealtimeComponentEvent.REALTIME_STATE_CHANGED, () => {
      const channel = realtime.connect("notification-topic");

      channel.subscribe("new-notification", (data) => {
        console.log("new event:", data);

        if (typeof data === "string") return;

        toast.info(data.data as string, {
          position: "top-right",
          autoClose: 3000,
        });
      });
    });
  }, [initialized]);

```

- **State Management:** The component uses `useState` to manage the state for initialization, message, and delay time.
- **SuperViz Initialization:** Connects to the SuperViz room using the API key, room ID, and participant details.
- **Realtime Subscription:** Subscribes to `new-notification` events and displays the notification using `react-toastify`.

**5. Implement the Notification Function**

Add the logic for sending notifications.

```tsx
const notify = useCallback(async () => {
  try {
    fetch("http://localhost:3000/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: ROOM_ID,
        channel: "notification-topic",
        message: message,
        msToWait: msToWait || 1000,
      }),
    });

    toast.success("Notification sent!", {
      position: "top-right",
      autoClose: 1000,
    });

    setMessage("");
    setMsToWait(1000);
  } catch (error) {
    toast.error("Failed to send notification!", {
      position: "top-right",
      autoClose: 1000,
    });
  }
}, [message, msToWait]);

```

- **Notify Function:** Sends a POST request to the server to schedule the notification.
- **Success/Failure Toasts:** Displays a toast message indicating whether the notification was sent successfully or failed.

**6. Render the UI Components**

Complete the `App` component by rendering the user interface.

```tsx
useEffect(() => {
  initialize();
}, [initialize]);

return (
  <>
    <ToastContainer />
    <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col">
      <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">Realtime Notifications</h1>
      </header>
      <main className="flex-1 p-20 flex w-full gap-2 items-center justify-center">
        <form>
          <h2 className="text-xl font-bold">Send Notification</h2>
          <p className="text-gray-500">
            Schedule a notification to be sent to all participants in the room.
          </p>
          <hr className="my-5" />

          <label htmlFor="message" className="text-lg font-bold">
            Message
          </label>
          <input
            type="text"
            id="message"
            name="message"
            placeholder="Hello, World!"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <hr className="my-5" />
          <label htmlFor="msToWait" className="text-lg font-bold">
            Time to wait (ms)
          </label>
          <input
            type="number"
            id="msToWait"
            name="msToWait"
            placeholder="1000"
            className="w-full p-3 border border-gray-300 rounded-md"
            min={1000}
            value={msToWait}
            onChange={(e) => setMsToWait(Number(e.target.value))}
          />
          <hr className="my-5" />
          <button
            type="button"
            onClick={notify}
            className="bg-purple-400 text-white p-3 rounded-md disabled:bg-gray-300"
            disabled={!message || !initialized || msToWait < 1000}
          >
            Send Notification
          </button>
        </form>
      </main>
    </div>
  </>
);

```

- **UI Structure:** The UI contains an input for the message and delay time, and a button to send notifications.
- **Form Validation:** The button is disabled if the message is empty, the system is not initialized, or the delay time is less than 1000ms.

### Step 3: Running the Application

To start the application, run this command in the terminal:

```bash 
npm run dev
```

This command will start both the server and the frontend application. 

You can access the frontend application at `http://localhost:5173` and the server at `http://localhost:3000`.

### Summary

In this tutorial, we've built a real-time notification system using SuperViz, Express.js, and React. The server schedules and sends notifications to clients using SuperViz's real-time API. The frontend subscribes to notification events, displaying them as toast messages. By following these steps, you can customize the notification system to handle different types of messages, add more features, and deploy it to a production environment.


Feel free to refer to the full code in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/realtime-notifications) for more details.