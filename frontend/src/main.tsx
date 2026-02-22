import React from "react";
import ReactDOM from "react-dom/client";
import { ChatPage } from "@/components/chat/chat-page";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChatPage />
  </React.StrictMode>
);
