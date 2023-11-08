import './App.module.css';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from "~/routes/AppRoutes"

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const login = () => {
    window.open('http://localhost:5000/v1/auth/google', '_self');
  }

  return (
    <>
    <div className="App">
      <a href="http://localhost:5000/v1/auth/google" style = {{color: "black"}}>Login with Google</a>
    </div>

    <div className="App">
      <a href="http://localhost:5000/v1/auth/facebook" style = {{color: "black"}}>Login with Facebook</a>
    </div>
    </>
  );

  // Handle events from socket connection
  
  return <AppRoutes />
}

export default App;