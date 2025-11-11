import React, { useState, useEffect } from "react";
import api from "../../../api/axios"; // Assuming your api.js is correctly set up

export default function EditProfileModal({ officialData, onClose, onSave }) {
  const [formPhoto, setFormPhoto] = useState(null);
  const [formReason, setFormReason] = useState("");
  const [formData, setFormData] = useState({
    of_fname: "",
    of_lname: "",
    of_m_initial: "",
    of_contact: "",
    of_email: "",
    of_suffix: "",
    of_sex: "",
    of_dob: "",
    of_pob: "",
    of_email: "",
    of_photo: null,
    new_province: "",
    new_municipality: "",
    new_barangay: "",
    new_sitio: "",
    new_street: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  
  // New state for dropdown lists
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  // New state to track if the address is changed
  const [isAddressUpdated, setIsAddressUpdated] = useState(false);

  useEffect(() => {
    // Fetch provinces
    api.get("/api/dswd/provinces/").then((response) => {
      setProvinces(response.data);
    });
  }, []);  // This effect will run only once to fetch the provinces

  useEffect(() => {
    // Fetch municipalities if province is selected
    if (formData.new_province) {
      api
        .get(`/api/dswd/municipalities/?province=${formData.new_province}`)
        .then((response) => {
          setMunicipalities(response.data);
        });
    } else {
      setMunicipalities([]);  // Reset municipalities if no province is selected
    }
  }, [formData.new_province]);  // This effect depends on new_province

  useEffect(() => {
    // Fetch barangays if municipality is selected
    if (formData.new_municipality) {
      api
        .get(`/api/dswd/barangays/?municipality=${formData.new_municipality}`)
        .then((response) => {
          setBarangays(response.data);
        });
    } else {
      setBarangays([]);  // Reset barangays if no municipality is selected
    }
  }, [formData.new_municipality]);  // This effect depends on new_municipality


  useEffect(() => {
    // Populate form with existing data
    if (officialData) {
      console.log('Official Data:', officialData);
      console.log('Province ID:', officialData.address?.province?.id);
      console.log('Municipality ID:', officialData.address?.municipality?.id);
      setFormData({
        of_fname: officialData.of_fname,
        of_lname: officialData.of_lname,
        of_m_initial: officialData.of_m_initial,
        of_contact: officialData.of_contact,
        of_suffix: officialData.of_suffix,
        of_email: officialData.of_email,
        of_sex: officialData.of_sex,
        of_dob: officialData.of_dob,
        of_pob: officialData.of_pob,
        new_province: officialData.address?.province?.id || "",  // Set province ID
        new_municipality: officialData.address?.municipality?.id || "",  // Set municipality ID
        new_barangay: officialData.address?.barangay?.id || "",
        new_sitio: "",
        new_street: ""
      });

      // Set image preview if photo exists
      if (officialData.of_photo) {
        setImagePreview(`http://localhost:8000${officialData.of_photo}`);
      }
    }
  }, [officialData]);
  // }, [officialData, formData.new_province, formData.new_municipality]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleProvinceChange = (e) => {
      const selectedProvinceId = e.target.value;
      console.log('Selected Province ID:', selectedProvinceId);  // Log the selected province ID
      setFormData({ ...formData, new_province: selectedProvinceId });
      setIsAddressUpdated(true);  // Track that address is updated
  };

  const handleMunicipalityChange = (e) => {
      const selectedMunicipalityId = e.target.value;
      console.log('Selected Municipality ID:', selectedMunicipalityId);  // Log the selected municipality ID
      setFormData({ ...formData, new_municipality: selectedMunicipalityId });
      setIsAddressUpdated(true);  // Track that address is updated
  };


  const handleBarangayChange = (e) => {
      setFormData({ ...formData, new_barangay: e.target.value });  // Storing the barangay ID
      setIsAddressUpdated(true);  // Track that address is updated
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, of_photo: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    // Adding the class to highlight the drop area when the user drags a file over the drop zone
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Handle the dropped file
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData({ ...formData, of_photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log the selected province and municipality before submitting
    console.log('Province ID to submit:', formData.new_province);
    console.log('Municipality ID to submit:', formData.new_municipality);

    // // Check if the address is being updated
    // const isAddressUpdated = formData.new_province !== officialData.address?.province?.id ||
    //                         formData.new_municipality !== officialData.address?.municipality?.id ||
    //                         formData.new_barangay !== officialData.address?.barangay?.id ||
    //                         formData.new_sitio !== officialData.address?.sitio ||
    //                         formData.new_street !== officialData.address?.street;

    // If address is being updated, check if all fields are filled out
    if (isAddressUpdated) {
      if (!formData.new_province || !formData.new_municipality || !formData.new_barangay || !formData.new_sitio || !formData.new_street) {
        alert("Please fill out the entire address if you're changing it.");
        return; // Prevent form submission if address fields are not filled
      }
    }

    const dataToSubmit = {
      of_fname: formData.of_fname,
      of_lname: formData.of_lname,
      of_m_initial: formData.of_m_initial,
      of_contact: formData.of_contact,
      of_suffix: formData.of_suffix,
      of_sex: formData.of_sex,
      of_dob: formData.of_dob,
      of_pob: formData.of_pob,
      of_email: formData.of_email,
      address: {
        province: formData.new_province,
        municipality: formData.new_municipality,
        barangay: formData.new_barangay,
        sitio: formData.new_sitio,
        street: formData.new_street,
      },
      isAddressUpdated: isAddressUpdated,
    };

    // Only add the address to the data if the address has been updated
    if (isAddressUpdated) {
      dataToSubmit.address = {
        province: formData.new_province,
        municipality: formData.new_municipality,
        barangay: formData.new_barangay,
        sitio: formData.new_sitio,
        street: formData.new_street,
      };
    }


    // Handle photo separately since it's a file upload
    if (formData.of_photo) {
      const formDataWithPhoto = new FormData();
      formDataWithPhoto.append("of_photo", formData.of_photo);
      Object.keys(dataToSubmit).forEach(key => {
        formDataWithPhoto.append(key, dataToSubmit[key]);
      });

      try {
        const response = await api.put("/api/dswd/profile/update/", formDataWithPhoto, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSave(response.data); // Call the onSave callback with the updated data
        onClose(); // Close the modal
      } catch (err) {
        console.error("Error updating profile:", err);
      }
    } else {
      // If no photo is uploaded, send the data as a JSON payload
      try {
        const response = await api.put("/api/dswd/profile/update/", dataToSubmit, {
          headers: { "Content-Type": "application/json" },
        });
        onSave(response.data); // Call the onSave callback with the updated data
        onClose(); // Close the modal
      } catch (err) {
        console.error("Error updating profile:", err);
      }
    }
  };




  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} />

      {/* Modal shell */}
      <div className="relative h-full w-full overflow-y-auto flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full sm:rounded-2xl p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="of_fname"
                  value={formData.of_fname}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="of_lname"
                  value={formData.of_lname}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Middle Initial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial</label>
                <input
                  type="text"
                  name="of_m_initial"
                  value={formData.of_m_initial}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Suffix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                <input
                  type="text"
                  name="of_suffix"
                  value={formData.of_suffix}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                <select
                  name="of_sex"
                  value={formData.of_sex}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Place of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                <input
                  type="text"
                  name="of_pob"
                  value={formData.of_pob}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="of_dob"
                  value={formData.of_dob}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  name="of_contact"
                  value={formData.of_contact}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="of_email"
                  value={formData.of_email}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Current Address */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                <div className="p-4 border-2 border-gray-200 rounded-md">
                  <p>Province: {officialData?.address?.province_name}</p>
                  <p>Municipality: {officialData?.address?.municipality_name}</p>
                  <p>Barangay: {officialData?.address?.barangay_name}</p>
                  <p>Sitio: {officialData?.address?.sitio}</p>
                  <p>Street: {officialData?.address?.street}</p>
                </div>
              </div>
              
              {/* New Address Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Province</label>
                <select
                  name="new_province"
                  value={formData.new_province}  // This should be the ID of the province
                  onChange={handleProvinceChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Municipality</label>
                <select
                  name="new_municipality"
                  value={formData.new_municipality}  // This should be the ID of the municipality
                  onChange={handleMunicipalityChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Municipality</option>
                  {municipalities.map((municipality) => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Barangay</label>
                <select
                  name="new_barangay"
                  value={formData.new_barangay}
                  onChange={handleBarangayChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Barangay</option>
                  {barangays.map((barangay) => (
                    <option key={barangay.id} value={barangay.id}>
                      {barangay.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Other address fields (Sitio, Street) */}
              <div>
                <input
                  type="text"
                  name="new_sitio"
                  value={formData.new_sitio || ""}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Sitio"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="new_street"
                  value={formData.new_street || ""}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Street"
                />
              </div>


              {/* Profile Picture */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden border border-gray-300">
                      <img
                        src={imagePreview || officialData.of_photo || "https://via.placeholder.com/160"}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <label
                      htmlFor="of_photo"
                      className="cursor-pointer border-dashed border-2 p-4 rounded-md text-sm font-medium text-gray-700"
                    >
                      Choose a file
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        id="of_photo"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
                {/* Drag & Drop Zone */}
                <div
                  className="mt-4 border-2 border-dashed p-6 text-center"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <p className="text-sm text-gray-600">Drag & Drop a file</p>
                </div>
              </div>
            </div>

            {/* Reason for Change */}
            <div className="mt-4 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Change</label>
              <textarea
                name="reason"
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="Why are you changing this?"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onClose()}
                className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
