import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
  Camera,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";

const ConfirmModal = ({ isOpen, onClose, title, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-xl font-semibold mb-6">{title}</h3>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-linear-to-r from-red-700 to-red-400 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Customer Modal
const CustomerModal = ({ isOpen, onClose, customer = null }) => {
  const isEdit = !!customer;

  // Form state
  const [type, setType] = useState("Individual");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [customerType, setCustomerType] = useState("cash");

  // File previews
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [gstPreview, setGstPreview] = useState(null);

  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);

  // Billing address
  const [billName, setBillName] = useState("");
  const [billCompany, setBillCompany] = useState("");
  const [billLine1, setBillLine1] = useState("");
  const [billLine2, setBillLine2] = useState("");
  // const [billLine3, setBillLine3] = useState("");
  const [billCity, setBillCity] = useState("");
  const [billPincode, setBillPincode] = useState("");
  const [billPhone, setBillPhone] = useState("");
  const [billEmail, setBillEmail] = useState("");
  const [billState, setBillState] = useState("");
  const [billGst, setBillGst] = useState("");

  // Shipping
  const [sameAddress, setSameAddress] = useState(true);
  const [shipName, setShipName] = useState("");
  const [shipCompany, setShipCompany] = useState("");
  const [shipLine1, setShipLine1] = useState("");
  const [shipLine2, setShipLine2] = useState("");
  // const [shipLine3, setShipLine3] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipPincode, setShipPincode] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipEmail, setShipEmail] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipGst, setShipGst] = useState("");

  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (customer) {
      setType(customer.type || "individual");
      setCustomerType(customer.customer_type || "cash");

      // Billing / main fields (adjust field names to match your backend response)
      setName(customer.name || "");
      setCompanyName(customer.company_name || "");
      setAadhaarNumber(customer.aadhar_number || "");
      setPanNumber(customer.pan_number || "");
      setGstNumber(customer.gst_number || "");

      // Billing address (adjust keys to match your API response structure)
      setBillName(customer.billing_name || "");
      setBillCompany(customer.billing_company_name || "");
      setBillLine1(customer.billing_address_line1 || "");
      setBillLine2(customer.billing_address_line2 || "");
      setBillCity(customer.billing_city || "");
      setBillPincode(customer.billing_pincode || "");
      setBillPhone(customer.billing_phone || "");
      setBillEmail(customer.billing_email || "");
      setBillState(customer.billing_state_id || "");
      setBillGst(customer.billing_gst_number || "");

      // Shipping (only if different)
      if (customer.same_address === 0) {
        setSameAddress(false);
        setShipName(customer.shipping_name || "");
        setShipCompany(customer.shipping_company_name || "");
        setShipLine1(customer.shipping_address_line1 || "");
        setShipLine2(customer.shipping_address_line2 || "");
        setShipCity(customer.shipping_city || "");
        setShipPincode(customer.shipping_pincode || "");
        setShipPhone(customer.shipping_phone || "");
        setShipEmail(customer.shipping_email || "");
        setShipState(customer.shipping_state_id || "");
        setShipGst(customer.shipping_gst_number || "");
      } else {
        setSameAddress(true);
        // Optional: clear shipping fields when same address
        setShipName("");
        setShipCompany("");
        setShipLine1("");
        setShipLine2("");
        setShipCity("");
        setShipPincode("");
        setShipPhone("");
        setShipEmail("");
        setShipState("");
        setShipGst("");
      }

      // Note: Files & previews are NOT pre-filled (can't load existing files client-side)
      // You'll need backend to return photo URLs if you want to show existing images
      setAadhaarPreview(null);
      setPanPreview(null);
      setGstPreview(null);
      setAadhaarFile(null);
      setPanFile(null);
      setGstFile(null);
    } else {
      // Add mode: reset everything to defaults
      setType("Individual");
      setCustomerType("cash");
      setName("");
      setCompanyName("");
      setAadhaarNumber("");
      setPanNumber("");
      setGstNumber("");
      setBillName("");
      setBillCompany("");
      setBillLine1("");
      setBillLine2("");
      setBillCity("");
      setBillPincode("");
      setBillPhone("");
      setBillEmail("");
      setBillState("");
      setBillGst("");
      setSameAddress(true);
      setShipName("");
      setShipCompany("");
      setShipLine1("");
      setShipLine2("");
      setShipCity("");
      setShipPincode("");
      setShipPhone("");
      setShipEmail("");
      setShipState("");
      setShipGst("");
      setAadhaarPreview(null);
      setPanPreview(null);
      setGstPreview(null);
      setAadhaarFile(null);
      setPanFile(null);
      setGstFile(null);
    }
  }, [customer]);

  // Hard-coded states for dropdown (mock)
  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: () => api.get("/api/states").then((res) => res.data.data || res.data || []),
    staleTime: Infinity,
  });

  const handleFileChange = (e, previewSetter, fileSetter) => {
    const file = e.target.files[0];
    if (file) {
      previewSetter(URL.createObjectURL(file));
      fileSetter(file);
    }
  };

  const clearPreview = (previewSetter, fileSetter) => {
    previewSetter(null);
    fileSetter(null);
  };

  const mutation = useMutation({
    mutationFn: (formData) => {
      if (isEdit) {
        return api.put(`/api/customers/${customer.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        return api.post("/api/customers", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]); // future-proof for real list
      toast.success(isEdit ? "Customer updated!" : "Customer created!");
      onClose();
    },
    onError: () => toast.error("Something went wrong"),
  });

  const checkRequiredFields = () => {
    if (type === "individual") {
      if (!billName.trim()) throw new Error("Billing name is required");
      if (!aadhaarNumber.trim()) throw new Error("Aadhaar number is required");
    } else {
      if (!billName.trim()) throw new Error("Billing name is required");
      if (!billCompany.trim()) throw new Error("Company name is required");
      if (!panNumber.trim()) throw new Error("PAN number is required");
    }
  };

  const handleSave = () => {
    checkRequiredFields();
    const formData = new FormData();
      formData.append("type", type);
      formData.append("customer_type", customerType); // cash / corporate / RCMF
      formData.append("name", billName.trim());
      formData.append("company_name", billCompany.trim());
      formData.append("aadhar_number", aadhaarNumber.trim());
      formData.append("pan_number", panNumber.trim().toUpperCase());
      formData.append("gst_number", gstNumber.trim().toUpperCase());
      formData.append("contact_person", billName.trim());
      formData.append("contact_phone", billPhone.trim());

      // Billing address
      formData.append("billing_name", billName.trim());
      formData.append("billing_company_name", billCompany.trim());
      formData.append("billing_address_line1", billLine1.trim());
      formData.append("billing_address_line2", billLine2.trim());
      formData.append("billing_city", billCity.trim());
      formData.append("billing_pincode", billPincode.trim());
      formData.append("billing_phone", billPhone.trim());
      formData.append("billing_email", billEmail.trim());
      formData.append("billing_state_id", billState);
      formData.append("billing_gst_number", billGst.trim());

      // Shipping address (only if different)
      if (!sameAddress) {
        formData.append("same_address", 0);
        formData.append("shipping_name", shipName.trim());
        formData.append("shipping_company_name", shipCompany.trim());
        formData.append("shipping_address_line1", shipLine1.trim());
        formData.append("shipping_address_line2", shipLine2.trim());
        formData.append("shipping_city", shipCity.trim());
        formData.append("shipping_pincode", shipPincode.trim());
        formData.append("shipping_phone", shipPhone.trim());
        formData.append("shipping_email", shipEmail.trim());
        formData.append("shipping_state_id", shipState);
        formData.append("shipping_gst_number", shipGst.trim());
      } else{
        formData.append("same_address", 1);
      }

      // Append actual files (conditionally)
      if (aadhaarFile && type === "Individual") {
        formData.append("aadhar_image_path", aadhaarFile);
      }
      if (panFile) {
        formData.append("pan_image_path", panFile);
      }
      if (gstFile && type === "Company") {
        formData.append("gst_image_path", gstFile);
      }

    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto pt-8 pb-16">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          {isEdit ? "Edit Customer" : "Add New Customer"}
        </h2>

        {/* Customer Type */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="customerType"
                checked={customerType === "cash"}
                onChange={() => setCustomerType("cash")}
                className="w-5 h-5 accent-blue-600"
              />
              Cash
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="customerType"
                checked={customerType === "corporate"}
                onChange={() => setCustomerType("corporate")}
                className="w-5 h-5 accent-blue-600"
              />
              RCMF
            </label>
          </div>
          <div className="flex gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={type === "individual"}
                onChange={() => setType("individual")}
                className="w-5 h-5 accent-blue-600"
              />
              Individual
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={type === "company"}
                onChange={() => setType("company")}
                className="w-5 h-5 accent-blue-600"
              />
              Company
            </label>
          </div>
        </div>

        {/* KYC Details */}
        <div className="mb-10 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-teal-700">KYC Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aadhaar - only Individual */}
            {type === "individual" && (
              <div>
                <label className="block text-sm font-medium mb-2">Aadhaar number <span className="text-red-700">*</span></label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength={12}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">Aadhaar Photo <span className="text-red-700">*</span></label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg flex items-center gap-2">
                      <Camera size={20} />
                      Upload / Capture
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setAadhaarPreview, setAadhaarFile)}
                      />
                    </label>
                    {aadhaarPreview && (
                      <div className="relative">
                        <img
                          src={aadhaarPreview}
                          alt="Aadhaar preview"
                          className="h-24 w-auto object-cover rounded border"
                        />
                        <button
                          onClick={() => clearPreview(setAadhaarPreview, setAadhaarFile)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PAN - always */}
            <div>
              <label className="block text-sm font-medium mb-2">PAN number <span className="text-red-700">*</span></label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="Enter 10-digit PAN (ABCDE1234F)"
                maxLength={10}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
              />
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">PAN Photo <span className="text-red-700">*</span></label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Camera size={20} />
                    Upload / Capture
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, setPanPreview, setPanFile)}
                    />
                  </label>
                  {panPreview && (
                    <div className="relative">
                      <img
                        src={panPreview}
                        alt="PAN preview"
                        className="h-24 w-auto object-cover rounded border"
                      />
                      <button
                        onClick={() => clearPreview(setPanPreview, setPanFile)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GST - only Company */}
            {type === "company" && (
              <div>
                <label className="block text-sm font-medium mb-2">GST number <span className="text-red-700">*</span></label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="Enter 15-digit GSTIN"
                  maxLength={15}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                />
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">GST Photo <span className="text-red-700">*</span></label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg flex items-center gap-2">
                      <Camera size={20} />
                      Upload / Capture
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setGstPreview, setGstFile)}
                      />
                    </label>
                    {gstPreview && (
                      <div className="relative">
                        <img
                          src={gstPreview}
                          alt="GST preview"
                          className="h-24 w-auto object-cover rounded border"
                        />
                        <button
                          onClick={() => clearPreview(setGstPreview, setGstFile)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Billing Address */}
        <div className="mb-10 border-t pt-6">
          <h3 className="text-xl font-semibold mb-6 text-teal-700">Billing Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              type="text"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              placeholder="Name"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={billCompany}
              onChange={(e) => setBillCompany(e.target.value)}
              placeholder="Company Name"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={billLine1}
              onChange={(e) => setBillLine1(e.target.value)}
              placeholder="Address line 1"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
            />
            <input
              type="text"
              value={billLine2}
              onChange={(e) => setBillLine2(e.target.value)}
              placeholder="Address line 2"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={billCity}
              onChange={(e) => setBillCity(e.target.value)}
              placeholder="City"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={billPincode}
              onChange={(e) => setBillPincode(e.target.value)}
              placeholder="Pincode"
              maxLength={6}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <input
              type="tel"
              value={billPhone}
              onChange={(e) => setBillPhone(e.target.value)}
              placeholder="Phone Number"
              maxLength={10}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              value={billEmail}
              onChange={(e) => setBillEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={billState}
              onChange={(e) => setBillState(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">State</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {type === "Individual" && (
              <input
                type="text"
                value={billGst}
                onChange={(e) => setBillGst(e.target.value)}
                placeholder="GST Number"
                maxLength={15}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        {/* Shipping Address Checkbox */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!sameAddress}
              onChange={(e) => setSameAddress(!e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
            Is Shipping Address Different from Billing Address
          </label>
        </div>

        {/* Shipping Address - conditional */}
        {!sameAddress && (
          <div className="mb-10 border-t pt-6">
            <h3 className="text-xl font-semibold mb-6 text-teal-700">Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="text"
                value={shipName}
                onChange={(e) => setShipName(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={shipCompany}
                onChange={(e) => setShipCompany(e.target.value)}
                placeholder="Company Name"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={shipLine1}
                onChange={(e) => setShipLine1(e.target.value)}
                placeholder="Address line 1"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              />
              <input
                type="text"
                value={shipLine2}
                onChange={(e) => setShipLine2(e.target.value)}
                placeholder="Address line 2"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={shipCity}
                onChange={(e) => setShipCity(e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={shipPincode}
                onChange={(e) => setShipPincode(e.target.value)}
                placeholder="Pincode"
                maxLength={6}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <input
                type="tel"
                value={shipPhone}
                onChange={(e) => setShipPhone(e.target.value)}
                placeholder="Phone Number"
                maxLength={10}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                value={shipEmail}
                onChange={(e) => setShipEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={shipState}
                onChange={(e) => setShipState(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">State</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {type === "Individual" && (
                <input
                  type="text"
                  value={shipGst}
                  onChange={(e) => setShipGst(e.target.value)}
                  placeholder="GST Number"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}  
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            onClick={handleSave}
            disabled={mutation.isLoading}
            className="flex-1 bg-linear-to-r from-green-800 to-green-400 text-white py-4 rounded-xl hover:opacity-90 transition font-semibold text-lg cursor-pointer"
          >
            UPLOAD & CREATE ACCOUNT
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 py-4 rounded-xl hover:bg-gray-300 transition font-semibold text-lg cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Customers() {
  const [filter, setFilter] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null,
    customer: null,
  });

  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/api/customers").then(res => res.data.data),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch state mapping
  const { data: rawStates = [] } = useQuery({
		queryKey: ["states"],
		queryFn: () => api.get("/api/states").then(res => res.data.data || res.data || []),
		staleTime: Infinity,
	});

	const stateMap = {};
	rawStates.forEach(state => {
		if (state?.id && state?.name) {
			stateMap[state.id] = state.name;
		}
	});

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      toast.success("Customer deleted");
      setConfirmModal({ open: false });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => api.post(`/api/customers/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      toast.success("Customer reactivated");
      setConfirmModal({ open: false });
    },
  });

  const filteredCustomers = customers.filter((cust) => {
    if (filter === "active") return cust.is_active;
    if (filter === "inactive") return !cust.is_active;
    return true;
  });

  const handleAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleEdit = (cust) => {
    setEditingCustomer(cust);
    setModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-2xl shadow-2xl min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <button
          onClick={handleAdd}
          className="bg-linear-to-r from-blue-500 to-teal-300 text-black px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 transition cursor-pointer font-medium"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border text-center py-16">
          <p className="text-gray-600 text-lg font-medium">Nothing to show here</p>
          <p className="text-gray-500 mt-2">
            {filter === "active" && "No active customers found"}
            {filter === "inactive" && "No inactive customers found"}
            {filter === "all" && "No customers found"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full min-w-225">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Customer-ID</th>
                <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                <th className="text-left p-4 font-medium text-gray-700">Type</th>
                {/* <th className="text-left p-4 font-medium text-gray-700">Phone</th> */}
                {/* <th className="text-left p-4 font-medium text-gray-700">City</th> */}
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-right p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{cust.customer_code}</td>
                  <td className="p-4 font-medium">
                    {cust.type === "Company" ? cust.companyName : cust.company_name}
                  </td>
                  <td className="p-4">{cust.customer_type}</td>
                  {/* <td className="p-4">{cust.phone}</td> */}
                  {/* <td className="p-4">{cust.city}</td> */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        cust.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cust.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    {cust.is_active ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingCustomer(cust)
                            setModalOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              action: "deactivate",
                              customer: cust,
                            })
                          }
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          setConfirmModal({
                            open: true,
                            action: "reactivate",
                            customer: cust,
                          })
                        }
                        className="text-green-600 hover:text-green-800 cursor-pointer"
                      >
                        <RefreshCw size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={editingCustomer}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false })}
        title={
          confirmModal.action === "deactivate"
            ? `Deactivate customer?`
            : `Reactivate customer ?`
        }
        onConfirm={() => {
          if (confirmModal.action === "deactivate") {
            deleteMutation.mutate(confirmModal.customer.id);
          } else {
            reactivateMutation.mutate(confirmModal.customer.id);
          }
        }}
        loading={deleteMutation.isPending || reactivateMutation.isPending}
      />
    </div>
  );
}