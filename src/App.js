// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Administration from './pages/Administration/Administration';
import Students from './pages/Students/Students';
import Companies from './pages/Companies/Companies';
import Assessment from './pages/Assessment/Assessment';
import './App.css';
import Users from './pages/Users/Users';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/administration" element={<Administration />} />
          <Route path="/students" element={<Students />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/users" element={<Users />} />
          <Route path="/assessment" element={<Assessment />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
