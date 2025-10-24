import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LegalAgreement() {
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  const handleAccept = () => {
    setShowModal(false);
    navigate("/desk_officer/register-victim/form");
  };

  const handleDecline = () => {
    setShowModal(false);
    navigate("/desk_officer"); // or stay on current page
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Terms of Service</h2>
            <p className="text-sm text-gray-700 mb-6">
              Before proceeding, please confirm that you have obtained informed consent and that all data entered will comply with institutional and legal standards.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleDecline}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Accept & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
