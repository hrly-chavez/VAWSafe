import api from "../../../api/axios";
import React, { useEffect, useState } from "react";

export default function DSWDServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [categories, setCategories] = useState([]);

  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [statusFilter, setStatusFilter] = useState("true"); //set default to active kato ning i display

  const [viewService, setViewService] = useState(null);

  useEffect(() => {
    api.get("/api/dswd/service-categories/").then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    api.get("/api/dswd/provinces/").then(res => setProvinces(res.data));
  }, []);

  const handleProvinceChange = (e, nested) => {
    const provinceId = e.target.value;
    setFormData({
      ...formData,
      [nested]: { ...formData[nested], province: provinceId, municipality: "", barangay: "" }
    });
    setMunicipalities([]);
    setBarangays([]);
    if (provinceId) {
      api.get(`/api/dswd/municipalities/?province=${provinceId}`).then(res => setMunicipalities(res.data));
    }
  };

  const handleMunicipalityChange = (e, nested) => {
    const municipalityId = e.target.value;
    setFormData({
      ...formData,
      [nested]: { ...formData[nested], municipality: municipalityId, barangay: "" }
    });
    setBarangays([]);
    if (municipalityId) {
      api.get(`/api/dswd/barangays/?municipality=${municipalityId}`).then(res => setBarangays(res.data));
    }
  };

  const handleBarangayChange = (e, nested) => {
    const barangayId = e.target.value;
    setFormData({
      ...formData,
      [nested]: { ...formData[nested], barangay: barangayId }
    });
  };


  // Form state
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    contact_person: "",
    contact_number: "",
    // assigned_place: {
    //   province: "",
    //   municipality: "",
    //   barangay: "",
    //   sitio: "",
    //   street: ""
    // },
    service_address: {
      province: "",
      municipality: "",
      barangay: "",
      sitio: "",
      street: ""
    }
  });



  // fetch services with optional category filter
  const fetchServices = (selectedCategory = "All", activeStatus = statusFilter) => {
    setLoading(true);
    let url = `/api/dswd/services/?is_active=${activeStatus}`;
    
    if (selectedCategory && selectedCategory !== "All") {
      url += `&category=${encodeURIComponent(selectedCategory)}`;
    }

    api.get(url)
      .then((res) => {
        setServices(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch services:", err);
        setError("Unable to load services.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices(category, statusFilter);
  }, [category, statusFilter]);

  const handleChange = (e, field, nested = null) => {
    const { name, value } = e.target;
    const processedValue = name === "category" ? Number(value) : value;

    if (nested) {
      setFormData({
        ...formData,
        [nested]: {
          ...formData[nested],
          [name]: processedValue
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: processedValue
      });
    }
  };

  //view service
  const handleView = (service) => {
    setViewService(service);
  };

  const closeViewModal = () => {
    setViewService(null);
  };

  //edit and deactivate
  const handleEdit = (service) => {
    setFormData(service);
    setShowModal(true);
  };

  const handleDeactivate = async (id) => {
    try {
      const service = services.find((s) => s.serv_id === id);
      await api.patch(`/api/dswd/services/${id}/`, { is_active: !service.is_active });
      fetchServices(category);
    } catch (err) {
      console.error("Failed to toggle active status:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.serv_id) {
        // Edit existing service
        await api.put(`/api/dswd/services/${formData.serv_id}/`, formData);
      } else {
        // Add new service
        await api.post("/api/dswd/services/", formData);
      }
      setShowModal(false);
      fetchServices(category);
    } catch (err) {
      console.error("Failed to save service:", err);
    }
  };

  return (
    <div className="w-full px-6">
      {/* Title */}
      <h2 className="text-xl font-bold text-[#292D96] pt-6">Service</h2>

      {/* Filters */}
      <div className="mt-3 flex justify-between items-center">
        <p className="text-sm font-medium text-[#292D96]">List of Services</p>
        <div className="flex gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-48 rounded-lg border px-3 text-sm"
          >
            <option value="All">Category(All)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 w-48 rounded-lg border px-3 text-sm"
          >
            <option value="true">Active</option>
            <option value="false">Deactivated</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-600 hover:scale-105"
          >
            Add Services
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-2xl border bg-white p-4 shadow-lg">
        <div className="max-h-[480px] overflow-auto rounded-xl">
          <table className="w-full table-auto border-collapse">
            <thead className="sticky top-0 bg-neutral-50">
              <tr className="text-left text-sm font-semibold text-neutral-700">
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : services.length > 0 ? (
                services.map((s, i) => (
                  <tr key={s.serv_id || i} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">{s.category_name}</td>
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(s)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewService && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[600px] max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-[#292D96]">Service Details</h3>

            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {viewService.serv_id}</p>
              <p><strong>Category:</strong> {viewService.category_name}</p>
              <p><strong>Service Name:</strong> {viewService.name}</p>
              <p><strong>Contact Person:</strong> {viewService.contact_person}</p>
              <p><strong>Contact Number:</strong> {viewService.contact_number}</p>

              {viewService.service_address ? (
                <>
                  <p><strong>Province:</strong> {viewService.service_address.province_name || "—"}</p>
                  <p><strong>Municipality:</strong> {viewService.service_address.municipality_name || "—"}</p>
                  <p><strong>Barangay:</strong> {viewService.service_address.barangay_name || "—"}</p>
                  <p><strong>Sitio:</strong> {viewService.service_address.sitio || "—"}</p>
                  <p><strong>Street:</strong> {viewService.service_address.street || "—"}</p>
                </>
              ) : (
                <p><strong>Address:</strong> —</p>
              )}

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`font-semibold ${
                    viewService.is_active ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {viewService.is_active ? "Active" : "Deactivated"}
                </span>
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {/* Edit button */}
              <button
                onClick={() => {
                  setFormData(viewService);
                  setShowModal(true);
                  setViewService(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>

              {/* Deactivate / Activate */}
              <button
                onClick={() => {
                  handleDeactivate(viewService.serv_id);
                  setViewService(null);
                }}
                className={`px-4 py-2 rounded text-white ${
                  viewService.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {viewService.is_active ? "Deactivate" : "Activate"}
              </button>

              {/* Close button */}
              <button
                onClick={closeViewModal}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Add Service</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="" disabled>
                  -- Select Category --
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>



              <input
                type="text"
                name="name"
                placeholder="Service Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="contact_person"
                placeholder="Contact Person"
                value={formData.contact_person}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="contact_number"
                placeholder="Contact Number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />

              <div>
                <h4 className="font-medium">Service Address</h4>

                {/* Province Dropdown */}
                <select
                  value={formData.service_address.province}
                  onChange={(e) => handleProvinceChange(e, "service_address")}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  <option value="">Select Province</option>
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                {/* Municipality Dropdown */}
                <select
                  value={formData.service_address.municipality}
                  onChange={(e) => handleMunicipalityChange(e, "service_address")}
                  className="w-full border rounded px-3 py-2 mt-1"
                  disabled={!formData.service_address.province}
                >
                  <option value="">Select Municipality</option>
                  {municipalities.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>

                {/* Barangay Dropdown */}
                <select
                  value={formData.service_address.barangay}
                  onChange={(e) => handleBarangayChange(e, "service_address")}
                  className="w-full border rounded px-3 py-2 mt-1"
                  disabled={!formData.service_address.municipality}
                >
                  <option value="">Select Barangay</option>
                  {barangays.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>

                {/* Sitio text input */}
                <input
                  type="text"
                  name="sitio"
                  placeholder="Sitio"
                  value={formData.service_address.sitio}
                  onChange={(e) => handleChange(e, "sitio", "service_address")}
                  className="w-full border rounded px-3 py-2 mt-1"
                />

                {/* Street text input */}
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  value={formData.service_address.street}
                  onChange={(e) => handleChange(e, "street", "service_address")}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
