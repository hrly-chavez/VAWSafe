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
import * as faceapi from "face-api.js";
import CryptoJS from "crypto-js";


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
  const [faceReady, setFaceReady] = useState(false);   // face is centered enough
  const [checkingFace, setCheckingFace] = useState(false); // pre-countdown phase
  const faceStableSinceRef = useRef(null);
  const lastFaceSeenRef = useRef(0);
  const [blinkCaptured, setBlinkCaptured] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Keep a ref to track cancellation
  const loginCancelledRef = useRef(false);

  //para sa rememberme
  const [rememberMe, setRememberMe] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);



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
    const loadModels = async () => {
      const MODEL_URL = "/models"; 
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);

  useEffect(() => {
    slideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // every 5 seconds

    return () => clearInterval(slideTimerRef.current);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("rememberMe");
    if (stored) {
      const { username: savedUsername, password: savedPassword } = JSON.parse(stored);
      setUsername(savedUsername);
      const decryptedPassword = CryptoJS.AES.decrypt(savedPassword, 'secret-key').toString(CryptoJS.enc.Utf8);
      setPassword(decryptedPassword);
      setRememberMe(true);
    }
  }, []);
  const setMessageSafe = (text) => {
        setMessage(prev => (prev === text ? prev : text));
      };

  const resetFaceLoginForRetry = () => {
    faceStableSinceRef.current = null;
    setFaceReady(false);
    setCheckingFace(false);
    setShowCounter(false);
    setBlinkCaptured(false);
    setCountdown(3);
    setLoading(false);
  };
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


  const handleFaceLogin = () => {
    loginCancelledRef.current = false;

    setShowCamera(true);

    // start face positioning phase
    setCheckingFace(true);
    setFaceReady(false);

    // reset UI state
    setShowCounter(false);
    setLoading(false);
    setBlinkCaptured(false);
    setCountdown(3);

    setMessage("Position your face properly in front of the camera.");
  };
  
  useEffect(() => {
    if (!showCamera || !checkingFace) return;

    const interval = setInterval(async () => {
      const video = webcamRef.current?.video;
      if (!video || video.readyState !== 4) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;

      const detection = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );

      //  NO FACE
      if (!detection) {
        const now = Date.now();

        // allow brief detection drops (e.g. head turn)
        if (now - lastFaceSeenRef.current < 800) {
          return;
        }

        faceStableSinceRef.current = null;
        setFaceReady(false);
        setMessageSafe ("No face detected. Please look at the camera.");
        return;
      }
      lastFaceSeenRef.current = Date.now();
      const { x, y, width, height } = detection.box;
      
      // FACE CENTER CHECK (with direction hints)
      const faceCenterX = x + width / 2;
      const faceCenterY = y + height / 2;

      const dx = faceCenterX - vw / 2;
      const dy = faceCenterY - vh / 2;

      const toleranceX = vw * 0.2; // 20%
      const toleranceY = vh * 0.2;

      if (Math.abs(dx) > toleranceX || Math.abs(dy) > toleranceY) {
        faceStableSinceRef.current = null;
        setFaceReady(false);

        // Horizontal guidance
        if (Math.abs(dx) > toleranceX) {
          if (dx > 0) {
            setMessageSafe("Move your face slightly to the left.");
          } else {
            setMessageSafe("Move your face slightly to the right.");
          }
          return;
        }

        // Vertical guidance
        if (Math.abs(dy) > toleranceY) {
          if (dy > 0) {
            setMessageSafe("Move your face slightly up.");
          } else {
            setMessageSafe("Move your face slightly down.");
          }
          return;
        }
      }

      //  FACE SIZE CHECK (distance)
      const faceWidthRatio = width / vw;

      if (faceWidthRatio < 0.25) {
        faceStableSinceRef.current = null;
        setFaceReady(false);
        setMessageSafe("Move closer to the camera.");
        return;
      }

      //  FACE OK → START STABILITY TIMER
      if (!faceStableSinceRef.current) {
        faceStableSinceRef.current = Date.now();
        setMessageSafe("Face detected. Please hold still.");
        return;
      }

      const elapsed = Date.now() - faceStableSinceRef.current;
      if (elapsed >= 1500 && !faceReady) {
        setFaceReady(true);
        setMessageSafe("Face positioned correctly. Preparing scan...");
      }

    }, 300);

    return () => clearInterval(interval);
  }, [showCamera, checkingFace, faceReady]);

  useEffect(() => {
    if (!faceReady || !checkingFace) return;

    const startCountdown = async () => {
      setCheckingFace(false);
      setShowCounter(true);
      setLoading(true);

      //  Countdown 3 → 2 → 1
      for (let i = 3; i > 0; i--) {
        if (loginCancelledRef.current) return;
        setCountdown(i);
        await delay(1000);
      }

      setCountdown(null);
      setMessage(
        <div className="flex items-center gap-2 text-blue-700 text-lg">
          <EyeIcon className="w-5 h-5 text-blue-700" />
          <span>Capturing frames... Please blink now!</span>
        </div>
      );

      //  Capture frames
      const frames = await captureBurstFrames();
      if (loginCancelledRef.current) return;

      if (!frames || frames.length === 0) {
        setMessage("No face detected. Please position your face clearly in front of the camera.");
        setLoading(false);
        return;
      }

      //  Blink check
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
          }
        );

        if (loginCancelledRef.current) return;
        const blinkData = await blinkRes.json();

        if (!blinkRes.ok || !blinkData.blink) {
          setMessage(blinkData.message || "No blink detected. Please try again.");
          resetFaceLoginForRetry();
          return;
        }

        setBlinkCaptured(true);
        setMessage(
          <div className="flex items-center gap-2 text-green-600 text-lg">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Blink captured. Now verifying face...</span>
          </div>
        );

        //  Face login
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
          }
        );

        if (loginRes.status === 429) {
          setMessage("Too many attempts. Please wait and try again.");
          setLoading(false);
          return;
        }

        if (loginRes.status === 423) {
          setMessage("Account temporarily locked. Contact administrator.");
          setLoading(false);
          return;
        }

        if (loginCancelledRef.current) return;

        const loginData = await loginRes.json();
        setLoading(false);

        if (loginRes.ok && loginData.match) {
          authLogin({
            username: loginData.username,
            role: loginData.role,
            name: loginData.name,
            official_id: loginData.official_id,
          });

          try {
            const meRes = await api.get("/api/auth/me/");
            if (meRes.data?.authenticated && meRes.data.user) {
              authLogin(meRes.data.user);
            }
          } catch (err) {
            console.error("Failed to fetch full user info:", err);
          }

          setWelcomeData({
            name: loginData.name,
            role: loginData.role,
            username: loginData.username,
            official_id: loginData.official_id,
          });
          setShowWelcomeCard(true);

          const role = (loginData.role || "").toLowerCase();
          setTimeout(() => {
            if (role === "dswd") navigate("/dswd");
            else if (role === "social worker") navigate("/social_worker");
            else if (role === "nurse") navigate("/nurse");
            else if (role === "psychometrician") navigate("/psychometrician");
            else navigate("/login");
          }, 5000);
        } else {
          setMessage(loginData.message || "Face verification failed.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Server error. Please try again.");
        setLoading(false);
      }
    };

    startCountdown();
  }, [faceReady, checkingFace]);



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
        // const response = await apiFetch("http://192.168.254.199:8000/api/auth/manual-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // 🔹 Handle blocked IP or locked user
      if (response.status === 429) {
        setBackendErrors({ username: "", password: "Too many attempts. Please wait and try again." });
        setLoading(false);
        return;
      }
      if (response.status === 423) {
        setBackendErrors({ username: "", password: "Account temporarily locked. Contact administrator." });
        setLoading(false);
        return;
      }


      // Only parse JSON if not blocked
      const data = await response.json();

      if (response.ok && data.match) {
        authLogin({
          username: data.username,
          role: data.role,
          name: data.name,
          official_id: data.official_id,
        });

        // Store credentials if Remember Me is checked
        if (rememberMe) {
          // Retrieve existing saved accounts
          const saved = JSON.parse(localStorage.getItem("rememberMeList")) || [];

          // Encrypt password
          const encryptedPassword = CryptoJS.AES.encrypt(password, 'secret-key').toString();

          // Check if username already exists
          const existsIndex = saved.findIndex(u => u.username === username);

          if (existsIndex > -1) {
            saved[existsIndex].password = encryptedPassword;
          } else {
            saved.push({ username, password: encryptedPassword });
          }

          // Save updated list
          localStorage.setItem("rememberMeList", JSON.stringify(saved));
        } else {
          // Optional: remove this account from list if unchecked
          const saved = JSON.parse(localStorage.getItem("rememberMeList")) || [];
          const updated = saved.filter(u => u.username !== username);
          localStorage.setItem("rememberMeList", JSON.stringify(updated));
        }

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
        else if (role === "nurse") navigate("/nurse");
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


  useEffect(() => {
    const checkDSWD = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/check-dswd/");
        // const res = await fetch("http://192.168.254.199:8000/api/auth/check-dswd/");
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
                          const val = e.target.value;
                          setUsername(val);

                          // Filter saved usernames
                          const saved = JSON.parse(localStorage.getItem("rememberMeList")) || [];
                          const matches = saved.filter((u) => u.username.toLowerCase().includes(val.toLowerCase()));
                          setUsernameSuggestions(matches);
                          setShowSuggestions(matches.length > 0);
                        }}
                        onFocus={() => {
                          // Show suggestions if username exists
                          const saved = JSON.parse(localStorage.getItem("rememberMeList")) || [];
                          const matches = saved.filter((u) => u.username.toLowerCase().includes(username.toLowerCase()));
                          setUsernameSuggestions(matches);
                          setShowSuggestions(matches.length > 0);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 150); // delay to allow click
                        }}
                        className="bg-transparent w-full outline-none placeholder-gray-400"
                      />
                      {(loginErrors.username || backendErrors.username) && (
                        <ExclamationCircleIcon className="absolute right-3 top-2.5 h-5 w-5 text-red-500 animate-shake" />
                      )}
                    </div>
                    {showSuggestions && usernameSuggestions.length > 0 && (
                      <ul className="absolute w-full bg-white border border-gray-200 rounded shadow-md max-h-40 overflow-y-auto z-50">
                        {usernameSuggestions.map((item, i) => (
                          <li
                            key={i}
                            onClick={() => {
                              setUsername(item.username);
                              setPassword(CryptoJS.AES.decrypt(item.password, 'secret-key').toString(CryptoJS.enc.Utf8));
                              setShowSuggestions(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                          >
                            {item.username}
                          </li>
                        ))}
                      </ul>
                    )}
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

                  {/* Remember Me */}
                  <div className="flex items-center gap-2 w-full mt-2 pl-4">
                    <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gray-50 border border-gray-200 shadow-inner">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 accent-gray-400 cursor-pointer"
                      />
                    </div>
                    <label className="text-xs text-gray-400 cursor-pointer">
                      Remember Me
                    </label>
                    {rememberMe && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        Saved
                      </span>
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

                {/* Countdown overlay */}
                {showCounter && countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
                    <h1 className="text-white text-[64px] font-bold drop-shadow-md animate-pulse">
                      {countdown}
                    </h1>
                  </div>
                )}
              </div>



                {message && (
                <p
                  className={`mt-4 text-sm font-medium ${
                    loading
                      ? "text-white animate-pulse"
                      : blinkCaptured
                      ? "text-green-400"
                      : message.toString().toLowerCase().includes("no")
                      ? "text-red-400"
                      : message.toString().toLowerCase().includes("move") ||
                        message.toString().toLowerCase().includes("center")
                      ? "text-yellow-400"
                      : "text-white"
                  }`}
                >
                  {message}
                </p>
              )}


                <div className="mt-6 flex flex-col sm:flex-row sm:gap-6 gap-4 items-center">
                  {!loading && !checkingFace && !showCounter && (
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
                      faceStableSinceRef.current = null;
                      setShowCamera(false);
                      setCheckingFace(false);
                      setFaceReady(false);
                      setShowCounter(false);
                      setBlinkCaptured(false);
                      setCountdown(3);
                      setLoading(false);
                      setMessage("");
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
      {
        showRegisterModal && (
          <RegisterUser
            onClose={() => {
              setShowRegisterModal(false);
              setAutoDSWDRegister(false);
            }}
            defaultRole={autoDSWDRegister ? "DSWD" : "Social Worker"}
          // defaultRole="DSWD" // always set "DSWD" as default role
          />
        )
      }
    </div >

  );
};

export default LoginPage;
