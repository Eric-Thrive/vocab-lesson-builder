import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add storage API to window for the app
window.storage = {
  async set(key, value) {
    localStorage.setItem(key, value);
    return { success: true };
  },
  async get(key) {
    const value = localStorage.getItem(key);
    return value ? { value } : null;
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { success: true };
  },
  async list(prefix) {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    return { keys };
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
