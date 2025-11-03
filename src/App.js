// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Administration from './pages/Administration/Administration';
import Students from './pages/Students/Students';
import Companies from './pages/Companies/Companies';
import Assessment from './pages/Assessment/Assessment';
import './App.css';
import Users from './pages/DirectorPanel/Users/Users';
import Settings from './pages/Settings/Settings';
import Control from './pages/Control/Control';
import FollowUp from './pages/FollowUp/FollowUp';
import EmploymentPlacement from './pages/EmploymentPlacement/EmploymentPlacement';
import EmploymentPlacementList from './pages/EmploymentPlacement/EmploymentPlacementList/EmploymentPlacementList';
import StudentsList from './pages/Students/StudentsList/StudentsList';
import UsersList from './pages/Users/UsersList/UsersList';
import CompaniesList from './pages/Companies/CompaniesList/CompaniesList';
import AssessmentList from './pages/Assessment/AssessmentList/Assessment-list';
import DirectorPanel from './pages/DirectorPanel/DirectorPanel';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/administration" element={<Administration />} />
          <Route path="/students" element={<Students />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies-list" element={<CompaniesList />} />
          <Route path="/director-panel" element={<DirectorPanel />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users-list" element={<UsersList />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment-list" element={<AssessmentList />} />
          <Route path="/control" element={<Control />} />
          <Route path="/students-list" element={<StudentsList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/follow-up" element={<FollowUp />} />
          <Route path="/employment-placement" element={<EmploymentPlacement />} />
          <Route path="/employment-placement-list" element={<EmploymentPlacementList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
