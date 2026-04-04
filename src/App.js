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
import { usePermissions } from './hooks/usePermissions';
import { ServerStatusProvider } from './hooks/useServerStatus';

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

// Componente para rotas que requerem permissão específica
const RequirePermission = ({ permission, children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const { hasPermission, loading } = usePermissions();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Diretor tem acesso total
  if (user.role === 'diretor') {
    return children;
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando permissões...</div>;
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/administration" replace />;
  }

  return children;
};

function App() {
  return (
    <ServerStatusProvider>
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
            <RequirePermission permission="view_students">
              <Students />
            </RequirePermission>
          } />
          
          <Route path="/companies" element={
            <RequirePermission permission="view_companies">
              <Companies />
            </RequirePermission>
          } />
          
          <Route path="/companies-list" element={
            <RequirePermission permission="view_companies">
              <CompaniesList />
            </RequirePermission>
          } />
          
          <Route path="/assessment" element={
            <RequirePermission permission="view_assessments">
              <Assessment />
            </RequirePermission>
          } />
          
          <Route path="/assessment-list" element={
            <RequirePermission permission="view_assessments">
              <AssessmentList />
            </RequirePermission>
          } />
          
          <Route path="/control" element={
            <RequirePermission permission="view_control">
              <Control />
            </RequirePermission>
          } />
          
          <Route path="/students-list" element={
            <RequirePermission permission="view_students">
              <StudentsList />
            </RequirePermission>
          } />
          
          <Route path="/settings" element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          } />
          
          <Route path="/follow-up" element={
            <RequirePermission permission="view_follow_up">
              <FollowUp />
            </RequirePermission>
          } />
          
          <Route path="/employment-placement" element={
            <RequirePermission permission="view_placements">
              <EmploymentPlacement />
            </RequirePermission>
          } />
          
          <Route path="/employment-placement-list" element={
            <RequirePermission permission="view_placements">
              <EmploymentPlacementList />
            </RequirePermission>
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
    </ServerStatusProvider>
  );
}

export default App;