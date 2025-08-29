import { useState } from "react";
import { useNavigate } from "react-router-dom";

// pages
import FaceRecog from "./FaceRecog";
import Form2 from "./Form2";
import Form3 from "./Form3";
import Navbar from "../components/navBar";
import Sidebar from "../components/sideBar";

export default function Session() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // button navigation functions
  const next = () => setCurrentStep((prev) => prev + 1);
  const back = () => setCurrentStep((prev) => prev - 1);
  const cancel = () => {
    alert("Form cancelled!");
    // setFormData({});
    setCurrentStep(1);
    // Redirect to another page
    navigate("/desk_officer/"); // replace "/some-page" with your route
  };
  const submit = () => {
    alert("Form submitted! ");
    // alert("Form submitted! " + JSON.stringify(formData, null, 2));
    // setFormData({});
    setCurrentStep(1);
  };

  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <FaceRecog
            // formData={formData}
            // setFormData={setFormData}
            cancel={cancel}
            next={next}
          />
        );
      case 2:
        return (
          <Form2
            // formData={formData}
            // setFormData={setFormData}
            back={back}
            next={next}
          />
        );
      case 3:
        return (
          <Form3
            // formData={formData}
            // setFormData={setFormData}
            back={back}
            cancel={cancel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="outline-2">
      <Navbar />
      <div className="flex flex-row">
        <Sidebar />
        <div className="h-[80vh] overflow-y-auto w-full">
          {/* Main content */}
          {renderForm()}
        </div>
      </div>
    </div>
  );
}
