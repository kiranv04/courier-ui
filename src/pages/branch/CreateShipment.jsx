import { useEffect, useState } from "react";
import { Plus, X, Save, FileText, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { roundTo2 } from "../../utils/money";
import { set } from "react-hook-form";

const RateModal = ({ open, onClose, payment, boxes, weight, volWeight, serviceType, savedRates, onSave }) => {
  const [cft, setCft] = useState(6);
  const [freight, setFreight] = useState(100);
  const [fuel, setFuel] = useState(0.00);
  const [awbFee, setAwbFee] = useState("");
  const [fov, setFov] = useState(0.00);
  const [insurance, setInsurance] = useState("owner");
  const [fod, setFod] = useState(0.00);
  const [dod, setDod] = useState(0.00);
  const [oda, setOda] = useState(0.00);
  const [handling, setHandling] = useState(0.00);
  const [dcc, setDcc] = useState(0.00);
  const [pickupcharges, setPickupcharges] = useState(0.00);
  const [deliverycharges, setDeliverycharges] = useState(0.00);
  const [chargeableWeight, setChargeableWeight] = useState("0.00");
  const [packageYield, setPackageYield] = useState("");
  const [disVolWeight, setDisVolWeight] = useState("");
  const [carrierInsurance, setCarrierInsurance] = useState(0.00);

  const [fodDisabled, setFodDisabled] = useState(true);
  const [dodDisabled, setDodDisabled] = useState(true);
  const [fovDisabled, setFovDisabled] = useState(true);
  const [cftDisabled, setCftDisabled] = useState(false);

  const [total, setTotal] = useState(0.00);
  const [gst, setGst] = useState(0.00);
  const [grandTotal, setGrandTotal] = useState(0.00);

  useEffect(() => {
    if (open && savedRates) {
      setCft(savedRates.cft);
      setFreight(savedRates.freight);
      setFuel(savedRates.fuel);
      setAwbFee(savedRates.awbFee);
      setFov(savedRates.fov);
      setFod(savedRates.fod);
      setDod(savedRates.dod);
      setOda(savedRates.oda);
      setHandling(savedRates.handling);
      setDcc(savedRates.dcc);
      setPickupcharges(savedRates.pickupcharges);
      setDeliverycharges(savedRates.deliverycharges);
      setInsurance(savedRates.insurance);
    }
  }, [open]);
  
  useEffect(() => {
    let volWeightRaw = 0;
    if(serviceType === 'Apex'){
      volWeightRaw = volWeight;
      setCftDisabled(true);
    } else{
      volWeightRaw = cft * volWeight;
    }
    const calculatedVolWeight = roundTo2(volWeightRaw);
    setDisVolWeight(calculatedVolWeight.toFixed(2));

    const chargableRaw = Math.max(weight, calculatedVolWeight);
    const chargable = roundTo2(chargableRaw);
    setChargeableWeight(chargable.toFixed(2));
    const transportCharge = roundTo2(parseFloat(freight) + parseFloat(fuel));
    const yieldRaw = transportCharge / chargable;
    const yieldValue = roundTo2(yieldRaw);
    setPackageYield(yieldValue.toFixed(2));
  }, [cft, volWeight, freight, weight, fuel]);

  useEffect(() => {
    const charges = [
      freight, fuel, awbFee, fov, fod, dod, oda, handling, dcc, pickupcharges, deliverycharges
    ];

    let baseTotal = 0;
    charges.forEach(val => {
      baseTotal = roundTo2(baseTotal + (parseFloat(val) || 0));
    });

    let ins = 0;
    if (insurance === "carrier") {
      ins = roundTo2(baseTotal * 0.02);
    }
    setCarrierInsurance(ins.toFixed(2));

    const caltotal = roundTo2(baseTotal + ins);
    const gstVal = roundTo2(caltotal * 0.18);
    const grandTotalVal = roundTo2(caltotal + gstVal);

    setTotal(caltotal.toFixed(2));
    setGst(gstVal.toFixed(2));
    setGrandTotal(grandTotalVal.toFixed(2));

  }, [freight, fuel, awbFee, fov, fod, dod, oda, handling, dcc, pickupcharges, deliverycharges, insurance]);

  useEffect(() => {
    if(payment === "Regular"){
      setFodDisabled(true);
      setDodDisabled(true);
    }else if(payment === "FOD"){
      setFodDisabled(false);
      setDodDisabled(true);
    }else if(payment === "DOD"){
      setFodDisabled(true);
      setDodDisabled(false);
    }else{
      setFodDisabled(false);
      setDodDisabled(false);
    }
  },[payment]);

  const handleInsurance = (value) => {
    setInsurance(value);

    if(value === "owner"){
      setFovDisabled(true);
      setFov(0.00);
      setCarrierInsurance(0.00);
    }else{
      setFovDisabled(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto pt-8 pb-16">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-teal-600 to-green-500 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">CHARGES</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-6">
          {/* Rates Section */}
          <div className="bg-amber-200 justify-end px-4 py-1 rounded-full text-sm font-medium relative ">
            <span className="mr-4">Yield: {packageYield}</span>
            <span className="mr-4">Boxes: {boxes}</span>
            <span className="mr-4">Actual Weight: {weight} kg</span>
            <span className="mr-4">Vol Weight: {disVolWeight} kg</span>
            <span className="mr-4">Chargeable Weight: {chargeableWeight} kg</span>
          </div>
          <div className="border rounded-xl overflow-hidden shadow-sm">
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 items-center pb-3">
                <div>
                  <label className="block text-sm font-medium mb-2">CFT</label>
                  <select value={cft} disabled={cftDisabled} onChange={(e) => setCft(e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${cftDisabled ? 'bg-gray-200' : ''}`}>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">FREIGHT</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={freight}
                    onChange={(e) => setFreight(e.target.value)}
                    className="w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">FUEL</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">AWB FEE</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={awbFee}
                    onChange={(e) => setAwbFee(e.target.value)}
                    className="w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">FOV</label>
                  <input
                    type="number"
                    disabled={fovDisabled}
                    value={fov}
                    onChange={(e) => setFov(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium ${fovDisabled ? 'bg-gray-200' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">INSURANCE</label>
                  <select value={insurance} onChange={(e) => handleInsurance(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="owner">Owner's Risk</option>
                    <option value="carrier">Carrier's Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">FOD</label>
                  <input
                    type="number"
                    disabled={fodDisabled}
                    placeholder="0.00"
                    value={fod}
                    onChange={(e) => setFod(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium ${fodDisabled ? 'bg-gray-200' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">DOD</label>
                  <input
                    type="number"
                    disabled={dodDisabled}
                    placeholder="0.00"
                    value={dod}
                    onChange={(e) => setDod(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium ${dodDisabled ? 'bg-gray-200' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ODA Charges</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min={0}
                    value={oda}
                    onChange={(e) => setOda(e.target.value)}
                    className="w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Handling Charges</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={handling}
                    onChange={(e) => setHandling(e.target.value)}
                    className="w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">DCC Charges</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={dcc}
                    onChange={(e) => setDcc(e.target.value)}
                    className="w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pickup Charges</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={pickupcharges}
                    onChange={(e) => setPickupcharges(e.target.value)}
                    className="w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Charges</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={deliverycharges}
                    onChange={(e) => setDeliverycharges(e.target.value)}
                    className="w-full px-4 py-2 border rounded-sm border-black focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="border-2 border-green-500 text-black rounded-xl p-4 grid grid-cols-3 gap-4 text-center font-semibold">
            <div>
              <div>Total :</div>
              <div className="text-lg">{total}</div>
            </div>
            <div>
              <div>GST @18% :</div>
              <div className="text-lg">{gst}</div>
            </div>
            <div>
              <div>Grand Total :</div>
              <div className="text-lg">{grandTotal}</div>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => onSave({
                cft, freight, fuel, awbFee, fov, fod, dod, oda,
                handling, dcc, pickupcharges, deliverycharges,
                insurance, carrierInsurance,
                chargeableWeight, packageYield,
                total, gst, grandTotal
              })} 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
            >
              SAVE
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-400 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CreateShipment() {
  const [boxesCount, setBoxesCount] = useState(1);
  const [weight, setWeight] = useState("");
  const [invoices, setInvoices] = useState([
    { id: 1, invoiceNumber: "", invoiceAmount: 0, ewayBill: "" }
  ]);
  const [parcels, setParcels] = useState([
    { id: 1, numBoxes: 1, length: 0, width: 0, height: 0, weight: 0 }
  ]);
  const [type, setType] = useState("company");
  const [customerType, setCustomerType] = useState("cash");

  const [modalOpen, setModalOpen] = useState(false);

  // Form values
  const [customerId, setCustomerId] = useState('');
  const [shipperName, setShipperName] = useState('');
  const [shipperCompany, setShipperCompany] = useState('');
  const [shipperPhone, setShipperPhone] = useState('');
  const [shipperPincode, setShipperPincode] = useState('');
  const [shipperAddLine1, setShipperAddLine1] = useState('');
  const [shipperAddLine2, setShipperAddLine2] = useState('');
  const [shipperAddCity, setShipperAddCity] = useState('');
  const [shipperState, setShipperState] = useState('');
  const [shipperEmail, setShipperEmail] = useState('');
  const [shipperGst, setShipperGst] = useState('');

  // Document dimensions
  const [docLength, setDocLength] = useState("10");
  const [docWidth, setDocWidth] = useState("10");
  const [docHeight, setDocHeight] = useState("10");
  const [docWeight, setDocWeight] = useState("0.1");

  // For DOD and COD
  const [inFavour, setInFavour] = useState("");
  const [payableAt, setPayableAt] = useState("");
  const [collectableAmount, setCollectableAmount] = useState("");

  const [consigneeName, setConsigneeName] = useState('');
  const [consigneePhone, setConsigneePhone] = useState('');
  const [consigneePincode, setConsigneePincode] = useState('');
  const [consigneeAddLine1, setConsigneeAddLine1] = useState('');
  const [consigneeAddLine2, setConsigneeAddLine2] = useState('');
  const [consigneeAddCity, setConsigneeAddCity] = useState('');
  const [consigneeState, setConsigneeState] = useState('');
  const [consigneeEmail, setConsigneeEmail] = useState('');
  const [consigneeGst, setConsigneeGst] = useState('');
  const [specialInstruction, setSpecialInstruction] = useState("");

  const [serviceType, setServiceType] = useState("");
  const [service, setService] = useState("Parcel");
  const [customerRef, setCustomerRef] = useState("");
  const [parcelContent, setParcelContent] = useState("Electronics");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("Regular");

  const [savedRates, setSavedRates] = useState(null);

  const { data : customers = [] } = useQuery({
    queryKey: ["customers", customerType],
    queryFn: () => api.get(`/api/customers?type=${customerType}`).then(res => res.data.data || res.data || []),
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!customerId) {
      setShipperName("");
      setShipperCompany("");
      setShipperPhone("");
      setShipperAddLine1("");
      setShipperAddLine2("");
      setShipperAddCity("");
      setShipperState("");
      setShipperPincode("");
      setShipperEmail("");
      return;
    }

    const customer = customers.find(c => c.id === Number(customerId));
    if (!customer) return;
    console.log("Selected customer:", customer);

    setShipperName(customer.contact_person || "");
    setShipperCompany(customer.company_name || "");
    setType(customer.type || "");
    setShipperPhone(customer.contact_phone || "");

    const address = customer.addresses?.[0];
      if (address && (address.address_type === "both" || address.address_type === "billing")) {
      setShipperAddLine1(address.address_line1 || "");
      setShipperAddLine2(address.address_line2 || "");
      setShipperAddCity(address.city || "");
      setShipperState(address.state || "");
      setShipperPincode(address.pincode || "");
      setShipperEmail(address.email || "");
    }
  }, [customerId, customers]);

  useEffect(() => {
    if (service === "Parcel") {
      setParcels([
        { id: 1, numBoxes: 1, length: "", width: "", height: "", weight: "" }
      ]);
      setBoxesCount(1);
    }
  }, [service]);

  const totalBoxes = parcels.reduce((sum, p) => sum + (Number(p.numBoxes) || 0), 0);

  const totalWeight = parcels.reduce((sum, p) => {
    const weight = Number(p.weight) || 0;
    const boxes = Number(p.numBoxes) || 0;
    return sum + (weight * boxes);
  }, 0);

  const volWeight = parcels.reduce((sum, p) => {
    const length = Number(p.length) || 0;
    const width = Number(p.width) || 0;
    const height = Number(p.height) || 0;
    const boxes = Number(p.numBoxes) || 0;
    if(serviceType === 'Apex'){
      return sum + ((length * width * height) / 5000) * boxes;
    }else{
      return sum + ((length * width * height) / 27000) * boxes;
    }
  }, 0).toFixed(2);

  const addParcel = () => {
    setParcels([
      ...parcels,
      { id: parcels.length + 1, numBoxes: 1, length: 0, width: 0, height: 0, weight: 0 }
    ]);
  };

  const removeParcel = (idToRemove) => {
    const parcelToRemove = parcels.find(p => p.id === idToRemove);
    if (parcelToRemove) {
      const boxesRemoved = Number(parcelToRemove.numBoxes) || 0;
      setBoxesCount(prev => Math.max(1, prev - boxesRemoved));
    }
    setParcels(parcels.filter(p => p.id !== idToRemove));
  };

  useEffect(() => {
    setBoxesCount(totalBoxes);
    setWeight(totalWeight.toFixed(2));
  }, [parcels]);

  const addInvoice = () => setInvoices([...invoices, { id: invoices.length + 1, invoiceNumber: "", invoiceAmount: "", ewayBill: "" }  ]);

  const removeInvoice = (idToRemove) => {
    setInvoices(invoices.filter(inv => inv.id !== idToRemove));
  };

  const handleRate = () => {
    setModalOpen(true);
  }

  const validateInvoices = () => {
    return invoices.every(inv => {
      if (parseFloat(inv.invoiceAmount) >= 50000) {
        if (!inv.ewayBill.trim()) return false;
      }
      return true;
    });
  };

  const saveMutation = useMutation({
    mutationFn: (data) => api.post("/api/shipments", data),
    onSuccess: () => {
      toast.success("Shipment saved!");
    },
  });

  const handleSave = (status) => {
    if (service === "Parcel" && !validateInvoices()) {
      toast.error("E-Way Bill is mandatory for invoices of ₹50,000 or more");
      return;
    }
    const payload = {
      status,
      shipper: { shipperName, shipperCompany, shipperPhone, shipperAddLine1, shipperAddLine2, shipperAddCity, shipperState, shipperPincode, shipperGst },
      service: { serviceType, service, customerRef, parcelContent, trackingNumber, paymentMode },
      parcels,
      invoices,
      rates: savedRates,
      customer: { customerId, customerType },
      specialInstruction: specialInstruction.trim() ? specialInstruction : null,
      consignee: { consigneeName, consigneePhone, consigneeAddLine1, consigneeAddLine2, consigneeAddCity, consigneePincode, consigneeGst },
      docDimensions: { length: docLength, width: docWidth, height: docHeight, weight: docWeight },
      dodCodDetails: { inFavour, payableAt, collectableAmount }
    };
    saveMutation.mutate(payload);
  };

  const handleClear = () => {
    setBoxesCount(1);
    setInvoices([1]);
    setParcels([1]);
    setService("Parcel");
    setServiceType("");
    setDocLength("10");
    setDocWidth("10");
    setDocHeight("10");
    setDocWeight("0.1");
    setPaymentSpecial("Normal");
    toast.success("Form cleared");
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-2xl shadow-2xl max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Create Shipment</h1>
        <div className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-medium text-lg">
          <span className="mr-5">Boxes: {boxesCount}</span>
          <span>Weight: {weight} kg</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Customr Selection */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">Pickup Address</div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Select Customer Type</label>
                <select onChange={(e) => setCustomerType(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="cash">Cash</option>
                  <option value="corporate">RCMF</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Select Customer</label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <div className="flex gap-3">
                  <input type="text" placeholder="Name" value={shipperName} onChange={(e) => setShipperName(e.target.value)} className="w-full flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <div className="flex gap-3">
                  <input type="text" value={shipperCompany} onChange={(e) => setShipperCompany(e.target.value)} placeholder="Company Name" className="w-full flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input type="text" value={shipperPhone} onChange={(e) => setShipperPhone(e.target.value)} placeholder="Phone Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" value={shipperEmail} onChange={(e) => setShipperEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Address Line 1</label>
                <input
                  type="text"
                  value={shipperAddLine1}
                  onChange={(e) => setShipperAddLine1(e.target.value)}
                  placeholder="Address line 1"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={shipperAddLine2}
                  onChange={(e) => setShipperAddLine2(e.target.value)}
                  placeholder="Address line 2"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={shipperAddCity}
                  onChange={(e) => setShipperAddCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <div className="relative">
                  <input type="text" value={shipperPincode} onChange={(e) => setShipperPincode(e.target.value)} placeholder="Pincode" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                </div>
              </div>
              {type === "company" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Sender GST Number</label>
                  <input type="text" value={shipperGst} onChange={(e) => setShipperGst(e.target.value)} placeholder="GST Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">Service Details</div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Service Type <span className="text-red-700">*</span></label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Service Type</option>
                  <option value="Surface">Surface</option>
                  <option value="Apex">Apex</option>
                  <option value="Domestic Priority">Domestic Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Select Service</label>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="service"
                      value="Parcel"
                      checked={service === "Parcel"}
                      onChange={(e) => setService(e.target.value)} 
                      className="w-5 h-5 accent-blue-600" 
                    />
                    Parcel
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="service"
                      value="Document"
                      checked={service === "Document"}
                      onChange={(e) => setService(e.target.value)}
                      className="w-5 h-5 accent-blue-600"
                    />
                    Document
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Customer Reference</label>
                <div className="relative">
                  <input type="text" value={customerRef} onChange={(e) => setCustomerRef(e.target.value)} placeholder="Customer Reference" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Parcel Content</label>
                <input type="text" value={parcelContent} onChange={(e) => setParcelContent(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-2">Tracking Number</label>
              <div className="relative">
                <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
              </div>
            </div>

            {service === "Parcel" && (
              <div>
                <label className="block text-sm font-medium mb-2">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Regular">Regular</option>
                  <option value="FOD">FOD</option>
                  <option value="DOD">DOD</option>
                  <option value="COD">COD</option>
                </select>
              </div>
            )}
            {(paymentMode === "DOD" || paymentMode === "COD") && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">In Favour Of <span className="text-red-700">*</span></label>
                  <input type="text" value={inFavour} onChange={(e) => setInFavour(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Payable At <span className="text-red-700">*</span></label>
                  <input type="text" value={payableAt} onChange={(e) => setPayableAt(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Collectable Amount <span className="text-red-700">*</span></label>
                  <input type="text" value={collectableAmount} onChange={(e) => setCollectableAmount(e.target.value)} placeholder="₹ 0.00" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div> 
            )}
          </div>
        </div>

        {/* Invoices */}
        {service === "Parcel" &&
          invoices.map((invoice, index) => (
          <div key={invoice.id} className="border rounded-xl overflow-hidden">
            <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold flex justify-between items-center">
              <span>Invoice #{index+1}</span>
              <div className="flex items-center gap-2">
                {invoice.id === invoices[invoices.length - 1].id && (
                  <button onClick={addInvoice} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
                    <Plus size={20} />
                  </button>
                )}
                {index > 0 && (
                  <button
                    onClick={() => removeInvoice(invoice.id)}
                    className="text-red-500 bg-white hover:text-red-100 transition p-1 rounded hover:bg-red-900/30"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Invoice Number</label>
                <input
                  type="text"
                  placeholder="Invoice Number"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoices(invoices.map(inv =>
                    inv.id === invoice.id ? { ...inv, invoiceNumber: e.target.value } : inv
                  ))}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Invoice Amount</label>
                <input
                  type="number"
                  placeholder="₹ 0.00"
                  value={invoice.invoiceAmount}
                  onChange={(e) => setInvoices(invoices.map(inv =>
                    inv.id === invoice.id ? { ...inv, invoiceAmount: e.target.value } : inv
                  ))}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 relative">
                <label className="block text-sm font-medium mb-2">
                  EwayBill Number
                  {parseFloat(invoice.invoiceAmount) >= 50000 && (
                    <span className="text-red-500 ml-1">* Required</span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="EwayBill Number"
                  value={invoice.ewayBill}
                  onChange={(e) => setInvoices(invoices.map(inv =>
                    inv.id === invoice.id ? { ...inv, ewayBill: e.target.value } : inv
                  ))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${parseFloat(invoice.invoiceAmount) >= 50000 && !invoice.ewayBill.trim() 
                    ? "border-red-400 bg-red-50" 
                    : ""
                  }`}
                />
              </div>
            </div>
          </div>
        ))}

        {service === "Document" && (
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">
              Document Dimensions
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Length</label>
                  <input
                    type="text"
                    value={docLength}
                    onChange={(e) => setDocLength(e.target.value)}
                    placeholder="Length"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Width (cm)</label>
                  <input
                    type="text"
                    value={docWidth}
                    onChange={(e) => setDocWidth(e.target.value)}
                    placeholder="Width"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Height (cm)</label>
                  <input
                    type="text"
                    value={docHeight}
                    onChange={(e) => setDocHeight(e.target.value)}
                    placeholder="Height"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                  <input
                    type="text"
                    value={docWeight}
                    onChange={(e) => setDocWeight(e.target.value)}
                    placeholder="Weight"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parcel Dimensions */}
        {service === "Parcel" && parcels.map((parcel, index) => (
          <div key={parcel.id} className="border rounded-xl overflow-hidden">
            <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold flex justify-between items-center">
              <span>Parcel Dimensions #{index + 1}</span>
              <div className="flex items-center gap-2">
                {parcel.id === parcels[parcels.length - 1].id && (
                  <button
                    onClick={addParcel}
                    className="bg-white text-black p-2 rounded-lg hover:bg-white/30 transition"
                  >
                    <Plus size={20} />
                  </button>
                )}
                {parcel.id > 1 && (
                  <button
                    onClick={() => removeParcel(parcel.id)}
                    className="bg-white text-red-500 p-2 rounded-lg hover:bg-white/30 transition"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Length"
                  value={parcel.length}
                  onChange={(e) => {
                    const newParcels = parcels.map(p =>
                      p.id === parcel.id ? { ...p, length: e.target.value } : p
                    );
                    setParcels(newParcels);
                  }}
                  className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Width"
                  value={parcel.width}
                  onChange={(e) => {
                    const newParcels = parcels.map(p =>
                      p.id === parcel.id ? { ...p, width: e.target.value } : p
                    );
                    setParcels(newParcels);
                  }}
                  className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Height"
                  value={parcel.height}
                  onChange={(e) => {
                    const newParcels = parcels.map(p =>
                      p.id === parcel.id ? { ...p, height: e.target.value } : p
                    );
                    setParcels(newParcels);
                  }}
                  className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Weight"
                  value={parcel.weight}
                  onChange={(e) => {
                    const newParcels = parcels.map(p =>
                      p.id === parcel.id ? { ...p, weight: e.target.value } : p
                    );
                    setParcels(newParcels);
                  }}
                  className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Number of boxes</label>
                <input
                  type="text"
                  value={parcel.numBoxes}
                  onChange={(e) => {
                    const newNum = Math.max(1, Number(e.target.value) || 1);
                    const newParcels = parcels.map(p =>
                      p.id === parcel.id ? { ...p, numBoxes: newNum } : p
                    );
                    setParcels(newParcels);
                  }}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Delivery Address */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">Delivery Address</div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Consignee Name</label>
                <div className="flex gap-3">
                  <input type="text" value={consigneeName} onChange={(e) => setConsigneeName(e.target.value)} placeholder="Consignee Name" className="flex-1 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input type="text" value={consigneePhone} onChange={(e) => setConsigneePhone(e.target.value)} placeholder="Phone Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Address Line 1</label>
                <div className="relative">
                  <input type="text" value={consigneeAddLine1} onChange={(e) => setConsigneeAddLine1(e.target.value)} placeholder="Pincode" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Address Line 2</label>
                <div className="relative">
                  <input type="text" value={consigneeAddLine2} onChange={(e) => setConsigneeAddLine2(e.target.value)} placeholder="Pincode" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-2">City</label>
                <div className="relative">
                  <input type="text" value={consigneeAddCity} onChange={(e) => setConsigneeAddCity(e.target.value)} placeholder="City" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <div className="relative">
                  <input type="text" value={consigneePincode} onChange={(e) => setConsigneePincode(e.target.value)} placeholder="Pincode" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Receiver GST Number</label>
                <input type="text" value={consigneeGst} onChange={(e) => setConsigneeGst(e.target.value)} placeholder="GST Number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Special Instruction */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">Special Instruction</div>
          <div className="p-6">
            <textarea value={specialInstruction} onChange={(e) => setSpecialInstruction(e.target.value)} placeholder="Enter any special instructions..."  rows={3} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        
        {customerType === "cash" && (
          <div className="border rounded-xl overflow-hidden">
            <div className="flex bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-2 font-semibold justify-between">
              <span className="mt-1">Update Rates</span>
              {/* <div className="flex items-center gap-2"> */}
                <button onClick={handleRate} className="bg-white text-black p-2 rounded-lg hover:bg-white/30 transition">
                  <Plus size={20} />
                </button>
              {/* </div> */}
            </div>
          </div>
        )}
        
      </div>

      {/* Bottom Buttons */}
      <div className="flex flex-wrap gap-4 mt-10">
        <button onClick={() => handleSave("draft")} className="flex-1 min-w-35 bg-linear-to-r from-blue-500 to-teal-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition">
          <Save size={20} />
          Save
        </button>
        <button onClick={() => handleSave("booked")} className="flex-1 min-w-35 bg-linear-to-r from-orange-500 to-amber-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition">
          <FileText size={20} />
          Save and Book
        </button>
        <button onClick={handleClear} className="flex-1 min-w-35 bg-gray-300 hover:bg-gray-400 text-gray-800 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition">
          <RotateCcw size={20} />
          Clear
        </button>
      </div>
      <RateModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        payment={paymentMode} 
        boxes={totalBoxes} 
        weight={weight} 
        volWeight={volWeight}
        serviceType={serviceType}
        savedRates={savedRates}
        onSave={(rates) => {
          setSavedRates(rates);
          setModalOpen(false);
        }}
      />
    </div>
  );
}