import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Landmark, Image as ImageIcon, X, Plus, Upload } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const assetUrl = (path) =>
  path ? `${import.meta.env.VITE_BASE_URL}/storage/${path}` : null;

// ── Company tab ────────────────────────────────────────────────

function CompanyTab() {
  const queryClient = useQueryClient();
  const logoInputRef = useRef(null);
  const qrInputRef = useRef(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => api.get("/api/settings/company").then((res) => res.data.data),
  });

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (settings) {
      setForm({
        company_name: settings.company_name || "",
        company_abbreviation: settings.company_abbreviation || "",
        invoice_format: settings.invoice_format || "{PREFIX}-{FY}-{SEQ}",
        default_gstin: settings.default_gstin || "",
        fy_start_month: settings.fy_start_month || 4,
        company_address: settings.company_address || "",
        terms_conditions: settings.terms_conditions || "",
        bank_account_name: settings.bank_account_name || "",
        bank_account_number: settings.bank_account_number || "",
        bank_ifsc_code: settings.bank_ifsc_code || "",
        bank_name: settings.bank_name || "",
        bank_branch_name: settings.bank_branch_name || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.put("/api/settings/company", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["company-settings"]);
      toast.success("Company settings saved!");
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Something went wrong";
      toast.error(msg);
    },
  });

  const logoMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("logo", file);
      return api.post("/api/settings/company/logo", fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["company-settings"]);
      toast.success("Logo uploaded!");
    },
    onError: () => toast.error("Logo upload failed"),
  });

  const qrMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("qr_code", file);
      return api.post("/api/settings/company/bank-qr", fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["company-settings"]);
      toast.success("Bank QR uploaded!");
    },
    onError: () => toast.error("QR upload failed"),
  });

  const removeQrMutation = useMutation({
    mutationFn: () => api.delete("/api/settings/company/bank-qr"),
    onSuccess: () => {
      queryClient.invalidateQueries(["company-settings"]);
      toast.success("Bank QR removed");
    },
  });

  if (isLoading || !form) {
    return <div className="text-center py-12 text-gray-500">Loading company settings...</div>;
  }

  const previewInvoiceNumber = form.invoice_format
    .replace("{PREFIX}", form.company_abbreviation || "VK")
    .replace("{FY}", "2526")
    .replace("{SEQ}", "000001");

  const requiredMissing = !form.company_name.trim() || !form.company_abbreviation.trim() || !form.invoice_format.trim();

  const handleSave = () => {
    if (requiredMissing) {
      toast.error("Company name, abbreviation and invoice format are required");
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-8">
      {/* Identity + invoice numbering */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-teal-600" /> Company Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Abbreviation <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={form.company_abbreviation}
              onChange={(e) => setForm({ ...form, company_abbreviation: e.target.value.toUpperCase() })}
              placeholder="e.g. VK"
              maxLength={10}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default GSTIN
            </label>
            <input
              type="text"
              value={form.default_gstin}
              onChange={(e) => setForm({ ...form, default_gstin: e.target.value.toUpperCase() })}
              placeholder="Used when a branch has no GSTIN of its own"
              maxLength={15}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year Starts
            </label>
            <select
              value={form.fy_start_month}
              onChange={(e) => setForm({ ...form, fy_start_month: Number(e.target.value) })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
          Company Address
        </label>
        <textarea
          value={form.company_address}
          onChange={(e) => setForm({ ...form, company_address: e.target.value })}
          rows={3}
          placeholder="Registered office address, shown on invoice PDFs"
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Number Format <span className="text-red-700">*</span>
          </label>
          <input
            type="text"
            value={form.invoice_format}
            onChange={(e) => setForm({ ...form, invoice_format: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
          />
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {["{PREFIX}", "{FY}", "{SEQ}"].map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => setForm({ ...form, invoice_format: form.invoice_format + token })}
                className="text-xs font-mono px-2 py-1 bg-teal-50 text-teal-700 rounded border border-teal-200 hover:bg-teal-100 cursor-pointer"
              >
                + {token}
              </button>
            ))}
            <span className="text-sm text-gray-500 ml-2">
              Preview: <span className="font-mono text-gray-700">{previewInvoiceNumber}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Logo */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon size={18} className="text-teal-600" /> Company Logo
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
            {settings.logo_path ? (
              <img src={assetUrl(settings.logo_path)} alt="Company logo" className="w-full h-full object-contain" />
            ) : (
              <ImageIcon size={24} className="text-gray-300" />
            )}
          </div>
          <div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={(e) => e.target.files[0] && logoMutation.mutate(e.target.files[0])}
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={logoMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              <Upload size={16} /> {logoMutation.isPending ? "Uploading..." : settings.logo_path ? "Replace Logo" : "Upload Logo"}
            </button>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG or SVG, up to 2MB</p>
          </div>
        </div>
      </section>

      {/* Bank details */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Landmark size={18} className="text-teal-600" /> Bank Details (shown on invoices)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
            <input
              type="text"
              value={form.bank_account_name}
              onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              value={form.bank_account_number}
              onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
            <input
              type="text"
              value={form.bank_branch_name}
              onChange={(e) => setForm({ ...form, bank_branch_name: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
            <input
              type="text"
              value={form.bank_ifsc_code}
              onChange={(e) => setForm({ ...form, bank_ifsc_code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Bank QR Code</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
            {settings.bank_qr_path ? (
              <img src={assetUrl(settings.bank_qr_path)} alt="Bank QR" className="w-full h-full object-contain" />
            ) : (
              <ImageIcon size={24} className="text-gray-300" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={qrInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => e.target.files[0] && qrMutation.mutate(e.target.files[0])}
            />
            <button
              onClick={() => qrInputRef.current?.click()}
              disabled={qrMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              <Upload size={16} /> {qrMutation.isPending ? "Uploading..." : settings.bank_qr_path ? "Replace QR" : "Upload QR"}
            </button>
            {settings.bank_qr_path && (
              <button
                onClick={() => removeQrMutation.mutate()}
                disabled={removeQrMutation.isPending}
                className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm cursor-pointer"
              >
                <X size={14} /> Remove
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Optional — can be left blank</p>
      </section>

      {/* Terms & conditions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms &amp; Conditions</h2>
        <textarea
          value={form.terms_conditions}
          onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })}
          rows={5}
          placeholder="Shown at the bottom of invoice PDFs"
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </section>

      <div className="flex justify-end pt-2 border-t">
        <button
          onClick={handleSave}
          disabled={requiredMissing || saveMutation.isPending}
          className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-8 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
        >
          {saveMutation.isPending ? "Saving..." : "Save Company Settings"}
        </button>
      </div>
    </div>
  );
}

// ── Branches tab ───────────────────────────────────────────────

function BranchesTab() {
  const queryClient = useQueryClient();
  const [branchId, setBranchId] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [form, setForm] = useState({ gstin: "", transporter_ids: [], default_transport_mode: "" });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api.get("/api/branches").then((res) => res.data.data || res.data),
    staleTime: Infinity,
  });

  const { data: branchSetting, isFetching } = useQuery({
    queryKey: ["branch-settings", branchId],
    queryFn: () => api.get(`/api/settings/branches/${branchId}`).then((res) => res.data.data),
    enabled: !!branchId,
  });

  useEffect(() => {
    if (branchSetting) {
      setForm({
        gstin: branchSetting.gstin || "",
        transporter_ids: branchSetting.transporter_ids || [],
        default_transport_mode: branchSetting.default_transport_mode || "",
      });
    } else if (branchId) {
      setForm({ gstin: "", transporter_ids: [], default_transport_mode: "" });
    }
  }, [branchSetting, branchId]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.put(`/api/settings/branches/${branchId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["branch-settings", branchId]);
      toast.success("Branch settings saved!");
    },
    onError: () => toast.error("Something went wrong"),
  });

  const addTransporterId = () => {
    const value = tokenInput.trim();
    if (!value) return;
    if (form.transporter_ids.includes(value)) {
      toast.error("That Transporter ID is already added");
      return;
    }
    setForm({ ...form, transporter_ids: [...form.transporter_ids, value] });
    setTokenInput("");
  };

  const removeTransporterId = (value) => {
    setForm({ ...form, transporter_ids: form.transporter_ids.filter((t) => t !== value) });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="w-full md:w-96 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Select a branch...</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
          ))}
        </select>
      </div>

      {!branchId && (
        <div className="text-center py-12 text-gray-400 border rounded-xl border-dashed">
          Select a branch above to view or edit its settings
        </div>
      )}

      {branchId && isFetching && (
        <div className="text-center py-12 text-gray-500">Loading branch settings...</div>
      )}

      {branchId && !isFetching && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                placeholder="Leave blank to use the company default GSTIN"
                maxLength={15}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Transport Mode</label>
              <input
                type="text"
                value={form.default_transport_mode}
                onChange={(e) => setForm({ ...form, default_transport_mode: e.target.value })}
                placeholder="e.g. Road"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transporter ID(s) <span className="text-gray-400 font-normal">(for E-Way Bill)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTransporterId())}
                placeholder="Enter a Transporter ID and press Add"
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
              <button
                onClick={addTransporterId}
                type="button"
                className="flex items-center gap-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium cursor-pointer"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            {form.transporter_ids.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.transporter_ids.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-1 text-sm font-mono"
                  >
                    {t}
                    <button onClick={() => removeTransporterId(t)} className="cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t">
            <button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending}
              className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-8 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            >
              {saveMutation.isPending ? "Saving..." : "Save Branch Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default function Settings() {
  const [tab, setTab] = useState("company");

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-1 border-b mb-8">
        {[
          { key: "company", label: "Company" },
          { key: "branches", label: "Branches" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition cursor-pointer ${
              tab === t.key
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "company" ? <CompanyTab /> : <BranchesTab />}
    </div>
  );
}