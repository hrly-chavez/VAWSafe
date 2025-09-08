// LoginPage.js
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./LoginPage.css";
import { UserIcon, LockClosedIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
const LoginPage = () => {

  //Regsiter states
  const MAX_PHOTOS = 3;
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [of_fname, setFname] = useState("");
  const [of_lname, setLname] = useState("");
  const [of_role, setRole] = useState("");
  // Dropdown of Register Choices 
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // UI states
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCounter, setShowCounter] = useState(false);
  const [blinkCaptured, setBlinkCaptured] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  // Keep a ref to track cancellation
  const loginCancelledRef = useRef(false);

  // Adding error state for LogIn
  const [loginErrors, setLoginErrors] = useState({
    username: "",
    password: "",
  });

  //Nag Add kog error state for backend validation
  const [backendErrors, setBackendErrors] = useState({ username: "", password: "" });

  // Adding error state for Register
  const [regErrors, setRegErrors] = useState({
    of_fname: "",
    of_lname: "",
    of_role: "",
    photos: "",
  });

  // state for the Welcome Card
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [welcomeData, setWelcomeData] = useState(null);

  const handleContinue = () => {
  const role = (welcomeData?.role || "").toLowerCase();
  if (role === "social worker") navigate("/social_worker/dashboard");
  else if (role === "vawdesk") navigate("/desk_officer");
  else if (role === "dswd") navigate("/dswd");
  else navigate("/login");
};



  // Welcome slides
  const slides = [
    {
      title: "Welcome to VAWSAFE",
      desc: " Empowering victims of violence with secure case monitoring and confidential support services.",
    },
    {
      title: "What is VAWSafe?",
      desc: "VAWSAFE is a secure VAWC case monitoring system that streamlines case management, protects victim confidentiality, and ensures verified delivery of DSWD support and services.",
    },
    {
      title: "How it works?",
      desc: "VAWSAFE provides secure case monitoring, SOS alerts, and facial verification for safe and efficient support.",
    },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  const MAX_FRAMES = 10;
  const INTERVAL = 200;

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: "image/jpeg" });
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // Utility Functions for Register New User
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔍 1. Validate fields BEFORE doing anything else
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

    //  2. Prepare form data only if validation passed
    const formData = new FormData();
    formData.append("of_fname", of_fname);
    formData.append("of_lname", of_lname);
    formData.append("of_role", of_role);

    for (let i = 0; i < photos.length; i++) {
      const blob = await fetch(photos[i]).then((res) => res.blob());
      const photoFile = new File([blob], `photo_${i + 1}.jpg`, {
        type: "image/jpeg",
      });
      formData.append("of_photos", photoFile);
    }

    //  3. Submit form
    setLoading(true);
    setStatus("");
    setCredentials(null);

    try {
      const response = await fetch("http://localhost:8000/api/auth/add-user/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setStatus(" Registration successful!");
      setCredentials({
        username: data.username,
        password: data.password,
        role: data.role,
      });

      //  4. Reset form state
      setPhotos([]);
      setFname("");
      setLname("");
      setRole("DSWD");
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      setStatus(" Registration failed. Please check the input or camera.");
    } finally {
      setLoading(false);
    }
  };

  // Utility Functions for Login with Face 
  const captureBurstFrames = async () => {
    const frames = [];

    for (let i = 0; i < MAX_FRAMES; i++) {
      if (loginCancelledRef.current) {
        console.warn("Capture cancelled");
        break;
      }

      if (!webcamRef.current || typeof webcamRef.current.getScreenshot !== "function") {
        console.warn("Webcam not ready");
        break;
      }

      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) frames.push(screenshot);
      await delay(INTERVAL);
    }

    return frames;
  };

  const handleFaceLogin = async () => {
    loginCancelledRef.current = false; // reset on new attempt
    setShowCamera(true);
    setShowCounter(true);
    setLoading(true);
    setMessage("Please look at the camera to log in.");
    setBlinkCaptured(false);

    // countdown
    for (let i = 3; i > 0; i--) {
      if (loginCancelledRef.current) return; // stop if cancelled
      setCountdown(i);
      await delay(1000);
    }

    if (loginCancelledRef.current) return;

    setCountdown(null);
    setMessage("📸 Capturing frames... Please blink now!");

    const frames = await captureBurstFrames();
    if (loginCancelledRef.current) return;

    if (frames.length === 0) {
      setMessage(" Failed to capture webcam images.");
      setLoading(false);
      return;
    }

    // Step 1: Blink check
    const blinkForm = new FormData();
    frames.forEach((frame, i) => {
      const blob = base64ToBlob(frame);
      blinkForm.append(`frame${i + 1}`, blob, `frame${i + 1}.jpg`);
    });

    try {
      const blinkRes = await fetch("http://localhost:8000/api/auth/blink-check/", {
        method: "POST",
        body: blinkForm,
      });
      if (loginCancelledRef.current) return;
      const blinkData = await blinkRes.json();

      if (!blinkRes.ok || !blinkData.blink) {
        setMessage(blinkData.message || " No blink detected, please try again.");
        setLoading(false);
        return;
      }

      setBlinkCaptured(true);
      setMessage(" Blink captured  Now verifying face...");

      // Step 2: Send candidate frames to face-login
      const loginForm = new FormData();
      blinkData.candidate_indices.forEach((idx, j) => {
        const chosenBlob = base64ToBlob(frames[idx]);
        loginForm.append(`frame${j + 1}`, chosenBlob, `frame${j + 1}.jpg`);
      });

      const loginRes = await fetch("http://localhost:8000/api/auth/face-login/", {
        method: "POST",
        body: loginForm,
      });
      if (loginCancelledRef.current) return;

      const loginData = await loginRes.json();
      console.log("Face login response:", loginData);
      setLoading(false);

      if (loginRes.ok && loginData.match) {
        loginData.user = {
          username: loginData.username,
          role: loginData.role,
          name: loginData.name,
          official_id: loginData.official_id,
          fname: loginData.fname, // ✅ now available
          lname: loginData.lname, // ✅ now available
          profile_photo_url: loginData.profile_photo_url
        };

        localStorage.setItem(
          "vawsafeAuth",
          JSON.stringify({
            access: loginData.tokens.access,
            refresh: loginData.tokens.refresh,
            user: loginData.user
          })
        );

        // ✅ Also set welcome card info
        setWelcomeData(loginData.user);
        setShowWelcomeCard(true);

      } else {
        setMessage(loginData.message || " Face verification failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again.");
      setLoading(false);
    }
  };

  // Utility Functions for ManualLogin
  const handleManualLogin = async () => {
    const newErrors = { username: "", password: "" };
    let hasError = false;

    if (!username.trim()) {
      newErrors.username = "Username is required.";
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
      hasError = true;
    }

    setLoginErrors(newErrors);
    if (hasError) return;

    setMessage("Logging in...");

    try {
      const response = await fetch("http://localhost:8000/api/auth/manual-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.match) {
        // ✅ Store JWT tokens and user info for axios interceptor
        localStorage.setItem(
          "vawsafeAuth",
          JSON.stringify({
            access: data.tokens.access,
            refresh: data.tokens.refresh,
            user: {
              username: data.username,
              role: data.role,
              name: data.name,
              official_id: data.official_id
            }
          })
        );

        setMessage(`Welcome, ${data.name} (${data.role})`);

        const role = data.role?.toLowerCase();
        if (role === "social worker") navigate("/social_worker");
        else if (role === "vawdesk") navigate("/desk_officer");
        else if (role === "dswd") navigate("/dswd");
      } else {
        if (data.message?.toLowerCase().includes("username")) {
          setBackendErrors({ username: "Username not found", password: "" });
        } else if (data.message?.toLowerCase().includes("password")) {
          setBackendErrors({ username: "", password: "Incorrect password" });
        } else {
          setBackendErrors({ username: "", password: "" });
          setMessage(data.message || "Invalid credentials");
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url("/images/background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/*  Navbar stays full width on top */}
      <Navbar />

      <div className="flex items-center justify-center py-8 sm:py-12 px-4 relative z-10">
        <div className="relative w-full max-w-6xl h-auto sm:h-[600px] grid grid-cols-1 sm:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden bg-white/5 backdrop-blur-lg">
          {/* Left Welcome Section */}
          <div className="bg-[#2d0a3a]/30 text-white flex flex-col justify-center items-start px-6 sm:px-12 py-8">
            <div key={currentSlide} className="slide-fade">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">{slides[currentSlide].title}</h1>
              <p className="text-base sm:text-lg opacity-80 mb-6">{slides[currentSlide].desc}</p>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg shadow-lg font-semibold"
              >
                Next
              </button>
            </div>
          </div>

          {/* Right Sign-in Section */}
          <div className="bg-white/10 backdrop-blur-md flex flex-col justify-center items-center px-10 w-full h-[600px]">
            {showRegister ? (
              //  REGISTER FORM
              <div className="w-full h-full flex justify-center items-center">
                <div className="w-full max-w-[600px] h-[90%] overflow-y-auto px-4 py-6 rounded-xl bg-white/10 backdrop-blur-md shadow-lg scroll-container">
                  <h2 className="text-2xl font-bold mb-4 text-white">Register Official</h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-6">
                    {/* First Name */}
                    <input
                      type="text"
                      placeholder="First Name"
                      value={of_fname}
                      onChange={(e) => setFname(e.target.value)}
                      className={`px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border ${regErrors.of_fname ? "border-red-500" : "border-white/30"
                        }`}
                    />
                    {regErrors.of_fname && (
                      <p className="text-red-400 text-sm mt-[0.2px] flex items-center gap-1">
                        <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
                        {regErrors.of_fname}
                      </p>
                    )}

                    {/* Last Name */}
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={of_lname}
                      onChange={(e) => setLname(e.target.value)}
                      className={`px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border ${regErrors.of_lname ? "border-red-500" : "border-white/30"
                        }`}
                    />
                    {regErrors.of_lname && (
                      <p className="text-red-400 text-sm mt-[0.2px] flex items-center gap-1">
                        <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
                        {regErrors.of_lname}
                      </p>
                    )}

                    {/* Custom Dropdown for Role */}
                    <div className="relative w-full mb-2">
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`w-full px-4 py-2 rounded-lg bg-white/20 text-white border ${regErrors.of_role ? "border-red-500" : "border-white/30"
                          } text-left focus:outline-none focus:ring-2 focus:ring-orange-400`}
                      >
                        {of_role || "Select Role"}
                      </button>

                      {regErrors.of_role && (
                        <p className="text-red-400 text-sm mt-4 flex items-center gap-1">
                          <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
                          {regErrors.of_role}
                        </p>
                      )}

                      {dropdownOpen && (
                        <ul className="absolute z-10 mt-2 w-full bg-white/20 backdrop-blur-md rounded-lg shadow-lg border border-white/30 text-white">
                          {["DSWD", "VAWDesk", "Social Worker"].map((role) => (
                            <li
                              key={role}
                              onClick={() => {
                                setRole(role);
                                setDropdownOpen(false);
                              }}
                              className="px-4 py-2 hover:bg-white/30 cursor-pointer transition"
                            >
                              {role}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Webcam */}
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="rounded-lg shadow-md"
                      videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                    />

                    {/* Capture Button */}
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={loading}
                      className="w-full py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600"
                    >
                      Capture Photo {currentIndex + 1}/{MAX_PHOTOS}
                    </button>

                    {/* Photo Previews */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 w-full justify-items-center">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Face ${index + 1}`}
                            className="w-[150px] border border-white/30 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = photos.filter((_, i) => i !== index);
                              setPhotos(updated);
                              setCurrentIndex(updated.length < MAX_PHOTOS ? updated.length : MAX_PHOTOS - 1);
                            }}
                            className="mt-2 w-full py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          >
                            Remove Photo
                          </button>
                        </div>
                      ))}
                    </div>

                    {regErrors.photos && (
                      <p className="text-red-400 text-sm mt-[2px] flex items-center gap-[2px]">
                        <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
                        {regErrors.photos}
                      </p>
                    )}


                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 mt-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg shadow hover:scale-105 transition-transform"
                    >
                      {loading ? "Registering..." : "Submit Registration"}
                    </button>

                    {/* Status Message */}
                    {status && <p className="mt-4 text-sm text-white">{status}</p>}

                    {/* Credentials Display */}
                    {credentials && credentials.username && (
                      <div className="mt-4 p-4 border border-green-500 bg-green-100 text-green-900 rounded">
                        <h4 className="font-bold mb-2">Generated Credentials:</h4>
                        <p><strong>Username:</strong> {credentials.username}</p>
                        <p><strong>Password:</strong> {credentials.password}</p>
                        <p><strong>Role:</strong> {credentials.role}</p>
                      </div>
                    )}

                    {/* Back to Login Button */}
                    <button
                      type="button"
                      onClick={() => setShowRegister(false)}
                      className="mt-6 text-base text-white font-semibold underline hover:text-orange-400"
                    >
                      Back to Login
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <>

                {/* Header Section */}
                {!showCamera ? (
                  <>
                    <h2 className="text-4xl font-bold text-white mb-2">Log in</h2>
                    <p className="mb-6 text-white text-sm font-medium">
                      Don’t Have an Account?{" "}
                      <span
                        onClick={() => setShowRegister(true)}
                        className="sign-up-link text-orange-400 font-medium hover:underline cursor-pointer"
                      >
                        Sign up
                      </span>
                    </p>
                  </>
                ) : (
                  <h2 className="text-3xl font-bold text-white mb-6">Face Authentication</h2>
                )}

                {/* Login Form vs Camera */}
                {!showCamera ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleManualLogin();
                    }}
                    className="w-[320px] flex flex-col items-center gap-4 mt-6"
                  >
                    {/* Username Field */}
                    <div className="relative w-full">
                      <div className="w-full flex items-center px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white">
                        <UserIcon className="w-5 h-5 text-white/70 mr-2" />
                        <input
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            setBackendErrors({ ...backendErrors, username: "" }); // clear backend error on change
                          }}
                          className="bg-transparent w-full outline-none placeholder-white/70"
                        />
                        {(loginErrors.username || backendErrors.username) && (
                          <ExclamationCircleIcon className="absolute right-3 top-2.5 h-5 w-5 text-red-500 animate-shake" />
                        )}
                      </div>

                      {(loginErrors.username || backendErrors.username) && <p className="text-red-500 text-sm mt-1"> {loginErrors.username || backendErrors.username} </p>}
                    </div>

                    {/* Password Field */}
                    <div className="relative w-full">
                      <div className="w-full flex items-center px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white">
                        <LockClosedIcon className="w-5 h-5 text-white/70 mr-2" />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setBackendErrors({ ...backendErrors, password: "" }); // clear backend error on change
                          }}
                          className="bg-transparent w-full outline-none placeholder-white/70"
                        />
                        {(loginErrors.password || backendErrors.password) && (
                          <ExclamationCircleIcon className="absolute right-3 top-2.5 h-5 w-5 text-red-500 animate-shake" />
                        )}
                      </div>
                      {(loginErrors.password || backendErrors.password) && <p className="text-red-500 text-sm mt-1">{loginErrors.password} </p>}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 mt-2 text-base bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-md shadow-md hover:scale-105 transition-transform"
                    >
                      Log in with Username
                    </button>

                    {/* Buttons */}
                    <button
                      type="button"
                      onClick={handleFaceLogin}
                      disabled={loading}
                      className="w-full py-2 mt-2 text-base bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-md shadow-md hover:scale-105 transition-transform"
                    >
                      {loading ? "Checking liveness..." : "Log in with Face"}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center">
                    {/* Webcam Box */}
                    <div className="relative h-[300px] w-[300px] rounded-2xl overflow-hidden shadow-lg">
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="h-full w-full object-cover"
                      />

                      {/* Countdown Overlay */}
                      {showCounter && countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <h1 className="text-white text-[64px] font-bold drop-shadow-md animate-pulse">
                            {countdown}
                          </h1>
                        </div>
                      )}
                    </div>

                    {/* Status Message */}
                    {message && (
                      <p
                        className={`mt-4 text-sm font-medium ${loading
                          ? "text-white animate-pulse"
                          : blinkCaptured || message.includes("✅")
                            ? "text-green-400"
                            : message === "No blink detected. Please blink clearly."
                              ? "text-red-400"
                              : "text-white"
                          }`}
                      >
                        {message}
                      </p>
                    )}

                    {/* Retry + Back Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row sm:gap-6 gap-4 items-center">
                      {!loading &&
                        (message === "No blink detected. Please blink clearly." ||
                          message.includes("")) && (
                          <button
                            onClick={handleFaceLogin}
                            className="w-44 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition"
                          >
                            Retry
                          </button>
                        )}
                      <button
                        onClick={() => {
                          loginCancelledRef.current = true; //  cancel running flow
                          setShowCamera(false);
                          setMessage("");
                          setCountdown(3);
                          setLoading(false); // make sure button resets
                        }}
                        className="w-44 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow hover:bg-gray-600 transition"
                      >
                        Go Back
                      </button>
                    </div>

                    {/* Welcome Card */}
                    {showWelcomeCard && welcomeData && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-green-100 border border-green-400 rounded-lg p-6 shadow-xl text-green-900 w-full max-w-md text-center animate-fade-in">
                          <CheckCircleIcon className="h-6 w-6 text-green-500 mx-auto mb-2" />
                          <h3 className="text-lg font-semibold">
                            Welcome, {welcomeData.name}!
                          </h3>
                          <p className="text-sm mt-1">
                            You're now signed in as <strong>{welcomeData.role}</strong>. Let's get started.
                          </p>
                          <button
                            type="button"
                            onClick={handleContinue}
                            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
