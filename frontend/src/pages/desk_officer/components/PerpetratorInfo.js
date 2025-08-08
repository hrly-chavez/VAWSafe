export default function PerpetratorInfo() {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
        Alleged Perpetrator Information
      </h2>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="input" type="text" placeholder="First Name" />
          <input className="input" type="text" placeholder="Middle Name" />
          <input className="input" type="text" placeholder="Last Name" />
        </div>
      </div>

      {/* Sex */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sex
        </label>
        <select className="input w-full">
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      {/* Birth Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Birth Details
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="input" type="date" />
          <input className="input" type="text" placeholder="Birth Place" />
        </div>
      </div>

      {/* Guardian Info (for minors) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Guardian Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="input"
            type="text"
            placeholder="Guardian First Name"
          />
          <input
            className="input"
            type="text"
            placeholder="Guardian Middle Name"
          />
          <input
            className="input"
            type="text"
            placeholder="Guardian Last Name"
          />
          <input className="input" type="text" placeholder="Guardian Contact" />
          <select className="input w-full md:col-span-2">
            <option value="">Select Child Category</option>
            <option value="Orphan">Orphan</option>
            <option value="Unaccompanied">Unaccompanied</option>
            <option value="Separated">Separated</option>
            <option value="Vulnerable">Vulnerable</option>
          </select>
        </div>
      </div>

      {/* Nationality */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nationality
        </label>
        <select className="input w-full">
          <option value="">Select Nationality</option>
          <option value="Filipino">Filipino</option>
          <option value="Non-Filipino">Non-Filipino</option>
        </select>
        <input
          className="input mt-2"
          type="text"
          placeholder="Please specify if Non-Filipino"
        />
      </div>

      {/* Occupation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Main Occupation
        </label>
        <input
          className="input w-full"
          type="text"
          placeholder="Main Occupation"
        />
      </div>

      {/* Religion */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Religion
        </label>
        <select className="input w-full">
          <option value="">Religion</option>
          <option value="Roman Catholic">Roman Catholic</option>
          <option value="Islam">Islam</option>
          <option value="Evangelicals">Evangelicals</option>
          <option value="Protestants">Protestants</option>
          <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
          <option value="Others">Others</option>
        </select>
        <input
          className="input mt-2"
          type="text"
          placeholder="Specify if Others"
        />
      </div>

      {/* Relationship to Victim */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Relationship to Victim-Survivor
        </h3>
        <select className="input w-full mb-2">
          <option value="">Select Relationship Category</option>
          <option value="Personal/Family">Personal/Family</option>
          <option value="Persons of Authority">Persons of Authority</option>
          <option value="Others">Others</option>
        </select>

        {/* Conditional: Personal/Family */}
        <select className="input w-full mb-2">
          <option value="">Specify (Personal/Family)</option>
          <option value="Current Spouse">Current Spouse</option>
          <option value="Former Spouse">Former Spouse</option>
          <option value="Current Fiance">Current Fiance</option>
          <option value="Former Fiance">Former Fiance</option>
          <option value="Neighbors/Peers/Coworkers/Classmates">
            Neighbors/Peers/Coworkers/Classmates
          </option>
          <option value="Immediate family members">
            Immediate family members
          </option>
          <option value="Stepfamily members">Stepfamily members</option>
          <option value="Others">Others</option>
        </select>

        {/* Conditional: Persons of Authority */}
        <select className="input w-full mb-2">
          <option value="">Specify (Persons of Authority)</option>
          <option value="Employer/Manager/Supervisor">
            Employer/Manager/Supervisor
          </option>
          <option value="Agent of the employer">Agent of the employer</option>
          <option value="Teacher/instructor/professor">
            Teacher/instructor/professor
          </option>
          <option value="Coach/Trainer">Coach/Trainer</option>
          <option value="Religious leaders/workers">
            Religious leaders/workers
          </option>
          <option value="Community leaders/workers">
            Community leaders/workers
          </option>
        </select>

        {/* Conditional: Others */}
        <select className="input w-full">
          <option value="">Specify (Others)</option>
          <option value="Stranger">Stranger</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      {/* Perpetrator Identity in Conflict/Calamity Area */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Identity in Conflict/Calamity Area
        </h3>
        <select className="input w-full mb-2">
          <option value="">Select Actor Type</option>
          <option value="State Actor">State Actor</option>
          <option value="Non-State Actor">Non-State Actor</option>
        </select>

        {/* If State Actor */}
        <select className="input w-full mb-2">
          <option value="">Specify (State Actor)</option>
          <option value="Government official">Government official</option>
          <option value="Peace and security">Peace and security</option>
        </select>

        {/* If Peace and Security */}
        <select className="input w-full mb-2">
          <option value="">Branch of Security</option>
          <option value="Military">Military</option>
          <option value="Police">Police</option>
          <option value="Paramilitary">Paramilitary</option>
        </select>

        {/* If Non-State Actor */}
        <select className="input w-full">
          <option value="">Specify (Non-State Actor)</option>
          <option value="Insurgent">Insurgent</option>
          <option value="Rebel">Rebel</option>
          <option value="Violent extremist">Violent extremist</option>
          <option value="Militia">Militia</option>
        </select>
      </div>
    </div>
  );
}
