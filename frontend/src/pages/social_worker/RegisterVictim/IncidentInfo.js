//src/pages/desk_officer/RegisterVictim/IncidentInfo.js
import { useState, useEffect } from "react";
import axios from "axios";

export const PHYSICAL_DESCRIPTION_OPTIONS = [
    { key: "dirty_looking", label: "Dirty looking" },
    { key: "skin_disease", label: "With skin disease" },
    { key: "light_skin", label: "Light skin" },
    { key: "small_build", label: "Small in build" },
    { key: "medium_build", label: "Medium build" },
    { key: "big_build", label: "Big build" },
    { key: "thin", label: "Thin" },
    { key: "average_weight", label: "Average in weight" },
    { key: "obese", label: "Obese" },
  ];

export const MANNER_TOWARDS_WORKER_OPTIONS = [
  { key: "friendly", label: "Friendly and easily relates" },
  { key: "aggressive", label: "Aggressive" },
  { key: "keeps_to_herself", label: "Keeps to herself" },
  { key: "happy_disposition", label: "Happy disposition" },
  { key: "shy", label: "Shy" },
  { key: "energetic", label: "Energetic" },
  { key: "crying", label: "Crying" },
  { key: "apathetic", label: "Apathetic" },
  { key: "aloof", label: "Aloof" },
];

