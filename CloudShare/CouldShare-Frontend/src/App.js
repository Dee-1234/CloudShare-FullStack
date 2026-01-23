import React from 'react';
import AuthPage from './pages/AuthPage'; // Make sure the path matches your folder
import DashboardPage from './pages/DashboardPage';

function App() {
  const token = localStorage.getItem('token');
  return (
    <div className="App">
      {token ? <DashboardPage /> : <AuthPage />}
    </div>
  );
}

export default App;