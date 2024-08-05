## Step-by-Step Tutorial: How to build a customer support solution with real-time forms

In this tutorial we’ll demonstrate how to build a customer support application that uses SuperViz to integrate real-time collaborative forms and video conferencing. The real-time forms feature allows support agents and customers to edit form fields simultaneously, similar to how Google Docs works. When a support agent updates a form field, the customer can see the change in real-time, and vice versa. This collaborative approach ensures both parties are on the same page, leading to more efficient problem-solving. Additionally, we'll implement a video huddle feature, enabling more personalized support interactions through video calls. Let’s dive in!

### Step 1: Set Up Your React Application

To begin, you'll need to set up a new React project where we will integrate the SuperViz SDK.

1. **Create a New React Project**
    
    First, create a new React application using Create React App with TypeScript.
    
    ```bash
    
    npx create-react-app customer-support-app --template typescript
    cd customer-support-app
    ```
    
2. **Install SuperViz SDK**
    
    Next, install the SuperViz SDK, which will enable us to add real-time collaboration features to our application.
    
    ```bash
    
    npm install @superviz/sdk uuid react-icons
    ```
    
    - **@superviz/sdk:** SDK for integrating real-time communication features such as forms and video conferencing.
    - **uuid:** Library for generating unique identifiers, useful for creating unique participant IDs.
    - **react-icons:** A library for including icons, like a call button icon, in your React application.
3. **Set Up Environment Variables**
    
    Create a `.env` file in your project root and add your SuperViz API key. This key will be used to authenticate your application with SuperViz services.
    
    ```makefile
    makefileCopy code
    VITE_SUPERVIZ_API_KEY=YOUR_SUPERVIZ_API_KEY
    ```
    

---

### Step 2: Implement the Main Application

In this step, we'll implement the main application logic to initialize SuperViz and handle form inputs and video calls.

1. **Import Necessary Modules**
    
    Open `src/App.tsx` and import the required modules:
    
    ```tsx
    
    import { useCallback, useEffect, useRef, useState } from "react";
    import SuperVizRoom, { FormElements, VideoConference, LauncherFacade } from "@superviz/sdk";
    import { v4 as generateId } from "uuid";
    import { IoIosCall } from "react-icons/io";
    ```
    
    - **useCallback, useEffect, useRef, useState:** React hooks for managing state and lifecycle events.
    - **SuperVizRoom, FormElements, VideoConference, LauncherFacade:** Components from the SuperViz SDK for setting up the room, forms, and video conferencing.
    - **generateId:** A function from `uuid` for generating unique IDs for participants.
    - **IoIosCall:** A React icon for the call button, providing a visual element for initiating video calls.
2. **Initialize State and References**
    
    Define state variables and a reference for managing the application’s initialized state and SuperViz instance:
    
    ```tsx
    
    const apiKey = import.meta.env.VITE_SUPERVIZ_API_KEY as string;
    const ROOM_ID = "customer-support";
    
    export default function App() {
      const [initialized, setInitialized] = useState(false);
      const superviz = useRef<LauncherFacade | null>(null);
    ```
    
    - **apiKey:** Retrieves the SuperViz API key from environment variables.
    - **ROOM_ID:** A constant string representing the unique identifier for the room.
    - **initialized:** A state variable to check if the application is already initialized.
    - **superviz:** A reference to store the SuperViz instance, enabling the use of its methods across different components.
3. **Initialize the SuperViz Room and Forms**
    
    Implement a function to initialize the SuperViz room and configure form elements:
    
    ```tsx
    
    const initialize = useCallback(async () => {
      if (initialized) return;
    
      superviz.current = await SuperVizRoom(apiKey, {
        roomId: ROOM_ID,
        participant: {
          id: generateId(),
          name: "participant-name",
        },
        group: {
          id: "customer-support",
          name: "customer-support",
        },
      });
    
      const formElements = new FormElements({
        fields: ["name", "email", "company", "role"],
      });
    
      superviz.current.addComponent(formElements);
    
      setInitialized(true);
    }, [initialized]);
    ```
    
    - **SuperVizRoom:** Initializes a new SuperViz room using the API key, room ID, participant ID, and group details.
    - **FormElements:** Creates form elements with specified fields (`name`, `email`, `company`, `role`) to collect customer information.
    - **addComponent:** Adds the form elements component to the SuperViz room for collaboration.
4. **Initialize Video Conferencing**
    
    Set up a function to initialize video conferencing when the call button is clicked:
    
    ```tsx
    
    const initializeVideo = useCallback(() => {
      if (!initialized || !superviz.current) return;
    
      const video = new VideoConference({
        participantType: "host",
        collaborationMode: {
          enabled: true,
        },
      });
    
      superviz.current.addComponent(video);
    }, [initialized]);
    ```
    
    **VideoConference:** Configures a video conference component with the host participant type and enables collaboration mode.
    
    - **addComponent:** Adds the video conferencing component to the SuperViz room.
5. **Use Effect to Initialize Components**
    
    Use the `useEffect` hook to ensure components are initialized when the component mounts:
    
    ```tsx
    
    useEffect(() => {
      initialize();
    }, [initialize]);
    ```
    
    - **useEffect:** Automatically calls the `initialize` function when the component mounts, setting up the form and room configuration.
6. **Render the Application UI**
    
    Define the structure and styling for the customer support application's UI:
    
    ```tsx
    
    return (
      <>
        <div className="w-full h-full bg-gray-200 flex items-center justify-center flex-col">
          <header className="w-full p-5 bg-purple-400 flex items-center justify-between">
            <h1 className="text-white text-2xl font-bold">Customer Support</h1>
            <button
              className="rounded-full bg-green-400 p-3 text-white text-lg"
              onClick={initializeVideo}
            >
              <IoIosCall />
            </button>
          </header>
          <main className="flex-1 p-20 flex w-full gap-2 items-center justify-center">
            <form className="min-w-[500px] bg-white rounded-lg border border-solid border-gray-300 p-6 flex flex-col gap-6">
              <div>
                <label htmlFor="name" className="text-md font-bold">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your Name"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-md font-bold">
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Your Email"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <div>
                  <label htmlFor="company" className="text-md font-bold">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    placeholder="Your Company"
                    className="w-full p-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="text-md font-bold">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    placeholder="Your Role"
                    className="w-full p-3 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
    
              <button
                type="button"
                className="bg-purple-400 text-white p-3 rounded-md disabled:bg-gray-300"
              >
                Start Chat
              </button>
            </form>
          </main>
        </div>
      </>
    );
    ```
    
    - **Header:** Displays the application title and a button for initiating video calls.
    - **Main Content:** Contains a form for collecting customer information with fields for name, email, company, and role.
    - **Button for Video Call:** The `IoIosCall` icon button triggers the `initializeVideo` function to start a video conference.

---

### Step 3: Running the Application

**1. Start the React Application**

To run your application, use the following command in your project directory:

```bash

npm start
```

This command will start the development server and open your application in the default web browser. You can interact with the form and start video calls as part of the customer support workflow.

**2. Test the Application**

- **Form Functionality:** Ensure that the form fields are correctly displayed and can capture user input.
- **Video Conference:** Click the call button to test video conferencing, ensuring real-time video communication is established.

### Summary

In this tutorial, we built a customer support application with integrated real-time forms and video conferencing using SuperViz. We configured a React application to handle form inputs and video calls, enabling seamless interaction between support agents and customers. 

Feel free to explore the full code and further examples in the [GitHub repository](https://github.com/SuperViz/tutorials/tree/main/customer-support) for more details.