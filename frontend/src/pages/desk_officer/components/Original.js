import { useState, useEffect } from "react";
import Sidebar from "./sideBar";
import Navbar from "./navBar";
import AdministrativeInfo from "./AdministrativeInfo";

export default function VictimInfo() {
  function isMinor(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const age =
      today.getFullYear() -
      birth.getFullYear() -
      (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
        ? 1
        : 0);
    return age < 18;
  }

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
  const [childCategory, setChildCategory] = useState("");

  const [civilStatus, setCivilStatus] = useState("");
  const [educationalAttainment, setEducationalAttainment] = useState("");
  const [nationality, setNationality] = useState("");
  const [specificNationality, setSpecificNationality] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [mainOccupation, setMainOccupation] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const [employmentStatus, setEmploymentStatus] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employerAddress, setEmployerAddress] = useState("");

  const [migratoryStatus, setMigratoryStatus] = useState("");
  const [religion, setReligion] = useState("");
  const [specificReligion, setSpecificReligion] = useState("");
  const [isDisplaced, setIsDisplaced] = useState("");
  const [pwd, setPwd] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    fetchVictimSurvivors();
  }, []);

  useEffect(() => {
    setIsMinorVictim(isMinor(birthDate));
  }, [birthDate]);

  const fetchVictimSurvivors = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/desk_officer/victims/"
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
      guardian_first_name: isMinorVictim ? guardianFirstName : "",
      guardian_middle_name: isMinorVictim ? guardianMiddleName : "",
      guardian_last_name: isMinorVictim ? guardianLastName : "",
      guardian_contact: isMinorVictim ? guardianContact : "",
      child_category: isMinorVictim ? childCategory : null,

      civil_status: isMinorVictim ? "Not Applicable" : civilStatus,
      educational_attainment: educationalAttainment,
      nationality: nationality,
      specific_nationality: specificNationality,
      ethnicity: ethnicity,
      main_occupation: mainOccupation,
      monthly_income: monthlyIncome,

      employment_status: employmentStatus,
      employment_type: employmentType,
      employer_name: employerName,
      employer_address: employerAddress,

      migratory_status: migratoryStatus,
      religion: religion,
      specific_religion: specificReligion,
      is_displaced: isDisplaced,
      pwd: pwd,
      contact: contact,
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/desk_officer/victims/register/",
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
    <div className="outline-2">
      <Navbar></Navbar>

      <div className="flex flex-row">
        <Sidebar></Sidebar>

        {/* victim survivor information registration starts here */}
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
          <AdministrativeInfo></AdministrativeInfo>
          <hr></hr>

          <h2 className="text-2xl font-semibold text-gray-800">
            Victim Survivor Information
          </h2>

          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="input"
              type="text"
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              className="input"
              type="text"
              placeholder="Middle Name"
              onChange={(e) => setMiddleName(e.target.value)}
            />
            <input
              className="input"
              type="text"
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Sex + SOGIE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="input"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <select
              className="input"
              value={isSogie}
              onChange={(e) => setIsSogie(e.target.value)}
            >
              <option value="">SOGIE?</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Does not want to identify">
                Does not want to identify
              </option>
            </select>

            {isSogie === "Yes" && (
              <input
                className="input"
                type="text"
                placeholder="Please specify"
                value={specificSogie}
                onChange={(e) => setSpecificSogie(e.target.value)}
              />
            )}
          </div>

          {/* Birth details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <input
              className="input"
              type="text"
              placeholder="Birth Place"
              onChange={(e) => setBirthPlace(e.target.value)}
            />
          </div>

          {/* Minor guardian details */}
          {isMinorVictim && (
            <>
              <h3 className="text-lg font-medium text-gray-700">
                Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="input"
                  type="text"
                  placeholder="Guardian First Name"
                  onChange={(e) => setGuardianFirstName(e.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Guardian Middle Name"
                  onChange={(e) => setGuardianMiddleName(e.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Guardian Last Name"
                  onChange={(e) => setGuardianLastName(e.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Guardian Contact"
                  onChange={(e) => setGuardianContact(e.target.value)}
                />
                <select
                  className="input"
                  value={childCategory}
                  onChange={(e) => setChildCategory(e.target.value)}
                >
                  <option value="">Select Child Category</option>
                  <option value="Orphan">Orphan</option>
                  <option value="Unaccompanied">Unaccompanied</option>
                  <option value="Separated">Separated</option>
                  <option value="Vulnerable">Vulnerable</option>
                </select>
              </div>
            </>
          )}

          {/* Civil status, education, nationality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="input"
              value={civilStatus}
              onChange={(e) => setCivilStatus(e.target.value)}
            >
              <option value="">Civil Status</option>
              <option value="Single">Single</option>
              <option value="Legally Married">Legally Married</option>
              <option value="Consensual/Common Law/Live-in Partner">
                Live-in Partner
              </option>
              <option value="Legally Separated">Legally Separated</option>
              <option value="Separated in fact">Separated in fact</option>
              <option value="Widowed">Widowed</option>
              <option value="Annuled">Annuled</option>
            </select>

            <select
              className="input"
              value={educationalAttainment}
              onChange={(e) => setEducationalAttainment(e.target.value)}
            >
              <option value="">Educational Attainment</option>
              <option value="No formal education">No formal education</option>
              <option value="Elementary level/graduate">Elementary</option>
              <option value="Junior high school level/graduate">
                Junior High
              </option>
              <option value="Senior high school level/graduate">
                Senior High
              </option>
              <option value="Technical/Vocational">Technical/Vocational</option>
              <option value="College level/graduate">College</option>
              <option value="Post graduate">Post graduate</option>
            </select>
          </div>

          {/* Nationality + Ethnicity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="input"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
            >
              <option value="">Nationality</option>
              <option value="Filipino">Filipino</option>
              <option value="Non-Filipino">Non-Filipino</option>
            </select>

            {nationality === "Non-Filipino" && (
              <input
                className="input"
                type="text"
                placeholder="Please specify"
                value={specificNationality}
                onChange={(e) => setSpecificNationality(e.target.value)}
              />
            )}

            <input
              className="input"
              type="text"
              placeholder="Ethnicity"
              onChange={(e) => setEthnicity(e.target.value)}
            />
          </div>
          <hr></hr>
          {/* Occupation, income, employment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="input"
              type="text"
              placeholder="Main Occupation"
              onChange={(e) => setMainOccupation(e.target.value)}
            />
            <input
              className="input"
              type="number"
              placeholder="Monthly Income"
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
          </div>
          <hr></hr>
          <select
            className="input"
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)}
          >
            <option value="">Employment Status</option>
            <option value="Employed">Employed</option>
            <option value="Self-employed">Self-employed</option>
            <option value="Informal Sector">Informal Sector</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Not applicable">Not applicable</option>
          </select>

          {employmentStatus === "Employed" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                className="input"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="">Employment Type</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
              <input
                className="input"
                type="text"
                placeholder="Employer Name"
                onChange={(e) => setEmployerName(e.target.value)}
              />
              <input
                className="input"
                type="text"
                placeholder="Employer Address"
                onChange={(e) => setEmployerAddress(e.target.value)}
              />
            </div>
          )}
          <hr></hr>
          {/* Migratory, Religion, Displaced, PWD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="input"
              value={migratoryStatus}
              onChange={(e) => setMigratoryStatus(e.target.value)}
            >
              <option value="">Migratory Status</option>
              <option value="Current OFW">Current OFW</option>
              <option value="Former/Returning OFW">Former/Returning OFW</option>
              <option value="Seeking employment abroad">Seeking abroad</option>
              <option value="Not applicable">Not applicable</option>
            </select>

            <select
              className="input"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
            >
              <option value="">Religion</option>
              <option value="Roman Catholic">Roman Catholic</option>
              <option value="Islam">Islam</option>
              <option value="Evangelicals">Evangelicals</option>
              <option value="Protestants">Protestants</option>
              <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
              <option value="Others">Others</option>
            </select>

            {religion === "Others" && (
              <input
                className="input"
                type="text"
                placeholder="Specific Religion"
                onChange={(e) => setSpecificReligion(e.target.value)}
              />
            )}

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isDisplaced}
                onChange={(e) => setIsDisplaced(e.target.checked)}
              />
              <span>Is the client internally displaced?</span>
            </label>

            <select
              className="input"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            >
              <option value="">PWD Status</option>
              <option value="None">None</option>
              <option value="Deaf or Hard of Hearing">
                Deaf or Hard of Hearing
              </option>
              <option value="Intellectual Disability">
                Intellectual Disability
              </option>
              <option value="Learning Disability">Learning Disability</option>
              <option value="Mental Disability">Mental Disability</option>
              <option value="Orthopedic Disability">
                Orthopedic Disability
              </option>
              <option value="Physical Disability">Physical Disability</option>
              <option value="Pyschological Disability">
                Psychological Disability
              </option>
              <option value="Speech and Language Disability">
                Speech and Language Disability
              </option>
              <option value="Visual Disability">Visual Disability</option>
            </select>
          </div>

          {/* Contact + Submit */}
          <div className="space-y-4">
            <input
              className="input w-full"
              type="text"
              placeholder="Contact Information"
              onChange={(e) => setContact(e.target.value)}
            />
            <button
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
              onClick={registerVictimSurvivor}
            >
              Register Victim
            </button>
          </div>

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
              <p>Category: {victim_survivor.child_category}</p>
              <p>civil status: {victim_survivor.civil_status}</p>
              <p>Nationality: {victim_survivor.nationality}</p>
              <p>ethnicity: {victim_survivor.ethnicity}</p>
              <p>main occupation: {victim_survivor.main_occupation}</p>
              <p>monthly_income: {victim_survivor.monthly_income}</p>
              <p>migratory_status: {victim_survivor.migratory_status}</p>
              <p>religion: {victim_survivor.religion}</p>
              <p>specific_religion: {victim_survivor.specific_religion}</p>
              <p>is_displaced: {victim_survivor.is_displaced}</p>
              <p>pwd: {victim_survivor.pwd}</p>
              <p>is_displaced: {victim_survivor.is_displaced}</p>
              <p>contact: {victim_survivor.contact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
