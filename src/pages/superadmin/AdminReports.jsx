import { Car, DollarSign, Notebook, Truck } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export default function AdminReports() {
  const navigate = useNavigate();
  const reportLinks = [
    { to: "/superadmin/reports/shipments", label: "Shipment Report", icon: Truck },
    { to: "/superadmin/reports/invoice", label: "Invoice Report", icon: Notebook },
    // { to: "/superadmin/reports/income", label: "Income Report", icon: DollarSign },
    // { to: "/superadmin/reports/vendor", label: "Vendor Report", icon: Truck },
  ];

  return(
      <div className="p-8 bg-white rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 mt-1 text-sm">View all of your business reports here!</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-4 mb-4">
            {reportLinks.map((link) => (
              <div key={link} className="pl-3 rounded-xl flex items-center gap-3 text-indigo-800 hover:text-black hover:bg-indigo-200 hover:font-medium">
                {link.icon && <link.icon size={20} />}
                <Link
                  to={link.to || "#"}
                  className="p-2 w-full "
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}