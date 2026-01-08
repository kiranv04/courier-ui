// src/pages/superadmin/Dashboard.jsx
import { TrendingUp, Building2, Car, Users, IndianRupee, Calendar } from "lucide-react";

export default function Dashboard() {
  // Static data — replace with useQuery later
  const stats = [
    {
      title: "Total Companies",
      value: "205",
      change: "+12%",
      icon: Building2,
      color: "bg-blue-800",
    },
    {
      title: "Active Bookings",
      value: "89",
      change: "+23%",
      icon: Calendar,
      color: "bg-green-800",
    },
    {
      title: "Total Deliveries",
      value: "317",
      change: "+8%",
      icon: Car,
      color: "bg-purple-800",
    },
    {
      title: "Revenue This Month",
      value: "₹8,72,500",
      change: "+31%",
      icon: IndianRupee,
      color: "bg-orange-800",
    },
  ];

  const recentBookings = [
    { id: "VK-1001", company: "Tata Motors", driver: "Rajesh Kumar", status: "Completed", amount: "₹1,850" },
    { id: "VK-1002", company: "Infosys", driver: "Amit Sharma", status: "In Progress", amount: "₹2,400" },
    { id: "VK-1003", company: "Reliance", driver: "Priya Singh", status: "Scheduled", amount: "₹3,200" },
    { id: "VK-1004", company: "Wipro", driver: "Vikram Patel", status: "Completed", amount: "₹1,600" },
    { id: "VK-1005", company: "HCL Tech", driver: "Neha Gupta", status: "In Progress", amount: "₹2,750" },
  ];

  const activeDrivers = 47;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-3">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
              <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={28} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row: Recent Bookings + Active Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-3 border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto pt-4">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="pb-3 px-6">Booking ID</th>
                  <th className="pb-3 px-6">Company</th>
                  <th className="pb-3 px-6">Delivery Executive</th>
                  <th className="pb-3 px-6">Status</th>
                  <th className="pb-3 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 font-medium">{booking.id}</td>
                    <td className="py-4 px-6">{booking.company}</td>
                    <td className="py-4 px-6">{booking.driver}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${booking.status === "Completed" ? "bg-green-100 text-green-700" :
                          booking.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"}
                      `}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold">{booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Drivers Card */}
        <div className="bg-linear-to-b from-blue-500 to-teal-300 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Active Right Now</p>
              <p className="text-5xl font-bold mt-3">{activeDrivers}</p>
              <p className="text-blue-100 mt-4">Deliveries on the road</p>
            </div>
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <Car size={48} />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">All systems operational</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-3 border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto pt-4">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="pb-3 px-6">Booking ID</th>
                  <th className="pb-3 px-6">Company</th>
                  <th className="pb-3 px-6">Delivery Executive</th>
                  <th className="pb-3 px-6">Status</th>
                  <th className="pb-3 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 font-medium">{booking.id}</td>
                    <td className="py-4 px-6">{booking.company}</td>
                    <td className="py-4 px-6">{booking.driver}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${booking.status === "Completed" ? "bg-green-100 text-green-700" :
                          booking.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"}
                      `}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold">{booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Drivers Card */}
        <div className="bg-linear-to-b from-blue-500 to-teal-300 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Active Right Now</p>
              <p className="text-5xl font-bold mt-3">{activeDrivers}</p>
              <p className="text-blue-100 mt-4">Deliveries on the road</p>
            </div>
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <Car size={48} />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}