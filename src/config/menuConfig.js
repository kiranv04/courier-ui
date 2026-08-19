import { Home, Building2, Car, Users, FileText, Settings, Calendar, DollarSign, Wrench, Truck, Warehouse } from "lucide-react";

export const menuConfig = {
  "super-admin": [
    { to: "/superadmin/dashboard", label: "Dashboard", icon: Home },
    {
      label: "Masters",
      icon: Wrench,
      children: [
        { to: "/superadmin/cft", label: "CFTs" },
        { to: "/superadmin/locations", label: "Locations" },
        { to: "/superadmin/branch-users", label: "Branch Admins" },
        { to: "/superadmin/transithub-users", label: "Transit Hub Admins" },
        // { to: "/superadmin/rate-cards", label: "Rate Cards" },
      ]
    },
    { to: "/superadmin/branches", label: "Branch Management",icon: Building2, },
    { to: "/superadmin/transithub", label: "Transit Hub Management",icon: Warehouse, },
    { to: "/superadmin/customers", label: "Customers", icon: Users },
    { to: "/superadmin/shipments", label: "Shipments", icon: Truck },
    { to: "/superadmin/bookings", label: "Bookings", icon: DollarSign },
    { to: "/superadmin/manifests", label: "Manifests", icon: FileText },
    { label: "Invoices", icon: FileText, 
      children: [
        { to: "/superadmin/cash-invoices", label: "Cash Invoices" },
        { to: "/superadmin/corporate-invoices", label: "Corporate Invoices" },
      ]
    },
    { to: "/superadmin/reports", label: "Reports", icon: FileText },
    { to: "/superadmin/settings", label: "Settings", icon: Settings },
  ],

  "branch-admin": [
    { to: "/branch/dashboard", label: "Dashboard", icon: Home },
    { to: "/branch/bookings", label: "Bookings", icon: Calendar },
    { to: "/branch/shipments", label: "Shipments", icon: Truck },
    { to: "/branch/manifests", label: "Manifests", icon: FileText },
    { to: "/branch/employees", label: "Employees", icon: Users },
    { to: "/branch/customers", label: "Customers", icon: Users },
    { label: "Invoices", icon: FileText, 
      children: [
        { to: "/branch/cash-invoices", label: "Cash Invoices" },
        { to: "/branch/corporate-invoices", label: "Corporate Invoices" },
      ]
    },
    { to: "/branch/reports", label: "Reports", icon: FileText },
  ],

  "branch-employee": [
    { to: "/branch/dashboard", label: "Dashboard", icon: Home },
    { to: "/branch/bookings", label: "Bookings", icon: Calendar },
    { to: "/branch/shipments", label: "Shipments", icon: Truck },
    { to: "/branch/manifests", label: "Manifests", icon: FileText },
    { to: "/branch/customers", label: "Customers", icon: Users },
    { to: "/branch/reports", label: "Reports", icon: FileText },
  ],

  "branch-delivery": [
    { to: "/delivery/dashboard", label: "Dashboard", icon: Home },
    // { to: "/delivery/shipments", label: "Shipments", icon: Truck },
    // { to: "/delivery/manifests", label: "Manifests", icon: FileText },
  ],

  "warehouse-admin": [
    { to: "/warehouse/dashboard", label: "Dashboard", icon: Home },
    { to: "/warehouse/manifests", label: "Manifests", icon: Car },
  ],
  "warehouse-employee": [
    { to: "/warehouse/dashboard", label: "Dashboard", icon: Home },
    { to: "/warehouse/manifests", label: "Manifests", icon: Car },
  ]
};