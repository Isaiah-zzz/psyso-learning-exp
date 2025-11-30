import React from "react";
import { Button } from "../components/Button";

export function Debrief({ next }) {
  return (
    <div className="mt-3 sm:mt-5 p-20 max-w-4xl mx-auto">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
        Experiment Debrief
      </h3>
      <div className="mt-2 mb-6 space-y-4">
        <p className="text-sm text-gray-500">
          Thank you for participating in this study on learning by teaching. 
          This experiment investigates how the expectation of teaching affects learning outcomes.
        </p>
        <p className="text-sm text-gray-500">
          You will now proceed through several stages:
        </p>
        <ul className="text-sm text-gray-500 list-disc list-inside space-y-2 ml-4">
          <li>An AI chatbot will teach you about the Doppler Effect</li>
          <li>You will have the opportunity to teach the material back</li>
          <li>You will complete a comprehension quiz</li>
        </ul>
        <p className="text-sm text-gray-500 mt-4">
          Please pay attention to the material and do your best. The entire experiment 
          should take approximately 15-20 minutes.
        </p>
      </div>
      <Button handleClick={next} autoFocus>
        <p>Begin Experiment</p>
      </Button>
    </div>
  );
}

