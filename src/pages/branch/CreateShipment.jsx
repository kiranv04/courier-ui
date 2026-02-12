// src/pages/branch/CreateShipment.jsx
import { useState } from "react";
import { Plus, Camera, Search, Copy, X, Save, FileText, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateShipment() {
  const [boxesCount, setBoxesCount] = useState(1);
  const [invoices, setInvoices] = useState([1]);
  const [parcels, setParcels] = useState([1]);

  // File previews
  const [shipperPreview, setShipperPreview] = useState(null);
  const [consigneePreview, setConsigneePreview] = useState(null);

  const addInvoice = () => setInvoices([...invoices, invoices.length + 1]);
  const addParcel = () => {
    setParcels([...parcels, parcels.length + 1]);
    setBoxesCount(boxesCount + 1);
  };

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) setter(URL.createObjectURL(file));
  };

  const clearPreview = (setter) => setter(null);

  const handleSave = (action) => {
    toast.success(`Mock action: ${action}`);
  };

  const handleClear = () => {
    setBoxesCount(1);
    setInvoices([1]);
    setParcels([1]);
    setShipperPreview(null);
    setConsigneePreview(null);
    toast.success("Form cleared");
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-2xl shadow-2xl max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Create Shipment</h1>
        <div className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-medium text-lg">
          Boxes: {boxesCount}
        </div>
      </div>

      <div className="space-y-8">
        {/* Pickup Address */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">Pickup Address</div>
          <div className="p-6 space-y-5">
            <select className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select Pickup Address</option>
              <option selected>other</option>
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Shipper Name</label>
                <div className="flex gap-3">
                  <input type="text" placeholder="Shipper Name" className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 rounded-lg flex items-center">
                    <Camera size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setShipperPreview)} />
                  </label>
                </div>
                {shipperPreview && (
                  <div className="mt-3 relative inline-block">
                    <img src={shipperPreview} alt="preview" className="h-24 rounded border" />
                    <button onClick={() => clearPreview(setShipperPreview)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input type="text" placeholder="Phone Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <div className="relative">
                  <input type="text" placeholder="Pincode" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                  <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sender GST Number</label>
                <input type="text" placeholder="GST Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <textarea placeholder="Full Address" rows={2} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">Service Details</div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-3">Select Service</label>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="service" defaultChecked className="w-5 h-5 accent-blue-600" />
                  Parcel
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="service" className="w-5 h-5 accent-blue-600" />
                  Document
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Customer Reference</label>
                <div className="relative">
                  <input type="text" placeholder="Customer Reference" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                  <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Parcel Content</label>
                <input type="text" defaultValue="MISCELLANEOUS ITEM" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-2">Tracking Number</label>
              <div className="relative">
                <input type="text" placeholder="Tracking Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                <Copy className="absolute right-3 top-3.5 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Mode</label>
              <select className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Normal</option>
                <option>To Pay</option>
                <option>Prepaid</option>
                <option>COD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices */}
        {invoices.map((num) => (
          <div key={num} className="border rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold flex justify-between items-center">
              Invoice #{num}
              {num === invoices.length && (
                <button onClick={addInvoice} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                  <Plus size={20} />
                </button>
              )}
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Invoice Number</label>
                <div className="relative">
                  <input type="text" placeholder="Invoice Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                  <Copy className="absolute right-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Invoice Amount</label>
                <input type="text" placeholder="₹ 0.00" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2 relative">
                <label className="block text-sm font-medium mb-2">EwayBill Number</label>
                <div className="relative">
                  <input type="text" placeholder="EwayBill Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                  <Copy className="absolute right-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Parcel Dimensions */}
        {parcels.map((num) => (
          <div key={num} className="border rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold flex justify-between items-center">
              Parcel Dimensions #{num}
              {num === parcels.length && (
                <button onClick={addParcel} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                  <Plus size={20} />
                </button>
              )}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Length (cm)" className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Width (cm)" className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Height (cm)" className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Weight (kg)" className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        ))}

        {/* Delivery Address */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">Delivery Address</div>
          <div className="p-6 space-y-5">
            <select className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select Delivery Address</option>
              <option selected>other</option>
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Consignee Name</label>
                <div className="flex gap-3">
                  <input type="text" placeholder="Shipper Name" className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 rounded-lg flex items-center">
                    <Camera size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setShipperPreview)} />
                  </label>
                </div>
                {shipperPreview && (
                  <div className="mt-3 relative inline-block">
                    <img src={shipperPreview} alt="preview" className="h-24 rounded border" />
                    <button onClick={() => clearPreview(setShipperPreview)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input type="text" placeholder="Phone Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <div className="relative">
                  <input type="text" placeholder="Pincode" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                  <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Receiver GST Number</label>
                <input type="text" placeholder="GST Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <textarea placeholder="Full Address" rows={2} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            

            
          </div>
        </div>

        {/* Special Instruction */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">Special Instruction</div>
          <div className="p-6">
            <textarea placeholder="Enter any special instructions..." rows={3} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex flex-wrap gap-4 mt-10">
        <button onClick={() => handleSave("Saved")} className="flex-1 min-w-[140px] bg-gradient-to-r from-blue-500 to-teal-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition">
          <Save size={20} />
          Save
        </button>
        <button onClick={() => handleSave("Saved & Booked")} className="flex-1 min-w-[140px] bg-gradient-to-r from-orange-500 to-amber-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition">
          <FileText size={20} />
          Save and Book
        </button>
        <button onClick={handleClear} className="flex-1 min-w-[140px] bg-gray-300 hover:bg-gray-400 text-gray-800 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition">
          <RotateCcw size={20} />
          Clear
        </button>
      </div>
    </div>
  );
}