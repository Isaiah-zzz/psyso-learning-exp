import { usePlayer, useStage } from "@empirica/core/player/classic/react";
import React, { useState, useEffect } from "react";
import { Button } from "../components/Button";

const quizQuestions = [
  {
    id: 1,
    title: "Test Question 1 of 6",
    timerMinutes: 3,
    prompt: "Explain how the Doppler Effect works.",
  },
  {
    id: 2,
    title: "Test Question 2 of 6",
    timerMinutes: 2,
    prompt: "How could you increase the intensity of the Doppler Effect?",
  },
  {
    id: 3,
    title: "Test Question 3 of 6",
    timerMinutes: 2,
    prompt: "Would the Doppler Effect occur if the source was stationary and the observer was moving? Why or why not?",
  },
  {
    id: 4,
    title: "Test Question 4 of 6",
    timerMinutes: 2,
    prompt: "What would happen to the Doppler Effect if the observer was moving at the same speed and in the same direction as the source? Explain your answer.",
  },
  {
    id: 5,
    title: "Test Question 5 of 6",
    timerMinutes: 2,
    prompt: "How would an observer experience sound if the speed of the source were traveling faster than the speed of sound?",
  },
  {
    id: 6,
    title: "Test Question 6 of 6",
    timerMinutes: 2,
    prompt: "What would happen to the Doppler Effect if the source and observer were both moving towards each other on a parallel path, at a constant speed? Explain your answer.",
  },
];

function QuestionTimer({ minutes, onComplete }) {
  const [secondsRemaining, setSecondsRemaining] = useState(minutes * 60);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsComplete(true);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete, onComplete]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  if (isComplete) {
    return (
      <div className="text-red-600 font-semibold">
        Time's up!
      </div>
    );
  }

  return (
    <div className="text-gray-600 font-medium">
      Time remaining: {mins}:{secs.toString().padStart(2, "0")}
    </div>
  );
}

export function Quiz() {
  const player = usePlayer();
  const stage = useStage();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [showTransition, setShowTransition] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [questionStartTimes, setQuestionStartTimes] = useState({});
  const [questionEndTimes, setQuestionEndTimes] = useState({});

  useEffect(() => {
    // Record start time for current question
    if (!questionStartTimes[currentQuestion]) {
      setQuestionStartTimes((prev) => ({
        ...prev,
        [currentQuestion]: Date.now(),
      }));
    }
  }, [currentQuestion, questionStartTimes]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextQuestion = () => {
    // Record end time for current question
    const endTime = Date.now();
    const startTime = questionStartTimes[currentQuestion] || endTime;
    const timeSpent = endTime - startTime;

    // Save end time
    setQuestionEndTimes((prev) => ({
      ...prev,
      [currentQuestion]: endTime,
    }));

    // Save answer and timing for current question
    player.stage.set(`quizQ${currentQuestion}Answer`, answers[currentQuestion] || "");
    player.stage.set(`quizQ${currentQuestion}TimeSpent`, timeSpent);
    player.stage.set(`quizQ${currentQuestion}StartTime`, startTime);
    player.stage.set(`quizQ${currentQuestion}EndTime`, endTime);

    if (currentQuestion === quizQuestions.length) {
      // Last question completed - show transition
      setShowTransition(true);
    } else {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleContinueAfterTransition = () => {
    // Save all quiz data
    const quizData = {
      answers: {},
      timings: {},
    };

    quizQuestions.forEach((q) => {
      quizData.answers[q.id] = answers[q.id] || "";
      const startTime = questionStartTimes[q.id] || Date.now();
      const endTime = questionEndTimes[q.id] || Date.now();
      const timeSpent = endTime - startTime;
      
      quizData.timings[q.id] = {
        startTime,
        endTime,
        timeSpent,
      };
    });

    // Save to player stage
    player.stage.set("quizAnswers", quizData.answers);
    player.stage.set("quizTimings", quizData.timings);
    player.stage.set("quizCompleted", true);
    player.stage.set("quizSubmitted", true);

    // Also save to player level
    player.set("quizAnswers", quizData.answers);
    player.set("quizTimings", quizData.timings);
    player.set("quizCompleted", true);

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

  if (showTransition) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              *** TESTING SESSION COMPLETE ***
            </h2>
            <p className="text-lg text-blue-700 mb-6">
              The comprehension test is finished.
            </p>
            <p className="text-lg text-blue-700 mb-8">
              We will now collect your feedback regarding the experiment.
            </p>
            <Button handleClick={handleContinueAfterTransition}>
              Continue to Survey
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quizQuestions[currentQuestion - 1];

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8 pb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentQ.title}
          </h2>
          {/* <div className="mb-4">
            <QuestionTimer
              minutes={currentQ.timerMinutes}
              onComplete={() => {
                // Auto-advance when timer completes (optional)
                // handleNextQuestion();
              }}
            />
          </div> */}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question: <strong>{currentQ.prompt}</strong>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              (Type your answer below. When finished, submit your text.)
            </p>
            <textarea
              value={answers[currentQuestion] || ""}
              onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-empirica-500 focus:border-empirica-500 sm:text-sm"
              rows={8}
              placeholder="Type your answer here..."
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={!answers[currentQuestion] || answers[currentQuestion].trim() === ""}
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-empirica-500 border-transparent shadow-sm text-white bg-empirica-600 hover:bg-empirica-700 ${
                (!answers[currentQuestion] || answers[currentQuestion].trim() === "") 
                  ? "opacity-50 cursor-not-allowed" 
                  : ""
              }`}
            >
              {currentQuestion === quizQuestions.length ? "Finish Quiz" : "Next Question"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

