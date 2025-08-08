export default function IncidentInfo() {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
        Incident Information
      </h2>

      {/* form */}
      <input type="text" placeholder="Details of the incident"></input>
      <input type="date" placeholder="Date of the Incident"></input>
      <input
        type="text"
        placeholder="Geographic Location of the Incident"
      ></input>
      <select className="input">
        <option value="">Type of Place of Incident</option>
        <option value="Conjugal Home">Conjugal Home</option>
        <option value="Victim's Home">Victim's Home</option>
        <option value="Perpetrator's Home">Perpetrator's Home</option>
        <option value="Malls/Hotels">Malls/Hotels</option>
        <option value="School">School</option>
        <option value="Workplace">Workplace</option>
        <option value="Public Utility Vehicle (PUV)">
          Public Utility Vehicle (PUV)
        </option>
        <option value="Evacuation area">Evacuation area</option>
        <option value="Others">Others</option>
      </select>

      {/* add a invisible input field that becomes visible when 'others' is selected to specify what type of place where incident happened */}

      <div className="flex items-center space-x-2">
        <span>Was the incident perpetuated via electronic means?</span>
        <input
          type="checkbox"
          //   checked={isDisplaced}
          //   onChange={(e) => setIsDisplaced(e.target.checked)}
        />
      </div>

      {/* add a invisible input field that becomes visible when 'no' is selected to specify electronic means */}

      <div className="flex items-center space-x-2">
        <span>
          Was the incident a result of a harmful traditional practice?
        </span>
        <input
          type="checkbox"
          //   checked={isDisplaced}
          //   onChange={(e) => setIsDisplaced(e.target.checked)}
        />
      </div>

      {/* add a invisible input field that becomes visible when 'no' is selected to specify what type of practice */}

      
    </div>
  );
}
