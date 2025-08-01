import Sidebar from "./SideBar";
import Navbar from "./NavBar";
import { useState, useEffect } from "react";
import Webcam from "react-webcam";

function isMinor(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  const age =
    today.getFullYear() -
    birth.getFullYear() -
    (today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
      ? 1
      : 0);
  return age < 18;
}

export default function DeskOfficerPage() {
  const [victimSurvivors, setVictimSurvivors] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("");
  const [isSogie, setIsSogie] = useState(""); // dropdown value: "Yes", "No", etc.
  const [specificSogie, setSpecificSogie] = useState(""); // user input if "Yes"
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [isMinorVictim, setIsMinorVictim] = useState(false);
  const [guardianFirstName, setGuardianFirstName] = useState("");
  const [guardianMiddleName, setGuardianMiddleName] = useState("");
  const [guardianLastName, setGuardianLastName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");

  useEffect(() => {
    fetchVictimSurvivors();
  }, []);

  useEffect(() => {
    setIsMinorVictim(isMinor(birthDate));
  }, [birthDate]);

  const fetchVictimSurvivors = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/desk_officer/victim_survivors/"
      );
      const data = await response.json();
      setVictimSurvivors(data);
    } catch (err) {
      console.log(err);
    }
  };

  const registerVictimSurvivor = async () => {
    if (!firstName || !lastName || !sex) {
      alert(
        "Please fill out all required fields: First Name, Last Name, and Sex."
      );
      return;
    }

    const victimSurvivorData = {
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      sex: sex,
      is_sogie: isSogie,
      specific_sogie: isSogie === "Yes" ? specificSogie : "",
      birth_date: birthDate,
      birth_place: birthPlace,
      is_minor: isMinorVictim,

      // only send guardian info if victim is minor
      guardian_first_name: isMinorVictim ? guardianFirstName : "",
      guardian_middle_name: isMinorVictim ? guardianMiddleName : "",
      guardian_last_name: isMinorVictim ? guardianLastName : "",
      guardian_contact: isMinorVictim ? guardianContact : "",
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/desk_officer/victim_survivors/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(victimSurvivorData),
        }
      );

      const data = await response.json();
      setVictimSurvivors((prev) => [...prev, data]);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="login-container">
        <p className="login-instruction">Face Recognition Login</p>

        <Webcam
          audio={false}
          height={240}
          // ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={320}
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user",
          }}
        />

        <button
          // onClick={handleFaceLogin}
          className="login-btn"
          style={{ marginTop: "1rem", backgroundColor: "#6C63FF" }}
          // disabled={loading}
        >
          {/* {loading ? "Logging in..." : "Login with Face"} */}
        </button>

        {/* <button className="login-btn" onClick={handleManualLogin}> */}
        <button className="login-btn">Use Other Login</button>

        <div className="opt-act">
          <p
            // onClick={() => navigate("/register")}
            style={{ cursor: "pointer" }}
          >
            Register New User
          </p>
        </div>

        {/* {message && <p style={{ marginTop: "1rem" }}>{message}</p>} */}

        {/* {user && (
          <div style={{ marginTop: "1rem", fontSize: "14px" }}>
            <p>
              <strong>Official ID:</strong> {user.official_id}
            </p>
            <p>
              <strong>Name:</strong> {user.fname} {user.lname}
            </p>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        )} */}
      </div>

      {/* victim survivor information registration starts here */}
      <input
        type="text"
        placeholder="First Name"
        onChange={(e) => {
          setFirstName(e.target.value);
        }}
      />

      <input
        type="text"
        placeholder="Middle Name"
        onChange={(e) => {
          setMiddleName(e.target.value);
        }}
      />

      <input
        type="text"
        placeholder="Last Name"
        onChange={(e) => {
          setLastName(e.target.value);
        }}
      />

      <select value={sex} onChange={(e) => setSex(e.target.value)}>
        <option value="">Select Sex</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <label>SOGIE?</label>
      <select value={isSogie} onChange={(e) => setIsSogie(e.target.value)}>
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
        <option value="Does not want to identify">
          Does not want to identify
        </option>
      </select>

      {isSogie === "Yes" && (
        <input
          type="text"
          placeholder="Please specify"
          value={specificSogie}
          onChange={(e) => setSpecificSogie(e.target.value)}
        />
      )}

      <input
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
      />

      <input
        type="text"
        placeholder="Birth Place"
        onChange={(e) => {
          setBirthPlace(e.target.value);
        }}
      />

      {/* pop up input field if victim is minor */}
      {isMinorVictim && (
        <>
          <input
            type="text"
            placeholder="Guardian First Name"
            onChange={(e) => setGuardianFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Guardian Middle Name"
            onChange={(e) => setGuardianMiddleName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Guardian Last Name"
            onChange={(e) => setGuardianLastName(e.target.value)}
          />
        </>
      )}

      {/* submit form button */}
      <button onClick={registerVictimSurvivor}>Register Victim</button>

      {/* for debugging, show contents inside database */}
      {victimSurvivors.map((victim_survivor) => (
        <div>
          <p>First Name: {victim_survivor.first_name}</p>
          <p>Middle Name: {victim_survivor.middle_name}</p>
          <p>Last Name: {victim_survivor.last_name}</p>
          <p>Sex: {victim_survivor.sex}</p>
          <p>SOGIE: {victim_survivor.is_sogie}</p>
          <p>Specific SOGIE: {victim_survivor.specific_sogie}</p>
          <p>birth date: {victim_survivor.birth_date}</p>
          <p>birth place: {victim_survivor.birth_place}</p>
          <p>Minor: {victim_survivor.is_minor}</p>
          <p>
            Guardian:
            {victim_survivor.guardian_first_name}{" "}
            {victim_survivor.guardian_middle_name}{" "}
            {victim_survivor.guardian_last_name}
          </p>
          <p>Guardian Contact: {victim_survivor.guardian_contact}</p>
        </div>
      ))}
    </div>
  );
}
