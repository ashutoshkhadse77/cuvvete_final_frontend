import React, { useState, useEffect } from "react";
import axios from "axios";
import "./../QuizPage/Quizpage.modules.css";
import cupSymbol from "./../../Assets/cupSymbol.png";
import { useParams } from "react-router-dom";
const BASE_URL = "http://localhost:8000";



function Quizpage() {
  const [invalidLink, setInvalidLink] = useState("");
  const { quizId } = useParams();
  const [quizDetails, setQuizDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [time, setTime] = useState(0);
  const [isQuizPageOpen, setIsQuizPageOpen] = useState(true);
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
  const [showThanksMessage, setShowThanksMessage] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/quiz/${quizId}`);
        if (response.data.status === "Failed") {
          setInvalidLink("Invalid Link. Quiz doesn't exist");
        } else {
          setQuizDetails(response.data.quiz);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [quizId]);

  const handleNextQuestion = async () => {
    if (currentQuestionIndex === quizDetails.questions.length - 1 && time <= 0) {
      // If this is the last question and the time has run out
      submitQuizData();
    } else {
      // If the current question is not the last question or the time has not run out
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setTime(0);
    }
  };

  useEffect(() => {
    let interval;
    if (quizDetails.questions && quizDetails.questions.length > 0) {
      const currentQuestion = quizDetails.questions[currentQuestionIndex];
      const timer = currentQuestion.timer;
      if (timer) {
        setTime(timer);
        interval = setInterval(() => {
          setTime((prevTime) => {
            if (prevTime === 1) {
              handleNextQuestion();
            }
            return prevTime - 1;
          });
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [currentQuestionIndex, quizDetails.questions]);


  const submitQuizData = async () => {
    const correctAnswers = Object.keys(selectedOptions).reduce(
      (count, questionIndex) => {
        const selectedOptionIndex = selectedOptions[questionIndex];
        const correctOptionIndex =
          quizDetails.questions[questionIndex].correctAnswer;
        if (selectedOptionIndex === undefined || selectedOptionIndex === null) {
          return count;
        } else if (selectedOptionIndex === correctOptionIndex) {
          return count + 1;
        } else {
          return count;
        }
      },
      0
    );

    setTotalCorrectAnswers(correctAnswers);
    setShowResults(true);
    setIsQuizPageOpen(false);

    //changing the object to facilitate server expectations
    const selectedOptionsArray = Object.keys(selectedOptions).map((key) => {
      return { questionIndex: key, optionIndex: selectedOptions[key] };
    });
    try {
      await axios.post(
        `${BASE_URL}/quiz/response`,
        { answers: selectedOptionsArray, quizId }
      );
    } catch (error) {
      console.log(error);
    }
  };


  const handleNextPoll = async () => {
    if (currentQuestionIndex < quizDetails.questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);

    }
    else {
      const selectedOptionsArray = Object.keys(selectedOptions).map((key) => {
        return { questionIndex: key, optionIndex: selectedOptions[key] };
      });
      try {
        await axios.post(
          `${BASE_URL}/quiz/response`,
          { answers: selectedOptionsArray, quizId }
        );
        setIsQuizPageOpen(false)
        setShowThanksMessage(true)

      } catch (error) {
        console.log(error);
      }
    }
  }

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [questionIndex]: optionIndex,
    }));
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  if (loading) {
    return <div className="quiz-loading-animation" data-content="Loading..."></div>;
  }

  if (invalidLink) {
    return (
      <div>
        <h1>Invalid Link</h1>
        <p>Quiz doesn't exist</p>
      </div>
    );
  }

  const currentQuestion = quizDetails.questions[currentQuestionIndex];
  return (
    <>
      {isQuizPageOpen && (
        <div className="quiz-page">
          <div className="quiz-arena">
            <div className="question-number-and-timer-div">
              <p className="question-number-in-quiz">
                {(currentQuestionIndex + 1).toString().padStart(2, "0")}/{quizDetails.questions.length.toString().padStart(2, "0")}
              </p>
              {currentQuestion.timer === null ? (
                ""
              ) : (
                <p className="question-timer-div">{formatTime(time)}</p>
              )}
            </div>
            <div className="quiz-each-question">{currentQuestion.question}</div>
            <div className="quiz-options-div">
              {currentQuestion.options.map((option, optionIndex) => (
                <div className="quiz-options" key={optionIndex}>
                  {currentQuestion.optionFormat === "text" && (
                    <button
                      id={`option_${optionIndex}`}
                      name={`question_${currentQuestionIndex}`}
                      className={`text-option-button ${selectedOptions[currentQuestionIndex] === optionIndex
                          ? "selected"
                          : ""
                        }`}
                      onClick={() =>
                        handleOptionSelect(currentQuestionIndex, optionIndex)
                      }
                    >
                      {option.text}

                    </button>
                  )}
                  {currentQuestion.optionFormat === "ImageURL" && (
                    <button
                      id={`option_${optionIndex}`}
                      name={`question_${currentQuestionIndex}`}
                      className={`image-option-button ${selectedOptions[currentQuestionIndex] === optionIndex
                          ? "selected"
                          : ""
                        }`}
                      onClick={() =>
                        handleOptionSelect(currentQuestionIndex, optionIndex)
                      }
                    >
                      <img
                        className="image-in-image-type-button"
                        src={option.imageURL}
                        alt={`option ${optionIndex}`}
                      ></img>
                    </button>
                  )}
                  {currentQuestion.optionFormat === "TextnImage" && (
                    <button
                      id={`option_${optionIndex}`}
                      name={`question_${currentQuestionIndex}`}
                      className={`text-and-image-option-button ${selectedOptions[currentQuestionIndex] === optionIndex
                          ? "selected"
                          : ""
                        }`}
                      onClick={() =>
                        handleOptionSelect(currentQuestionIndex, optionIndex)
                      }
                    >
                      <div className="text-image-quiz-options-div">
                        <p className="">{option.text}</p>
                        <img
                          src={option.imageURL}
                          alt={`option ${optionIndex}`}
                        ></img>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className="next-submit-button" onClick={quizDetails.type === 'question' ? handleNextQuestion : handleNextPoll}>
              {currentQuestionIndex === quizDetails.questions.length - 1
                ? "SUBMIT"
                : "NEXT"}
            </button>
          </div>
        </div>
      )}
      {showResults && (
        <div className="congratulations-page">
          <div className="congratulations-arena">
            <p>Congrats Quiz is completed</p>
            <img src={cupSymbol} alt="congratulations-cup"></img>

            <h1 className="score-text">
              Your Score is{" "}
              <span className="score-card">
                {totalCorrectAnswers.toString().padStart(2, "0")}/
                {quizDetails.questions.length.toString().padStart(2, "0")}
              </span>
            </h1>

          </div>
        </div>
      )}
      {
        showThanksMessage && (
          <div className="thanks-page">
            <div className="thanks-arena">
              <p>Thank you<br />for participating in<br />the Poll</p>
            </div>

          </div>
        )
      }
    </>
  );
}

export default Quizpage;
