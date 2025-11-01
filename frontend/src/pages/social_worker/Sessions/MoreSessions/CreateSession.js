//src/pages/social_worker/Sessions/MoreSessions/CreateSession.js
//creating Session 2+

import React from "react";
import { useParams } from "react-router-dom";

const CreateSession = () => {
  const { incident_id } = useParams();
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-600">
        Social Worker - Create More Session
      </h2>
      <p className="text-gray-700 mt-2">Incident ID: {incident_id}</p>
    </div>
  );
};

export default CreateSession;