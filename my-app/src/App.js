import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import Login from './pages/Login';
import LeaderPage from './pages/LeaderPage';
import ProtectedRoute from './components/ProtectedRoute';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import RequestOt from './pages/ListRequestOT';
import UserRequestOT from './pages/UserRequestOT';
import FormerEmployee from './pages/FormerEmployee';
import OTManagemetSystem from './pages/OvertimeManagementSystem'
import Admin from './pages/Admin'
import Managementleader from './pages/ManagementLeader'
import Logmanagement from './pages/LogManagement'
import UserNoLog from './pages/UserNoLog'
import ListRequestOTAdmin from './pages/ListRequestOTAdmin'

function App() {
    return (
        <AuthProvider>
            <Router>
                
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin/management-user" element={<Admin />} />
                        <Route path="/admin/management-leader" element={<Managementleader />} />
                        <Route path="/admin/list-log" element={<Logmanagement />} />
                        <Route path="/admin/list-former-user" element={<UserNoLog />} />
                        <Route path="/admin/list-OT" element={<ListRequestOTAdmin />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['leader']} />}>
                        <Route path="/leader/:sub" element={<LeaderPage />} />
                        <Route path="/list-OT/:sub" element={<RequestOt />} />  
                        <Route path="/former-employee/:sub" element={<FormerEmployee />} />
                        <Route path="/ot-managemet-system/:sub" element={<OTManagemetSystem />} />
                    </Route>
                    <Route path="/user-request" element={<UserRequestOT />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

