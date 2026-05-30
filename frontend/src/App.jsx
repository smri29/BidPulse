/**
 * Module: App.jsx
 * Purpose: Supports the App module and keeps its responsibility isolated by file name.
 */
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';

import AppLayout from './app/AppLayout';
import AppRoutes from './app/AppRoutes';
import { useAppRuntimeEffects } from './app/useAppRuntimeEffects';

// App is now a thin composition layer that wires global runtime effects into
// the route tree and shared shell.
function App() {
  const { user } = useSelector((state) => state.auth);

  useAppRuntimeEffects(user);

  return (
    <Router>
      <AppLayout user={user}>
        <AppRoutes />
      </AppLayout>
    </Router>
  );
}

export default App;
