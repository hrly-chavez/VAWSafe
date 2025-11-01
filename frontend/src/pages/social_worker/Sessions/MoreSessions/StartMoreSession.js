//src/pages/social_worker/Sessions/MoreSessions/StartMoreSession.js

import React from "react";
import { useParams } from "react-router-dom";

const StartMoreSession = () => {
  const { sess_id } = useParams();
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-600">
        Social Worker - Start More Session
      </h2>
      <p className="text-gray-700 mt-2">Session ID: {sess_id}</p>
    </div>
  );
};

export default StartMoreSession;