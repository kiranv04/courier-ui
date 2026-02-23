import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from './layout/AuthLayout'
import Login from './pages/auth/Login'
import DashboardLayout from './layout/DashboardLayout';
import Dashboard from './pages/superadmin/Dashboard';
import Location from './pages/superadmin/Location';
import Branch from './pages/superadmin/Branch';
import BranchUser from './pages/superadmin/BranchUser';
import ResetPassword from './pages/auth/ResetPassword';
import Warehouse from './pages/superadmin/Warehouse';
import WarehouseUser from './pages/superadmin/WarehouseUser';
import BranchDashboard from './pages/branch/BranchDashboard';
import BranchEmployee from './pages/branch/BranchEmployee';
import Customers from './pages/superadmin/Customer';
import { useAuth } from './hooks/useAuth';
import CreateShipment from './pages/branch/CreateShipment';
import { Loader2 } from 'lucide-react';
import Cft from './pages/superadmin/Cft';
import WarehouseEmployee from './pages/warehouse/WarehouseEmployee';

const queryClient = new QueryClient();

function AppRoutes() {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-600">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/superadmin/dashboard" replace /> : <Login />} 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/superadmin/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/superadmin/cft" element={user ? <Cft /> : <Navigate to="/login" replace />} />
        <Route path="/superadmin/locations" element={user ? <Location /> : <Navigate to="/login" replace />} />
        <Route path="/superadmin/branches" element={user ? <Branch /> : <Navigate to="/login" replace />} />
        <Route path="/superadmin/branch-users" element={user ? <BranchUser /> : <Navigate to="/login" replace />} />
        <Route path="/superadmin/transithub" element={user ? <Warehouse /> : <Navigate to="/login" replace />} />
        <Route path="/superadmin/transithub-users" element={user ? <WarehouseUser /> : <Navigate to="/login" replace />} />
        <Route path="/branch/dashboard" element={user ? <BranchDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/branch/employees" element={user ? <BranchEmployee /> : <Navigate to="/login" replace />} />
        <Route path="/branch/customers" element={user ? <Customers /> : <Navigate to="/login" replace />} />
        <Route path="/branch/shipments" element={user ? <CreateShipment /> : <Navigate to="/login" replace />} />
        <Route path="/superadmin/shipments" element={user ? <CreateShipment /> : <Navigate to="/login" replace />} />
        <Route path="/warehouse/employees" element={user ? <WarehouseEmployee /> : <Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
  
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
