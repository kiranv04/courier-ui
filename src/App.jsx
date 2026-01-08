import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from './layout/AuthLayout'
import Login from './pages/auth/Login'
import DashboardLayout from './layout/DashboardLayout';
import Dashboard from './pages/superadmin/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/superadmin/dashboard" element={<Dashboard />} />
          {/* <Route path="/superadmin/vehicle-categories" element={<VehicleCategory />} />
          <Route path="/superadmin/vehicle-types" element={<VehicleType />} />
          <Route path="/superadmin/locations" element={<Location />} />
          <Route path="/superadmin/vendors" element={<Vendor />} />
          <Route path="/superadmin/vendor-user" element={<VendorUser />} />
          <Route path="/superadmin/companies" element={<Company />} />
          <Route path="/superadmin/branches" element={<Branch />} /> */}
          {/* <Route path="/superadmin/company-users" element={<VendorUser />} /> */}
        </Route>
      </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
