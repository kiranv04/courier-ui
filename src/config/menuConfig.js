import { Home, Building2, Car, Users, FileText, Settings, Calendar, DollarSign, Wrench, Truck, Warehouse } from "lucide-react";

export const menuConfig = {
  "super-admin": [
    { to: "/superadmin/dashboard", label: "Dashboard", icon: Home },
    {
      label: "Branches", 
      icon: Building2, 
      children: [
        { to: "/superadmin/branches", label: "Branch Management" },
        { to: "/superadmin/branch-users", label: "Branch Users" },
      ]
    },
    {
      label: "Warehouses", 
      icon: Warehouse, 
      children: [
        { to: "/superadmin/warehouses", label: "Warehouse Management" },
        { to: "/superadmin/warehouse-users", label: "Warehouse Users" },
      ]
    },
    // { 
    //   label: "Vendors", 
    //   icon: Truck, 
    //   children: [
    //     { to: "/superadmin/vendors", label: "Vendor Management" },
    //     { to: "/superadmin/vendor-user", label: "Vendor Users" },
    //   ]
    // },
    // { to: "/superadmin/drivers", label: "Drivers", icon: Car },
    // { to: "/superadmin/employees", label: "Employees", icon: Users },
    // { to: "/superadmin/bookings", label: "Bookings", icon: Calendar },
    { to: "/superadmin/billing", label: "Billing", icon: DollarSign },
    { to: "/superadmin/reports", label: "Reports", icon: FileText },
    {
      label: "Masters",
      icon: Wrench,
      children: [
        // { to: "/superadmin/vehicle-types", label: "Vehicle Types" },
        // { to: "/superadmin/vehicle-categories", label: "Vehicle Categories" },
        { to: "/superadmin/locations", label: "Locations" },
        // { to: "/superadmin/rate-cards", label: "Rate Cards" },
        // { to: "/superadmin/cost-centers", label: "Cost Centers" },
      ]
    },
    // { to: "/superadmin/settings", label: "Settings", icon: Settings },
  ],

  "cost-center": [
    { to: "/costcenter/dashboard", label: "Dashboard", icon: Home },
    { to: "/costcenter/bookings", label: "My Bookings", icon: Calendar },
    { to: "/costcenter/employees", label: "Employees", icon: Users },
    { to: "/costcenter/reports", label: "Reports", icon: FileText },
  ],

  "vendor": [
    { to: "/vendor/dashboard", label: "Dashboard", icon: Home },
    { to: "/vendor/bookings", label: "Assigned Trips", icon: Car },
    { to: "/vendor/drivers", label: "My Drivers", icon: Users },
  ]
};