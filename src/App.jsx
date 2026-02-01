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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          <Route element={<DashboardLayout />}>
            <Route path="/superadmin/dashboard" element={<Dashboard />} />
            <Route path="/superadmin/locations" element={<Location />} />
            <Route path="/superadmin/branches" element={<Branch />} />
            <Route path="/superadmin/branch-users" element={<BranchUser />} />
            <Route path="/superadmin/warehouses" element={<Warehouse />} />
            <Route path="/superadmin/warehouse-users" element={<WarehouseUser />} />
            {/* <Route path="/superadmin/vehicle-categories" element={<VehicleCategory />} />
            <Route path="/superadmin/vehicle-types" element={<VehicleType />} />
            <Route path="/superadmin/vendors" element={<Vendor />} />
            <Route path="/superadmin/vendor-user" element={<VendorUser />} />
            <Route path="/superadmin/companies" element={<Company />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
