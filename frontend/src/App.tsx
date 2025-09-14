import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
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