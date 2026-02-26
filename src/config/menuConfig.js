import { Home, Building2, Car, Users, FileText, Settings, Calendar, DollarSign, Wrench, Truck, Warehouse } from "lucide-react";

export const menuConfig = {
  "super-admin": [
    { to: "/superadmin/dashboard", label: "Dashboard", icon: Home },
    {
      label: "Masters",
      icon: Wrench,
      children: [
        { to: "/superadmin/cft", label: "CFTs" },
        // { to: "/superadmin/vehicle-categories", label: "Vehicle Categories" },
        { to: "/superadmin/locations", label: "Locations" },
        // { to: "/superadmin/rate-cards", label: "Rate Cards" },
        // { to: "/superadmin/cost-centers", label: "Cost Centers" },
      ]
    },
    {
      label: "Branches", 
      icon: Building2, 
      children: [
        { to: "/superadmin/branches", label: "Branch Management" },
        { to: "/superadmin/branch-users", label: "Branch Users" },
      ]
    },
    {
      label: "Transit Hubs", 
      icon: Warehouse, 
      children: [
        { to: "/superadmin/transithub", label: "Transit Hub Management" },
        { to: "/superadmin/transithub-users", label: "Transit Hub Users" },
      ]
    },
    { to: "/superadmin/customers", label: "Customers", icon: Users },
    { to: "/superadmin/shipments", label: "Shipments", icon: Truck },
    { to: "/superadmin/bookings", label: "Bookings", icon: DollarSign },
    { to: "/superadmin/reports", label: "Reports", icon: FileText },
    // { to: "/superadmin/settings", label: "Settings", icon: Settings },
  ],

  "branch-admin": [
    { to: "/branch/dashboard", label: "Dashboard", icon: Home },
    { to: "/branch/bookings", label: "Bookings", icon: Calendar },
    { to: "/branch/shipments", label: "Shipments", icon: Truck },
    { to: "/branch/employees", label: "Employees", icon: Users },
    { to: "/branch/customers", label: "Customers", icon: Users },
    { to: "/branch/reports", label: "Reports", icon: FileText },
  ],

  "branch-employee": [
    { to: "/branch/dashboard", label: "Dashboard", icon: Home },
    { to: "/branch/bookings", label: "Bookings", icon: Calendar },
    { to: "/branch/shipments", label: "Shipments", icon: Truck },
    { to: "/branch/customers", label: "Customers", icon: Users },
    { to: "/branch/reports", label: "Reports", icon: FileText },
  ],

  "warehouse-admin": [
    { to: "/warehouse/dashboard", label: "Dashboard", icon: Home },
    { to: "/warehouse/bookings", label: "Assigned Trips", icon: Car },
  ]
};