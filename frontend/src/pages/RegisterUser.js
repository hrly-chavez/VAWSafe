import axios from "axios";
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { XMarkIcon } from '@heroicons/react/24/solid';

const RegisterUser = ({ onClose }) => {
  const MAX_PHOTOS = 3;
  const webcamRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [credentials, setCredentials] = useState(null);

  // Personal Info (core fields)
  const [of_fname, setFname] = useState("");
  const [of_lname, setLname] = useState("");
  const [of_role, setRole] = useState("");

  const [sex, setSex] = useState("");

  // Optional fields (commented for test run)
  // const [of_m_initial, setMInitial] = useState("");
  // const [of_suffix, setSuffix] = useState("");
  // const [of_sex, setSex] = useState("");
  // const [of_dob, setDob] = useState("");
  // const [of_pob, setPob] = useState("");
  // const [of_contact, setContact] = useState("");
  // const [of_specialization, setSpecialization] = useState("");

  // Location hierarchy (commented for test run)
  // const [city, setCity] = useState("");
  // const [municipality, setMunicipality] = useState("");
  // const [barangay, setBarangay] = useState("");
  // const [sitio, setSitio] = useState("");
  // const [street, setStreet] = useState("");
  // const [of_assigned_barangay, setAssignedBarangay] = useState("");

  const [regErrors, setRegErrors] = useState({
    of_fname: "",
    of_lname: "",
    of_role: "",
    photos: "",
  });
  const [loading, setLoading] = useState(false);

  const inputStyle = "px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400";

  const capturePhoto = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      setStatus("Unable to capture photo. Please try again.");
      return;
    }

    const updatedPhotos = [...photos];
    updatedPhotos[currentIndex] = screenshot;
    setPhotos(updatedPhotos);

    if (currentIndex < MAX_PHOTOS - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const removePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    setCurrentIndex(updated.length < MAX_PHOTOS ? updated.length : MAX_PHOTOS - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = { of_fname: "", of_lname: "", of_role: "", photos: "" };
    let hasError = false;

    if (!of_fname.trim()) {
      newErrors.of_fname = "Please fill out this field.";
      hasError = true;
    }

    if (!of_lname.trim()) {
      newErrors.of_lname = "Please fill out this field.";
      hasError = true;
    }

    if (!of_role.trim()) {
      newErrors.of_role = "Please choose a role.";
      hasError = true;
    }

    if (photos.length < MAX_PHOTOS || photos.some((p) => !p)) {
      newErrors.photos = `Please capture all ${MAX_PHOTOS} face photos.`;
      hasError = true;
    }

    setRegErrors(newErrors);
    if (hasError) return;

    const formData = new FormData();
    formData.append("of_fname", of_fname);
    formData.append("of_lname", of_lname);
    formData.append("of_role", of_role);

    // Optional fields (commented for test run)
    // formData.append("of_m_initial", of_m_initial);
    // formData.append("of_suffix", of_suffix);
    // formData.append("of_sex", of_sex);
    // formData.append("of_dob", of_dob);
    // formData.append("of_pob", of_pob);
    // formData.append("of_contact", of_contact);
    // formData.append("of_specialization", of_specialization);
    // formData.append("city", city);
    // formData.append("municipality", municipality);
    // formData.append("barangay", barangay);
    // formData.append("sitio", sitio);
    // formData.append("street", street);
    // formData.append("of_assigned_barangay", of_assigned_barangay);

    for (let i = 0; i < photos.length; i++) {
      const blob = await fetch(photos[i]).then((res) => res.blob());
      const photoFile = new File([blob], `photo_${i + 1}.jpg`, { type: "image/jpeg" });
      formData.append("of_photos", photoFile);
    }

    setLoading(true);
    setStatus("");
    setCredentials(null);

    try {
      const response = await fetch("http://localhost:8000/api/auth/add-user/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setStatus("Registration successful!");
      setCredentials({
        username: data.username,
        password: data.password,
        role: data.role,
      });

      setPhotos([]);
      setFname("");
      setLname("");
      setRole("DSWD");
      setCurrentIndex(0);
    } catch (err) {
      console.error("Registration error:", err);
      setStatus("Registration failed. Please check the input or camera.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-[1000px] h-[90%] overflow-hidden px-6 py-6 rounded-2xl bg-white text-black shadow-2xl border border-gray-200 transition-all duration-300 scale-100 animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold mb-6 border-b pb-2">Register Official</h2>

        {/* Scrollable Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] scroll-container">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-6">
            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={of_fname}
                  onChange={(e) => setFname(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={of_lname}
                  onChange={(e) => setLname(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Middle Initial</label>
                <input type="text" placeholder="Middle Inital" className={inputStyle} />
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Suffix</label>
                <input type="text" placeholder="Jr., Sr., III" className={inputStyle} />
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className={`${inputStyle} ${sex === "" ? "text-gray-500" : "text-black"}`}
                >
                  <option value="" disabled hidden>Select Sex</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Date of Birth</label>
                <input type="date" className={inputStyle} />
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Place of Birth</label>
                <input type="text" placeholder="Cebu City, Cebu" className={inputStyle} />
              </div>

              {/* Contact & Role */}
              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Contact Number</label>
                <input type="text" placeholder="09123456789" className={inputStyle} />
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Role</label>
                <select
                  value={of_role}
                  onChange={(e) => setRole(e.target.value)}
                  className={inputStyle}
                >
                  <option value="">Select Role</option>
                  <option value="DSWD">DSWD</option>
                  <option value="VAWDesk">VAWDesk</option>
                  <option value="Social Worker">Social Worker</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Specialization</label>
                <input type="text" placeholder="Case Management, Trauma Support" className={inputStyle} />
              </div>

              {/* Address */}
              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">City</label>
                <select className={inputStyle}>
                  <option value="">Select City</option>
                  <option value="Cebu City">Cebu City</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Municipality</label>
                <select className={inputStyle}>
                  <option value="">Select Municipality</option>
                  <option value="Minglanilla">Minglanilla</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Barangay</label>
                <select className={inputStyle}>
                  <option value="">Select Barangay</option>
                  <option value="Tungkil">Tungkil</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Sitio</label>
                <input type="text" placeholder="Sitio Example" className={inputStyle} />
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Street</label>
                <input type="text" placeholder="Example Street Name" className={inputStyle} />
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-sm mb-1">Assigned Barangay</label>
                <select className={inputStyle}>
                  <option value="">Select Assigned Barangay</option>
                  <option value="Tungkil">Tungkil</option>
                </select>
              </div>
            </div>

            {/* Face Capture Section */}
            <div className="mt-6 w-full flex flex-col items-center gap-4">
              <h3 className="text-xl font-semibold text-gray-800 text-center">Face Capture</h3>

              <div className="w-full max-w-[480px] mx-auto">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="rounded-lg shadow-md w-full h-[480px] object-cover border border-gray-300"
                  videoConstraints={{ width: 480, height: 480, facingMode: "user" }}
                />
              </div>

              <button
                type="button"
                onClick={capturePhoto}
                className="max-w-[240px] w-full py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition"
              >
                Capture Photo {currentIndex + 1}/{MAX_PHOTOS}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-[720px] mx-auto">
                {photos.map((photo, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <img src={photo} className="rounded border border-gray-300 w-full h-auto object-cover" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="mt-2 w-full py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full flex justify-center">
              <button
                type="submit"
                disabled={loading || photos.length < MAX_PHOTOS}
                className={`max-w-[240px] w-full py-2 mt-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${loading || photos.length < MAX_PHOTOS ? "opacity-70 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? "Registering..." : "Submit Registration"}
              </button>
            </div>

            {/* Credential Display */}
            {credentials && credentials.username && (
              <div className="mt-4 p-4 border border-green-500 bg-green-100 text-green-900 rounded-lg shadow">
                <h4 className="font-bold mb-2">Generated Credentials:</h4>
                <p><strong>Username:</strong> {credentials.username}</p>
                <p><strong>Password:</strong> {credentials.password}</p>
                <p><strong>Role:</strong> {credentials.role}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
