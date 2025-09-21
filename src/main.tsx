import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Отключаем service worker для предотвращения двойных запросов
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      console.log('🚫 Unregistering service worker:', registration.scope);
      registration.unregister();
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <App />
); 