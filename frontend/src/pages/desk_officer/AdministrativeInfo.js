import { useState } from "react";

const AdministrativeInfo = () => {
  const [reportType, setReportType] = useState("");

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800">
        Administrative Information
      </h2>

      <div className="">
        <input
          className="input"
          type="text"
          placeholder="Handling Organization"
          //   onChange={(e) => setFirstName(e.target.value)}
        ></input>
        <input
          className="input"
          type="text"
          placeholder="Office Address"
          //   onChange={(e) => setFirstName(e.target.value)}
        ></input>

        <select
          className="input"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value={"Reported by the victim-survivor"}>
            Reported by the victim-survivor
          </option>
          <option
            value={
              "Reported by victim-survivor's companion and victim-survivor is present"
            }
          >
            Reported by victim-survivor's companion and victim-survivor is
            present
          </option>
          <option
            value={
              "Reported by informant and victim-survivor is not present at reporting"
            }
          >
            Reported by informant and victim-survivor is not present at
            reporting
          </option>
        </select>

        <div></div>
      </div>
    </div>
  );
};

export default AdministrativeInfo;
