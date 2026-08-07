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
import Customers from './pages/shared/Customer';
import { useAuth } from './hooks/useAuth';
import CreateShipment from './pages/shared/CreateShipment';
import { Loader2 } from 'lucide-react';
import Cft from './pages/superadmin/Cft';
import WarehouseEmployee from './pages/warehouse/WarehouseEmployee';
import BranchBookings from './pages/branch/BranchBookings';
import AdminBookings from './pages/superadmin/AdminBookings';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLE_HOME } from './config/roleConfig';
import ShipmentView from './pages/shared/ShipmentView';
import Manifests from './pages/shared/Manifests';
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard';
import DeliveryDashboard from './pages/delivery/Dashboard';
import CashInvoice from './pages/superadmin/CashInvoice';
import BranchCashInvoice from './pages/branch/BranchCashInvoice';
import CorporateInvoice from './pages/superadmin/CorporateInvoice';
import CreateCorporateInvoice from './pages/superadmin/CreateCorporateInvoice';
import AdminReports from './pages/superadmin/AdminReports';
import ShipmentReport from './pages/shared/ShipmentReport';
import InvoiceReport from './pages/shared/InvoiceReport';

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
          element={user ? <Navigate to={ROLE_HOME[user.roles?.[0]?.name] || "/login"} replace /> : <Login />} 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Super-admin/Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["super-admin", "admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/superadmin/dashboard" element={<Dashboard />} />
          
          <Route path="/superadmin/locations" element={<Location />} />
          <Route path="/superadmin/cft" element={<Cft />} />

          <Route path="/superadmin/branches" element={<Branch />} />
          <Route path="/superadmin/branch-users" element={<BranchUser />} />

          <Route path="/superadmin/customers" element={<Customers /> } />

          <Route path="/superadmin/transithub" element={<Warehouse /> } />
          <Route path="/superadmin/transithub-users" element={<WarehouseUser />} />
          
          <Route path="/superadmin/bookings" element={<AdminBookings />} />

          <Route path="/superadmin/shipments" element={<CreateShipment />} />
          <Route path="/superadmin/shipments/:id" element={<ShipmentView />} />
          <Route path="/superadmin/shipments/:id/edit" element={<CreateShipment />} />

          <Route path="/superadmin/cash-invoices" element={<CashInvoice />} />
          <Route path="/superadmin/corporate-invoices" element={<CorporateInvoice />} />
          <Route path="/superadmin/corporate-invoices/create" element={<CreateCorporateInvoice />} />

          <Route path="/superadmin/manifests" element={<Manifests />} />

          <Route path="/superadmin/reports" element={<AdminReports />} />
          <Route path="/superadmin/reports/shipments" element={<ShipmentReport />} />
          <Route path="/superadmin/reports/invoice" element={<InvoiceReport />} />
        </Route>
      </Route>

      {/* Branch routes */}
      <Route element={<ProtectedRoute allowedRoles={["branch-admin", "branch-employee", "branch-delivery"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/branch/dashboard" element={<BranchDashboard />} />

          <Route path="/branch/employees" element={<BranchEmployee />} />

          <Route path="/branch/bookings" element={<BranchBookings /> } />

          <Route path="/branch/customers" element={<Customers /> } />

          <Route path="/branch/shipments" element={<CreateShipment />} />
          <Route path="/branch/shipments/:id" element={<ShipmentView />} />
          <Route path="/branch/shipments/:id/edit" element={<CreateShipment />} />

          <Route path="/branch/cash-invoices" element={<BranchCashInvoice />} />

          <Route path="/branch/manifests" element={<Manifests />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["warehouse-admin", "warehouse-employee"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/warehouse/dashboard" element={<WarehouseDashboard />} />
          <Route path="/warehouse/employees" element={<WarehouseEmployee />} />
          <Route path="/warehouse/bookings" element={<BranchBookings /> } />
          <Route path="/warehouse/manifests" element={<Manifests />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["branch-delivery"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          {/* <Route path="/delivery/shipments" element={<CreateShipment />} />
          <Route path="/delivery/shipments/:id" element={<ShipmentView />} />
          <Route path="/delivery/shipments/:id/edit" element={<CreateShipment />} />
          <Route path="/delivery/manifests" element={<Manifests />} /> */}
        </Route>
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