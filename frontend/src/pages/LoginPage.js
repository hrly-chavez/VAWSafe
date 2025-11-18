// LoginPage.js
import React, { useRef, useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import RegisterUser from "./RegisterUser";
import {
  UserIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  CameraIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

const LoginPage = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  //Register Modal Show
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  //modal para matic open register user nga modal if way dswd account
  const [autoDSWDRegister, setAutoDSWDRegister] = useState(false);

  //para sa cookies
  const { login: authLogin } = useContext(AuthContext);

  // simple cookie reader for CSRF
  function getCookie(name) {
    const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
    return m ? decodeURIComponent(m[2]) : null;
  }

  async function apiFetch(url, options = {}) {
    const opts = { credentials: "include", ...options };
    const method = (opts.method || "GET").toUpperCase();

    // Add CSRF only for unsafe methods
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      opts.headers = {
        ...(opts.headers || {}),
        "X-CSRFToken": getCookie("csrftoken"),
      };
    }

    return fetch(url, opts);
  }

  // UI states
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCounter, setShowCounter] = useState(false);
  const [blinkCaptured, setBlinkCaptured] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Keep a ref to track cancellation
  const loginCancelledRef = useRef(false);

  // Adding error state for LogIn
  const [loginErrors, setLoginErrors] = useState({
    username: "",
    password: "",
  });

  //Nag Add kog error state for backend validation
  const [backendErrors, setBackendErrors] = useState({
    username: "",
    password: "",
  });

  // state for the Welcome Card
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [welcomeData, setWelcomeData] = useState(null);

  const handleContinue = () => {
    const role = (welcomeData?.role || "").toLowerCase();
    if (role === "social worker") navigate("/social_worker/dashboard");
    else if (role === "nurse") navigate("/nurse");
    else if (role === "psychometrician") navigate("/psychometrician");
    else if (role === "dswd") navigate("/dswd");
  };

  // Welcome slides
  const slides = [
    {
      title: "Welcome to VAWSAFE!",
      desc: "A secure system designed for DSWD Center for Women and Children — helping social workers, nurses, and psychometricians manage cases and provide coordinated support to victims of abuse.",
    },
    {
      title: "What is VAWSAFE?",
      desc: "VAWSAFE is a digital case management platform that enables authorized DSWD professionals to register victims, record interventions, monitor progress, and ensure confidential handling of sensitive information.",
    },
    {
      title: "How it works?",
      desc: "Through VAWSAFE, social workers, nurses, and psychometricians can document sessions, track victim recovery, and collaborate effectively — all within a secure and privacy-focused environment.",
    },
    {
      title: "For Authorized Professionals Only",
      desc: "This system is exclusively for use by DSWD social workers, nurses, and psychometricians of the Center for Women and Children. Unauthorized access or data disclosure is strictly prohibited.",
    },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimerRef = useRef(null);

  useEffect(() => {
    slideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // every 5 seconds

    return () => clearInterval(slideTimerRef.current);
  }, []);

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

  // Utility Functions for Login with Face
  const captureBurstFrames = async () => {
    const frames = [];

    for (let i = 0; i < MAX_FRAMES; i++) {
      if (loginCancelledRef.current) {
        console.warn("Capture cancelled");
        break;
      }

      if (
        !webcamRef.current ||
        typeof webcamRef.current.getScreenshot !== "function"
      ) {
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
    setMessage(
      <div className="flex items-center gap-2 text-blue-700 text-lg">
        <CameraIcon className="w-5 h-5 text-blue-700" />
        <span>Please look at the camera to log in.</span>
      </div>
    );
    setBlinkCaptured(false);

    // countdown
    for (let i = 3; i > 0; i--) {
      if (loginCancelledRef.current) return; // stop if cancelled
      setCountdown(i);
      await delay(1000);
    }
    if (loginCancelledRef.current) return;

    setCountdown(null);
    setMessage(
      <div className="flex items-center gap-2 text-blue-700 text-lg">
        <EyeIcon className="w-5 h-5 text-blue-700" />
        <span>Capturing frames... Please blink now!</span>
      </div>
    );

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
      const blinkRes = await apiFetch(
        "http://localhost:8000/api/auth/blink-check/",
        {
          method: "POST",
          body: blinkForm,
          // credentials: "include", // send cookies if your blink-check is CSRF-protected
          // headers: { "X-CSRFToken": getCookie("csrftoken") }, // safe to include
        }
      );
      if (loginCancelledRef.current) return;
      const blinkData = await blinkRes.json();

      if (!blinkRes.ok || !blinkData.blink) {
        setMessage(
          blinkData.message || " No blink detected, please try again."
        );
        setLoading(false);
        return;
      }

      setBlinkCaptured(true);
      setMessage(
        <div className="flex items-center gap-2 text-green-600 text-lg">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Blink captured. Now verifying face...</span>
        </div>
      );

      // Step 2: Send candidate frames to face-login
      const loginForm = new FormData();
      blinkData.candidate_indices.forEach((idx, j) => {
        const chosenBlob = base64ToBlob(frames[idx]);
        loginForm.append(`frame${j + 1}`, chosenBlob, `frame${j + 1}.jpg`);
      });

      const loginRes = await apiFetch(
        "http://localhost:8000/api/auth/face-login/",
        {
          method: "POST",
          body: loginForm,
          // credentials: "include",                            // cookies set by server
          // headers: { "X-CSRFToken": getCookie("csrftoken") } // CSRF for POST
        }
      );
      if (loginCancelledRef.current) return;

      const loginData = await loginRes.json();
      console.log("Face login response:", loginData);
      setLoading(false);

      if (loginRes.ok && loginData.match) {
        // ✅ Cookies already contain tokens; just set user in context
        authLogin({
          username: loginData.username,
          role: loginData.role,
          name: loginData.name,
          official_id: loginData.official_id,
        });

        // ✅ Fetch full user info including profile photo
        try {
          const meRes = await api.get("/api/auth/me/"); // ensure CSRF token if needed
          if (meRes.data?.authenticated && meRes.data.user) {
            authLogin(meRes.data.user); // update context with full user object including of_photo
          }
        } catch (err) {
          console.error("Failed to fetch full user info:", err);
        }

        // ✅ Welcome card
        setWelcomeData({
          name: loginData.name,
          role: loginData.role,
          username: loginData.username,
          official_id: loginData.official_id,
        });
        setShowWelcomeCard(true);

        // ✅ Redirect based on role
        const role = (loginData.role || "").toLowerCase();
        setTimeout(() => {
          if (role === "dswd") navigate("/dswd");
          else if (role === "social worker") navigate("/social_worker");
          else if (role === "nurse") navigate("/nurse");
          else if (role === "psychometrician") navigate("/psychometrician");
          else navigate("/login");
        }, 5000);
      } else {
        setMessage(loginData.message || " Face verification failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again.");
      setLoading(false);
    }
  };

  const handleManualLogin = async () => {
    setLoginErrors({ username: "", password: "" });
    setBackendErrors({ username: "", password: "" });

    let hasError = false;
    const newErrors = { username: "", password: "" };

    if (!username.trim()) {
      newErrors.username = "Username is required.";
      hasError = true;
    }
    if (!password.trim()) {
      newErrors.password = "Password is required.";
      hasError = true;
    }

    if (hasError) {
      setLoginErrors(newErrors);
      return;
    }

    try {
      const response = await apiFetch("http://localhost:8000/api/auth/manual-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.match) {
        authLogin({
          username: data.username,
          role: data.role,
          name: data.name,
          official_id: data.official_id,
        });

        try {
          const meRes = await api.get("/api/auth/me/");
          if (meRes.data?.authenticated && meRes.data.user) {
            authLogin(meRes.data.user);
          }
        } catch (err) {
          console.error("Failed to fetch full user info:", err);
        }

        const role = (data.role || "").toLowerCase();
        if (role === "social worker") navigate("/social_worker");
        else if (role === "nurse") navigate("/nurse/sessions/");
        else if (role === "psychometrician") navigate("/psychometrician");
        else if (role === "dswd") navigate("/dswd");
      } else {
        // Generic inline error for both fields
        const genericError = "Username or password is incorrect.";
        setBackendErrors({ username: "", password: genericError });
      }
    } catch (err) {
      console.error(err);
      const genericError = "Username or password is incorrect.";
      setBackendErrors({ username: "", password: genericError });
    }
  };



  // const handleManualLogin = async () => {
  //   const newErrors = { username: "", password: "" };
  //   let hasError = false;

  //   if (!username.trim()) {
  //     newErrors.username = "Username is required.";
  //     hasError = true;
  //   }
  //   if (!password.trim()) {
  //     newErrors.password = "Password is required.";
  //     hasError = true;
  //   }

  //   setLoginErrors(newErrors);
  //   if (hasError) return;

  //   setMessage("Logging in...");

  //   try {
  //     const response = await apiFetch(
  //       "http://localhost:8000/api/auth/manual-login/",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         // credentials: "include", // ⬅️ send/receive cookies
  //         body: JSON.stringify({ username, password }),
  //       }
  //     );

  //     const data = await response.json();

  //     if (response.ok && data.match) {
  //       // Step 1: optionally set basic info. Tokens are in HttpOnly cookies; just store user in context
  //       authLogin({
  //         username: data.username,
  //         role: data.role,
  //         name: data.name,
  //         official_id: data.official_id,
  //       });

  //       // Step 2: fetch the full user info including profile photo
  //       try {
  //         const meRes = await api.get("/api/auth/me/"); // Ensure CSRF cookie is set if needed
  //         if (meRes.data?.authenticated && meRes.data.user) {
  //           authLogin(meRes.data.user); // update context with full user object including of_photo
  //         }
  //       } catch (err) {
  //         console.error("Failed to fetch full user info:", err);
  //       }

  //       setMessage(`Welcome, ${data.name} (${data.role})`);

  //       const role = (data.role || "").toLowerCase();
  //       if (role === "social worker") navigate("/social_worker");
  //       else if (role === "nurse") navigate("/nurse");
  //       else if (role === "psychometrician") navigate("/psychometrician");
  //       else if (role === "dswd") navigate("/dswd");
  //     } else {
  //       setBackendErrors({
  //       username: "Incorrect username",
  //       password: "Incorrect password",
  //   });
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setMessage("Server error. Try again later.");
  //   }
  // };

  useEffect(() => {
    const checkDSWD = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/check-dswd/");
        const data = await res.json();
        if (!data.dswd_exists) {
          // Automatically trigger RegisterUser modal for DSWD
          setAutoDSWDRegister(true);
          setShowRegisterModal(true);
        }
      } catch (err) {
        console.error("Failed to check DSWD:", err);
      }
    };

    checkDSWD();
  }, []);

  const [animateIn, setAnimateIn] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.openRegister) {
      setShowRegisterModal(true);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-r from-[#fff8f4] via-[#fff4ef] to-[#ffd5b8] overflow-hidden">
      {/* Orange Curved Background on the Right */}
      <div className="absolute right-0 top-0 h-full w-[55%] bg-gradient-to-br from-[#FFBD59] to-[#fcae4e] rounded-l-[120px] shadow-2xl"></div>

      <div className="flex items-center justify-center py-8 sm:py-12 px-4 relative z-10">
        {/* MAIN LOGIN CONTAINER */}
        <div className="relative w-full max-w-6xl h-auto sm:h-[600px] grid grid-cols-1 sm:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* CLOSE BUTTON inside container */}
          <button
            onClick={() => {
              setAnimateOut(true);
              setTimeout(() => {
                navigate("/");
              }, 700);
            }}
            className="absolute top-4 right-4 text-gray-600 text-2xl font-bold hover:text-red-500 transition-colors z-20"
          >
            ✕
          </button>

          {/* LEFT SECTION */}
          <div
            className={`bg-white text-[#1a1a1a] flex flex-col justify-center items-start px-8 sm:px-12 py-8 transition-transform duration-700 ${animateOut ? "-translate-x-full" : animateIn ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div key={currentSlide} className="w-full max-w-3xl text-left space-y-8">
              <h2 className="text-5xl font-extrabold leading-tight text-[#292D96] drop-shadow-sm">
                {slides[currentSlide].title.split(" ").map((word, i) =>
                  word.toLowerCase().includes("vawsafe") ? (
                    <span key={i} className="text-orange-500 underline uppercase">{word} </span>
                  ) : (
                    <span key={i}>{word} </span>
                  )
                )}
              </h2>

              <p className="text-gray-700 text-lg leading-relaxed font-medium">
                {slides[currentSlide].desc}
              </p>

              <button
                onClick={() => {
                  setCurrentSlide((prev) => (prev + 1) % slides.length);
                  clearInterval(slideTimerRef.current);
                  slideTimerRef.current = setInterval(() => {
                    setCurrentSlide((prev) => (prev + 1) % slides.length);
                  }, 5000);
                }}
                className="px-7 py-3 bg-[#292D96] text-white text-lg font-semibold rounded-lg shadow-md hover:bg-[#1f1f80] transition"
              >
                Next
              </button>
            </div>
          </div>

          {/* RIGHT LOGIN CARD */}
          <div
            className={`bg-white/10 backdrop-blur-md flex flex-col justify-center items-center px-10 py-12 transform transition-transform duration-700 ${animateOut
              ? "translate-x-full"
              : animateIn
                ? "translate-x-0"
                : "translate-x-full"
              }`}
          >
            {!showCamera ? (
              <>
                {/* Header */}
                <h2 className="text-4xl font-bold text-[#292D96] mb-2">Log in</h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleManualLogin();
                  }}
                  className="w-[320px] flex flex-col items-center gap-4 mt-6"
                >
                  {/* Username */}
                  <div className="relative w-full">
                    <div className="w-full flex items-center px-4 py-3 rounded-full bg-gray-50 border border-gray-200 text-gray-700 shadow-inner">
                      <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
                      <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                        }}
                        className="bg-transparent w-full outline-none placeholder-gray-400"
                      />
                      {(loginErrors.username || backendErrors.username) && (
                        <ExclamationCircleIcon className="absolute right-3 top-2.5 h-5 w-5 text-red-500 animate-shake" />
                      )}
                    </div>
                    {(loginErrors.username || backendErrors.username) && (
                      <p className="text-red-500 text-sm mt-1">
                        {loginErrors.username || backendErrors.username}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="relative w-full">
                    <div className="w-full flex items-center px-4 py-3 rounded-full bg-gray-50 border border-gray-200 text-gray-700 shadow-inner">
                      <LockClosedIcon className="w-5 h-5 text-gray-500 mr-2" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                        }}
                        className="bg-transparent w-full outline-none placeholder-gray-400"
                      />
                      {(loginErrors.password || backendErrors.password) && (
                        <ExclamationCircleIcon className="absolute right-3 top-2.5 h-5 w-5 text-red-500 animate-shake" />
                      )}
                    </div>
                    {(loginErrors.password || backendErrors.password) && (
                      <p className="text-red-500 text-sm mt-1">
                        {loginErrors.password || backendErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Login Buttons */}
                  <button
                    type="submit"
                    className="w-full py-3 mt-2 text-base bg-gradient-to-r from-[#ff8a00] to-[#ff4b2b] text-white font-semibold rounded-full shadow-md hover:scale-105 transition-transform"
                  >
                    Log in with Username
                  </button>
                  <button
                    type="button"
                    onClick={handleFaceLogin}
                    disabled={loading}
                    className="w-full py-3 mt-2 text-base bg-gradient-to-r from-[#ff8a00] to-[#ff4b2b] text-white font-semibold rounded-full shadow-md hover:scale-105 transition-transform"
                  >
                    {loading ? "Checking liveness..." : "Log in with Face"}
                  </button>
                </form>
              </>
            ) : (
              // CAMERA SECTION 
              <div className="flex flex-col items-center text-center">
                <div className="relative h-[300px] w-[300px] rounded-2xl overflow-hidden shadow-xl border-4 border-orange-400">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="h-full w-full object-cover"
                  />
                  {showCounter && countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <h1 className="text-white text-[64px] font-bold drop-shadow-md animate-pulse">
                        {countdown}
                      </h1>
                    </div>
                  )}
                </div>


                {message && (
                  <p
                    className={`mt-4 text-sm font-medium ${loading
                      ? "text-white animate-pulse"
                      : blinkCaptured ||
                        (typeof message === "string" &&
                          message.includes("✅"))
                        ? "text-green-400"
                        : message === "No blink detected. Please blink clearly."
                          ? "text-red-400"
                          : "text-white"
                      }`}
                  >
                    {message}
                  </p>
                )}

                <div className="mt-6 flex flex-col sm:flex-row sm:gap-6 gap-4 items-center">
                  {!loading &&
                    (message === "No blink detected. Please blink clearly." ||
                      (typeof message === "string" &&
                        message.includes(""))) && (
                      <button
                        onClick={handleFaceLogin}
                        className="w-44 py-2 bg-red-500 text-white font-semibold rounded-full shadow hover:bg-red-600 transition"
                      >
                        Retry
                      </button>
                    )}
                  <button
                    onClick={() => {
                      loginCancelledRef.current = true;
                      setShowCamera(false);
                      setMessage("");
                      setCountdown(3);
                      setLoading(false);
                    }}
                    className="w-44 py-2 bg-gray-500 text-white font-semibold rounded-full shadow hover:bg-gray-600 transition"
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
                        Welcome,{" "}
                        {welcomeData.name ||
                          `${welcomeData.fname} ${welcomeData.lname}`}
                      </h3>
                      <p className="text-sm mt-1">
                        You're now signed in as{" "}
                        <strong>{welcomeData.role}</strong>. Let's get started.
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
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterUser
          onClose={() => {
            setShowRegisterModal(false);
            setAutoDSWDRegister(false);
          }}
          defaultRole={autoDSWDRegister ? "DSWD" : "Social Worker"}
        // defaultRole="DSWD" // always set "DSWD" as default role
        />
      )}
    </div>

  );
};

export default LoginPage;
