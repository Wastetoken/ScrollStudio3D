import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// StrictMode is removed as it can cause duplicate suspension and state update issues (Error #525) 
// especially when integrating complex 3D libraries like React Three Fiber with concurrent features.
root.render(<App />);