import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Concurrent rendering is enabled by default with createRoot. 
// StrictMode is omitted to prevent redundant suspension/unsuspension cycles 
// with useGLTF which can lead to React Error #525.
root.render(<App />);