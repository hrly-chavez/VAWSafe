import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const MAX_PHOTOS = 3;

const RegisterUser = () => {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [of_fname, setFname] = useState("");
  const [of_lname, setLname] = useState("");
  const [of_role, setRole] = useState("DSWD");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const capturePhoto = () => {
    const screenshot = webcamRef.current.getScreenshot();
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

  const retakePhoto = (index) => {
    setCurrentIndex(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (photos.length < MAX_PHOTOS || photos.some((p) => !p)) {
      setStatus(
        `Please capture all ${MAX_PHOTOS} face photos before submitting.`
      );
      return;
    }

    const formData = new FormData();
    formData.append("of_fname", of_fname);
    formData.append("of_lname", of_lname);
    formData.append("of_role", of_role);

    // Convert all photos to File objects and append as of_photos[]
    for (let i = 0; i < photos.length; i++) {
      const blob = await fetch(photos[i]).then((res) => res.blob());
      const photoFile = new File([blob], `photo_${i + 1}.jpg`, {
        type: "image/jpeg",
      });
      formData.append("of_photos", photoFile); //
    }

    setLoading(true);
    setStatus("");
    setCredentials(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/add-user/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setStatus("✅ Registration successful!");
      setCredentials({
        username: response.data.username,
        password: response.data.password,
        role: response.data.role,
      });

      setPhotos([]);
      setFname("");
      setLname("");
      setRole("DSWD");
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      setStatus("❌ Registration failed. Please check the input or camera.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Register Official (Multi-Face Sample)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={of_fname}
            onChange={(e) => setFname(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={of_lname}
            onChange={(e) => setLname(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Role:</label>
          <select
            value={of_role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="DSWD">DSWD</option>
            <option value="VAWDesk">VAWDesk</option>
            <option value="Social Worker">Social Worker</option>
          </select>
        </div>

        <div style={{ marginTop: "15px" }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
          />
        </div>

        <button
          type="button"
          onClick={capturePhoto}
          disabled={loading}
          style={{ marginTop: "10px" }}
        >
          Capture Photo {currentIndex + 1}/{MAX_PHOTOS}
        </button>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
            flexWrap: "wrap",
          }}
        >
          {photos.map((photo, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={photo}
                alt={`Face ${index + 1}`}
                width="150"
                style={{ border: "1px solid #ccc" }}
              />
              <button
                type="button"
                onClick={() => retakePhoto(index)}
                style={{ display: "block", width: "100%" }}
              >
                Retake #{index + 1}
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || photos.length < MAX_PHOTOS}
          style={{ marginTop: "20px" }}
        >
          {loading ? "Registering..." : `Submit ${MAX_PHOTOS} Face Photos`}
        </button>
      </form>

      {status && <p style={{ marginTop: "15px" }}>{status}</p>}

      {credentials && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid green",
            background: "#eaffea",
          }}
        >
          <h4>Generated Credentials:</h4>
          <p>
            <strong>Username:</strong> {credentials.username}
          </p>
          <p>
            <strong>Password:</strong> {credentials.password}
          </p>
          <p>
            <strong>Role:</strong> {credentials.role}
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterUser;
