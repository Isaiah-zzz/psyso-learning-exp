import { usePlayer } from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";

const ratingQuestions = [
  "I felt the subject matter was difficult.",
  "I enjoyed learning about the Doppler Effect.",
  "I would like to learn this way in the future.",
  "I feel like I have a good understanding of how the Doppler Effect works.",
  "After this lesson, I would be interested in learning more about the Doppler Effect.",
  "I found the lesson about the Doppler Effect to be useful to me.",
  "I felt stressed while I was learning about the Doppler Effect.",
];

export function ExitSurvey({ next }) {
  const labelClassName = "block text-sm font-medium text-gray-700 my-2";
  const inputClassName =
    "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-empirica-500 focus:border-empirica-500 sm:text-sm";
  const player = usePlayer();

  const [ratings, setRatings] = useState({});
  const [mentalEffort, setMentalEffort] = useState("");
  const [comments, setComments] = useState("");

  const handleRatingChange = (questionIndex, value) => {
    setRatings((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate all ratings are filled
    const allRated = ratingQuestions.every((_, index) => ratings[index] !== undefined && ratings[index] !== "");
    if (!allRated) {
      alert("Please provide a rating for all statements in Part 1.");
      return;
    }
    
    if (!mentalEffort || mentalEffort === "") {
      alert("Please provide a mental effort rating in Part 2.");
      return;
    }
    
    // Convert mental effort to number
    const mentalEffortNum = mentalEffort ? parseInt(mentalEffort, 10) : null;
    
    // Convert ratings to numbers
    const ratingsNum = {};
    Object.keys(ratings).forEach((key) => {
      ratingsNum[key] = parseInt(ratings[key], 10);
    });
    
    // Save all survey data
    const surveyData = {
      part1_ratings: ratingsNum,
      part2_mentalEffort: mentalEffortNum,
      part3_comments: comments || "None",
    };

    // Save to player
    player.set("exitSurvey", surveyData);
    player.set("exitSurveyPart1Ratings", ratingsNum);
    player.set("exitSurveyPart2MentalEffort", mentalEffortNum);
    player.set("exitSurveyPart3Comments", comments || "None");
    player.set("exitSurveyCompleted", true);

    next();
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

      <form
        className="mt-12 space-y-12"
        onSubmit={handleSubmit}
      >
        {/* Part 1: Ratings */}
        <div className="space-y-6 border-b border-gray-200 pb-8">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              Post-Experiment Questionnaire (Part 1 of 3)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please rate how much you agree with the following statements on a scale from <strong>1 (Strongly Disagree)</strong> to <strong>7 (Strongly Agree)</strong>.
            </p>
          </div>

          <div className="space-y-6">
            {ratingQuestions.map((question, index) => (
              <div key={index} className="border-b border-gray-100 pb-4">
                <label className={labelClassName}>
                  {index + 1}. {question}
                </label>
                <div className="flex gap-4 mt-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <label key={value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`rating-${index}`}
                        value={value}
                        checked={ratings[index] === value}
                        onChange={() => handleRatingChange(index, value)}
                        className="mr-1 h-4 w-4 text-empirica-600 focus:ring-empirica-500"
                        required
                      />
                      <span className="text-sm text-gray-700 ml-1">{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2: Mental Effort */}
        <div className="space-y-6 border-b border-gray-200 pb-8">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              Post-Experiment Questionnaire (Part 2 of 3)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              On a scale from <strong>1 (Very low effort)</strong> to <strong>7 (Very high effort)</strong>:
            </p>
            <p className="text-sm font-medium text-gray-700 mb-4">
              How much mental effort did you invest while learning about the Doppler Effect?
            </p>
            <p className="text-xs text-gray-500 mb-4">
              (Please reply with a single number.)
            </p>
          </div>

          <div className="flex gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <label key={value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="mentalEffort"
                  value={value}
                  checked={mentalEffort === value.toString()}
                  onChange={(e) => setMentalEffort(e.target.value)}
                  className="mr-1 h-4 w-4 text-empirica-600 focus:ring-empirica-500"
                  required
                />
                <span className="text-sm text-gray-700 ml-1">{value}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Part 3: Comments */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              Post-Experiment Questionnaire (Part 3 of 3)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please write any additional comments you have about the study. If you have none, type 'None'.
            </p>
          </div>

          <div>
            <label className={labelClassName}>
              Comments:
            </label>
            <textarea
              className={inputClassName}
              dir="auto"
              id="comments"
              name="comments"
              rows={6}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Type your comments here, or 'None' if you have no comments..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <Button type="submit">Submit Survey</Button>
        </div>
      </form>
    </div>
  );
}
