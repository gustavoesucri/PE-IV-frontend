// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Administration from './pages/Administration/Administration';
import Students from './pages/Students/Students';
import Companies from './pages/Companies/Companies';
import Assessment from './pages/Assessment/Assessment';
import './App.css';
import Users from './pages/DirectorPanel/Users/Users';
import UsersList from './pages/DirectorPanel/Users/UsersList/UsersList';
import Settings from './pages/Settings/Settings';
import Control from './pages/Control/Control';
import FollowUp from './pages/FollowUp/FollowUp';
import EmploymentPlacement from './pages/EmploymentPlacement/EmploymentPlacement';
import EmploymentPlacementList from './pages/EmploymentPlacement/EmploymentPlacementList/EmploymentPlacementList';
import StudentsList from './pages/Students/StudentsList/StudentsList';
import CompaniesList from './pages/Companies/CompaniesList/CompaniesList';
import AssessmentList from './pages/Assessment/AssessmentList/Assessment-list';
import DirectorPanel from './pages/DirectorPanel/DirectorPanel';

// Componente para rotas que requerem autenticação
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Componente para rotas que requerem role de diretor
const RequireDirector = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== 'diretor') {
    return <Navigate to="/administration" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Rota pública */}
          <Route path="/" element={<Login />} />
          
          {/* Rotas protegidas (qualquer usuário logado) */}
          <Route path="/administration" element={
            <RequireAuth>
              <Administration />
            </RequireAuth>
          } />
          
          <Route path="/students" element={
            <RequireAuth>
              <Students />
            </RequireAuth>
          } />
          
          <Route path="/companies" element={
            <RequireAuth>
              <Companies />
            </RequireAuth>
          } />
          
          <Route path="/companies-list" element={
            <RequireAuth>
              <CompaniesList />
            </RequireAuth>
          } />
          
          <Route path="/assessment" element={
            <RequireAuth>
              <Assessment />
            </RequireAuth>
          } />
          
          <Route path="/assessment-list" element={
            <RequireAuth>
              <AssessmentList />
            </RequireAuth>
          } />
          
          <Route path="/control" element={
            <RequireAuth>
              <Control />
            </RequireAuth>
          } />
          
          <Route path="/students-list" element={
            <RequireAuth>
              <StudentsList />
            </RequireAuth>
          } />
          
          <Route path="/settings" element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          } />
          
          <Route path="/follow-up" element={
            <RequireAuth>
              <FollowUp />
            </RequireAuth>
          } />
          
          <Route path="/employment-placement" element={
            <RequireAuth>
              <EmploymentPlacement />
            </RequireAuth>
          } />
          
          <Route path="/employment-placement-list" element={
            <RequireAuth>
              <EmploymentPlacementList />
            </RequireAuth>
          } />
          
          {/* Rotas apenas para diretor */}
          <Route path="/director-panel" element={
            <RequireDirector>
              <DirectorPanel />
            </RequireDirector>
          } />
          
          <Route path="/users" element={
            <RequireDirector>
              <Users />
            </RequireDirector>
          } />
          
          <Route path="/users-list" element={
            <RequireDirector>
              <UsersList />
            </RequireDirector>
          } />
          
          {/* Rota fallback */}
          <Route path="*" element={<Navigate to="/administration" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;