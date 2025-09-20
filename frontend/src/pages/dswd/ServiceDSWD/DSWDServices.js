import api from "../../../api/axios";
import React, { useEffect, useState } from "react";

export default function DSWDServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

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
    category: "Others",
    name: "",
    contact_person: "",
    contact_number: "",
    assigned_place: {
      province: "",
      municipality: "",
      barangay: "",
      sitio: "",
      street: ""
    },
    service_address: {
      province: "",
      municipality: "",
      barangay: "",
      sitio: "",
      street: ""
    }
  });

  const categories = [
    "All",
    "Protection",
    "Legal",
    "Pyscho-Social",
    "Medical",
    "Medico-Legal",
    "Livelihood and Employment",
    "Others"
  ];

  // fetch services with optional category filter
  const fetchServices = (selectedCategory = "All") => {
    setLoading(true);
    let url = "/api/dswd/services/";
    if (selectedCategory && selectedCategory !== "All") {
      url += `?category=${encodeURIComponent(selectedCategory)}`;
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
    fetchServices(category);
  }, [category]);

  const handleChange = (e, field, nested = null) => {
    const { name, value } = e.target;
    if (nested) {
      setFormData({
        ...formData,
        [nested]: {
          ...formData[nested],
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post("/api/dswd/services/", formData)
      .then(() => {
        setShowModal(false);
        fetchServices(category);
      })
      .catch((err) => {
        console.error("Failed to add service:", err);
      });
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
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
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
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Contact Person</th>
                <th className="px-4 py-3">Contact Number</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center">Loading...</td></tr>
              ) : services.length > 0 ? (
                services.map((s, i) => (
                  <tr key={s.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">{s.category}</td>
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">{s.assigned_place}</td>
                    <td className="px-4 py-3">{s.service_address}</td>
                    <td className="px-4 py-3">{s.contact_person}</td>
                    <td className="px-4 py-3">{s.contact_number}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center">No services</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                {categories.filter(c => c !== "All").map((c) => (
                  <option key={c}>{c}</option>
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
                <h4 className="font-medium">Assigned Place</h4>

                {/* Province Dropdown */}
                <select
                  value={formData.assigned_place.province}
                  onChange={(e) => handleProvinceChange(e, "assigned_place")}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  <option value="">Select Province</option>
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                {/* Municipality Dropdown */}
                <select
                  value={formData.assigned_place.municipality}
                  onChange={(e) => handleMunicipalityChange(e, "assigned_place")}
                  className="w-full border rounded px-3 py-2 mt-1"
                  disabled={!formData.assigned_place.province}
                >
                  <option value="">Select Municipality</option>
                  {municipalities.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>

                {/* Barangay Dropdown */}
                <select
                  value={formData.assigned_place.barangay}
                  onChange={(e) => handleBarangayChange(e, "assigned_place")}
                  className="w-full border rounded px-3 py-2 mt-1"
                  disabled={!formData.assigned_place.municipality}
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
                  value={formData.assigned_place.sitio}
                  onChange={(e) => handleChange(e, "sitio", "assigned_place")}
                  className="w-full border rounded px-3 py-2 mt-1"
                />

                {/* Street text input */}
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  value={formData.assigned_place.street}
                  onChange={(e) => handleChange(e, "street", "assigned_place")}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>

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
