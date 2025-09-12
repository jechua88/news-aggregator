import React from 'react';
import Dashboard from './pages/Dashboard.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="App bg-gray-900 min-h-screen">
        <Dashboard />
      </div>
    </ErrorBoundary>
  );
}

export default App;