import { usePlayer, useStage } from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Button } from "../components/Button";

const quizQuestions = [
  {
    id: 1,
    question: "What is the Doppler Effect?",
    type: "multiple-choice",
    options: [
      "The change in frequency of a wave when the source and observer are moving relative to each other",
      "The bending of light waves around obstacles",
      "The reflection of sound waves off surfaces",
      "The absorption of energy by matter"
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "When a sound source moves toward you, what happens to the frequency you hear?",
    type: "multiple-choice",
    options: [
      "It increases (pitch gets higher)",
      "It decreases (pitch gets lower)",
      "It stays the same",
      "It becomes inaudible"
    ],
    correctAnswer: 0
  },
  {
    id: 3,
    question: "When a sound source moves away from you, what happens to the frequency you hear?",
    type: "multiple-choice",
    options: [
      "It increases (pitch gets higher)",
      "It decreases (pitch gets lower)",
      "It stays the same",
      "It becomes louder"
    ],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Which of the following is a real-world example of the Doppler Effect?",
    type: "multiple-choice",
    options: [
      "A siren on an ambulance sounds higher as it approaches and lower as it moves away",
      "Light bending when it passes through water",
      "Echoes in a canyon",
      "Sound getting louder when you're closer to the source"
    ],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "The Doppler Effect applies to:",
    type: "multiple-choice",
    options: [
      "Only sound waves",
      "Only light waves",
      "Both sound and light waves",
      "Only electromagnetic waves"
    ],
    correctAnswer: 2
  },
  {
    id: 6,
    question: "In astronomy, the Doppler Effect is used to:",
    type: "multiple-choice",
    options: [
      "Measure the temperature of stars",
      "Determine if stars are moving toward or away from Earth",
      "Calculate the age of the universe",
      "Detect black holes"
    ],
    correctAnswer: 1
  },
];

export function Quiz() {
  const player = usePlayer();
  const stage = useStage();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate score
    let correctCount = 0;
    const answerDetails = {};
    
    quizQuestions.forEach((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      answerDetails[q.id] = {
        question: q.question,
        userAnswer: userAnswer !== undefined ? q.options[userAnswer] : "Not answered",
        correctAnswer: q.options[q.correctAnswer],
        isCorrect: isCorrect
      };
      
      if (isCorrect) {
        correctCount++;
      }
    });
    
    const totalQuestions = quizQuestions.length;
    const score = correctCount;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Save answers, score, and details to player stage
    player.stage.set("quizAnswers", answers);
    player.stage.set("quizScore", score);
    player.stage.set("quizTotalQuestions", totalQuestions);
    player.stage.set("quizScorePercentage", scorePercentage);
    player.stage.set("quizAnswerDetails", answerDetails);
    player.stage.set("quizSubmitted", true);
    
    // Also save to player level for easy access
    player.set("quizScore", score);
    player.set("quizTotalQuestions", totalQuestions);
    player.set("quizScorePercentage", scorePercentage);
    
    setSubmitted(true);
    player.stage.set("submit", true);
  };

  if (submitted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Quiz Submitted Successfully
            </h2>
            <p className="text-green-700">
              Thank you for completing the quiz. Your responses have been recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comprehension Test: Doppler Effect
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Please answer the following multiple-choice questions about the Doppler Effect. 
          Select the best answer for each question.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {quizQuestions.map((q) => (
            <div key={q.id} className="border-b border-gray-200 pb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Question {q.id}: {q.question}
              </label>
              <div className="space-y-2">
                {q.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      answers[q.id] === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={index}
                      checked={answers[q.id] === index}
                      onChange={() => handleAnswerChange(q.id, index)}
                      className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <span className="text-sm text-gray-700 flex-1">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-8 mb-4">
            <Button type="submit">
              Submit Quiz
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

