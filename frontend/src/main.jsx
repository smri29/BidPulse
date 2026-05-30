/**
 * Module: main.jsx
 * Purpose: Supports the main module and keeps its responsibility isolated by file name.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';

// Frontend bootstrap:
// - mounts React
// - injects the Redux store globally
// - loads the shared visual system from index.css
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
