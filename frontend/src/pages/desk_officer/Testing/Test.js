import React, { useState } from "react";
import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";

export default function Test() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const next = () => setCurrentStep((prev) => prev + 1);
  const back = () => setCurrentStep((prev) => prev - 1);
  const cancel = () => {
    alert("Form cancelled!");
    setFormData({});
    setCurrentStep(1);
  };
  const submit = () => {
    alert("Form submitted! " + JSON.stringify(formData, null, 2));
    setFormData({});
    setCurrentStep(1);
  };

  switch (currentStep) {
    case 1:
      return (
        <Page1
          formData={formData}
          setFormData={setFormData}
          next={next}
          cancel={cancel}
        />
      );
    case 2:
      return (
        <Page2
          formData={formData}
          setFormData={setFormData}
          next={next}
          back={back}
        />
      );
    case 3:
      return (
        <Page3
          formData={formData}
          setFormData={setFormData}
          back={back}
          cancel={cancel}
          submit={submit}
        />
      );
    default:
      return null;
  }
}