export default function IncidentInfo({ formDataState, setFormDataState }) {
  const VIOLENCE_OPTIONS = {
    "Physical Violence": [],
    "Physical Abused": ["Rape", "Acts of lasciviousness", "Incest"],
    "Psychological Violence": [],
    "Psychological Abuse": [],
    "Economic Abused": [
      "withdraw of financial support",
      "deprivation of threat and deprivation of financial resources",
      "destroying household property",
      "controlling the victims own money",
    ],
    Strandee: [],
    "Sexually Abused": [
      "Incest",
      "Rape",
      "Acts of Lasciviousness",
      "Sexual Harrassment",
      "Others",
    ],
    "Sexually Exploited": [
      "Prostituted",
      "Illegally Recruited",
      "Pornography",
      "Victim of Human Trafficking",
      "Others",
    ],
  };

  useEffect(() => {
    setFormDataState(prev => ({
      ...prev,
      physical_description: prev.physical_description || {},
      physical_description_other: prev.physical_description_other || "",
      manner_towards_worker: prev.manner_towards_worker || {},
      manner_towards_worker_other: prev.manner_towards_worker_other || ""
    }));
  }, []);


  const handleChange = (field, value) => {
    setFormDataState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    handleChange("selectedProvince", value);
  };

  const handleMunicipalityChange = (value) => {
    setSelectedMunicipality(value);
    handleChange("selectedMunicipality", value);
  };

  const handleBarangayChange = (value) => {
    setSelectedBarangay(value);
    handleChange("selectedBarangay", value);
  };

  const handleSitioChange = (value) => {
    setSitio(value);
    handleChange("sitio", value);
  };

  const handleStreetChange = (value) => {
    setStreet(value);
    handleChange("street", value);
  };

  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");

  const [sitio, setSitio] = useState("");
  const [street, setStreet] = useState("");

  // Fetch provinces
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/desk_officer/provinces/")
      .then((res) => setProvinces(res.data)) // <-- store provinces
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Fetch municipalities based on selected province
  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(
          `http://localhost:8000/api/desk_officer/provinces/${selectedProvince}/municipalities/`
        )
        .then((res) => setMunicipalities(res.data))
        .catch((err) => console.error("Failed to load municipalities:", err));
    } else {
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [selectedProvince]);

  // Fetch barangays based on selected municipality
  useEffect(() => {
    if (selectedMunicipality) {
      axios
        .get(
          `http://localhost:8000/api/desk_officer/municipalities/${selectedMunicipality}/barangays/`
        )
        .then((res) => setBarangays(res.data))
        .catch((err) => console.error("Failed to load barangays:", err));
    } else {
      setBarangays([]);
    }
  }, [selectedMunicipality]);

  // Toggle helpers: clear dependent fields when flag is false
  const toggleElectronic = (checked) => {
    setFormDataState((prev) => ({
      ...prev,
      is_via_electronic_means: checked,
      electronic_means: checked ? prev.electronic_means || "" : "",
    }));
  };

  const toggleConflict = (checked) => {
    setFormDataState((prev) => ({
      ...prev,
      is_conflict_area: checked,
      conflict_area: checked ? prev.conflict_area || "" : "",
    }));
  };

  const toggleCalamity = (checked) => {
    setFormDataState((prev) => ({
      ...prev,
      is_calamity_area: checked,
      calamity_type: checked ? prev.calamity_type || "" : "",
    }));
  };

  const inputStyle =
    "px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide">
        Incident Information
      </h2>

      {/* Violence Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type Of Violence
        </label>
        <select
          className="input"
          value={formDataState.violence_type || ""}
          onChange={(e) => handleChange("violence_type", e.target.value)}
        >
          <option value="">Select</option>
          {Object.keys(VIOLENCE_OPTIONS).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Violence Subtype */}
      {formDataState.violence_type &&
        VIOLENCE_OPTIONS[formDataState.violence_type]?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Violence Subtype
            </label>
            <select
              className="input"
              value={formDataState.violence_subtype || ""}
              onChange={(e) => handleChange("violence_subtype", e.target.value)}
            >
              <option value="">Select</option>
              {VIOLENCE_OPTIONS[formDataState.violence_type].map((subtype) => (
                <option key={subtype} value={subtype}>
                  {subtype}
                </option>
              ))}
            </select>
          </div>
        )}

      {/* physical description */}
      <div className="mt-6">
        <h2 className="font-semibold text-lg">Physical Description</h2>

        {PHYSICAL_DESCRIPTION_OPTIONS.map(item => (
          <label key={item.key} className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              checked={formDataState.physical_description?.[item.key] || false}
              onChange={(e) => {
                const checked = e.target.checked;

                setFormDataState(prev => ({
                  ...prev,
                  physical_description: {
                    ...prev.physical_description,
                    [item.key]: checked,
                  }
                }));
              }}
            />
            {item.label}
          </label>
        ))}

        {/* OTHER FIELD */}
        <div className="mt-3">
          <label className="block">Others (specify):</label>
          <input
            type="text"
            className="border rounded p-2 w-full"
            value={formDataState.physical_description_other || ""}
            onChange={(e) =>
              setFormDataState(prev => ({
                ...prev,
                physical_description_other: e.target.value
              }))
            }
          />
        </div>
      </div>

      {/* manner towards worker */}
      <div className="mt-6">
        <h2 className="font-semibold text-lg">Manner of relating to Social Worker</h2>

        {MANNER_TOWARDS_WORKER_OPTIONS.map(item => (
          <label key={item.key} className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              checked={formDataState.manner_towards_worker?.[item.key] || false}
              onChange={(e) => {
                const checked = e.target.checked;

                setFormDataState(prev => ({
                  ...prev,
                  manner_towards_worker: {
                    ...prev.manner_towards_worker,
                    [item.key]: checked,
                  }
                }));
              }}
            />
            {item.label}
          </label>
        ))}

        {/* OTHER FIELD */}
        <div className="mt-3">
          <label className="block">Others (specify):</label>
          <input
            type="text"
            className="border rounded p-2 w-full"
            value={formDataState.manner_towards_worker_other || ""}
            onChange={(e) =>
              setFormDataState(prev => ({
                ...prev,
                manner_towards_worker_other: e.target.value
              }))
            }
          />
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of the Incident
          </label>
          <input
            type="date"
            className="input w-full"
            value={formDataState.incident_date || ""}
            onChange={(e) => handleChange("incident_date", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time of the Incident
          </label>
          <input
            type="time"
            className="input w-full"
            value={formDataState.incident_time || ""}
            onChange={(e) => handleChange("incident_time", e.target.value)}
          />
        </div>
      </div>

      {/* problems presented */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Problem Presented
        </label>
        <textarea
          type="text"
          rows={3}
          className="input w-full"
          onChange={(e) => handleChange("incident_description", e.target.value)}
        ></textarea>
      </div>

      {/* observations about the victim */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SIGNIFICANT OBSERVATION ABOUT THE VICTIM- SURVIVOR: (Physical,
          Behavioral, Strengths, Weakness)
        </label>
        <textarea
          type="text"
          rows={3}
          className="input w-full"
          onChange={(e) => handleChange("incident_observations_about_survivor", e.target.value)}
        ></textarea>
      </div>

      {/* circumstances */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CIRCUMSTANCES/ BACKGROUND SURROUNDING THE PROBLEM:
        </label>
        <textarea
          type="text"
          rows={3}
          className="input w-full"
          onChange={(e) => handleChange("incident_circumstances", e.target.value)}
        ></textarea>
      </div>

      {/* plan of action/ recommendations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PLAN OF ACTION/ RECOMMENDATION:
        </label>
        <textarea
          type="text"
          rows={3}
          className="input w-full"
          onChange={(e) => handleChange("incident_recommendation", e.target.value)}
        ></textarea>
      </div>
    </div>
  );
}
