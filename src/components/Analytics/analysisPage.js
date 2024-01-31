import React from "react";
import "./analyticsPage.modules.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import deleteSymbol from "./../../Assets/deleteSymbol.png";
import editSymbol from "./../../Assets/editSymbol.png";
import shareSymbol from "./../../Assets/shareSymbol.png";

const BASE_URL = "http://localhost:8000";
const CLIENT_URL =
  "https://cuvvete-frontend-part-ten.vercel.app/";



function AnalyticsPage() {

  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]);
  const [analyticsPageOpen, setAnalyticsPageOpen] = useState(true);
  const [questionWiseAnalysisOpen, setQuestionWiseAnalysisOpen] =
    useState(false);
  const [quiz, setQuiz] = useState([]);
  const [refetch, setRefetch] = useState(false);
  const [quizToBeDeletedId, setQuizToBeDeletedId] = useState([]);
  const [deleteQuizNotification, setDeleteQuizNotification] = useState(false);

  const handleQuestionWiseAnalysisLinkClick = (quiz) => {
    setAnalyticsPageOpen(false);
    setQuestionWiseAnalysisOpen(true);
    setQuiz(quiz);
  };

  const handleCopyToClipboard = (linkToQuiz) => {
    navigator.clipboard.writeText(linkToQuiz).then(
      () => {
        toast.success("Link copied to clipboard!");
      },
      (err) => {
        toast.error("Failed to copy link to clipboard");
        console.error("Failed to copy link to clipboard", err);
      }
    );
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Token is missing
        navigate("/");
        return;
      }
    };
    checkToken();
  }, []);

  const handleShareQuiz = (quiz) => {
    const quizLink = `${CLIENT_URL}/quiz/${quiz._id}`;
    handleCopyToClipboard(quizLink);
  };

  const handleDeleteQuiz = (quiz) => {
    setAnalyticsPageOpen(false);
    setDeleteQuizNotification(true);
    setQuizToBeDeletedId(quiz._id);
  };

  const handleConfirmDeleteQuiz = async (e) => {
    e.preventDefault();
    setDeleteQuizNotification(false);
    setAnalyticsPageOpen(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/quiz/${quizToBeDeletedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRefetch(true)
    } catch (error) {
      console.error("Error deleting quiz:", error);
    } finally {
      toast.success("Quiz deleted successfully");
    }
    setQuizToBeDeletedId("");
  };

  const handleCancelDeleteQuiz = (e) => {
    e.preventDefault();
    setQuizToBeDeletedId("");
    setDeleteQuizNotification(false);
    setAnalyticsPageOpen(true);
  };

  const formatNumber = (number) => {
    if (number > 999) {
      const formattedNumber = new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
      }).format(number);
      return formattedNumber;
    }
    return number;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/quiz/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response, "resp")
        setQuizData(response.data.quizes);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };
    fetchData();
  }, [refetch]);

  return (
    <>
      {analyticsPageOpen && (
        <div className="analytics-page">
          <h1 className="quiz-analysis-heading">Quiz Analysis</h1>
          <div className="quiz-analysis-table">
            <div className="quiz-analysis-table-headings">
              <p className="analysis-table-serial-number-heading">S.No</p>
              <p className="analysis-table-quiz-name-heading">Quiz Name</p>
              <p className="analysis-table-created-on-heading">Created on</p>
              <p className="analysis-table-impression-heading">Impression</p>
            </div>
            {quizData.map((quiz, index) => (
              <div
                className={`each-quiz-analysis ${(index + 1) % 2 === 0 ? "even-div" : ""
                  }`}
                key={index}
              >
                <p className="each-quiz-serial-number">{index + 1}</p>
                <p className="each-quiz-quiz-name">{quiz.title}</p>
                <p className="each-quiz-created-date">{quiz.createdDate}</p>
                <p className="each-quiz-impression">
                  {formatNumber(quiz.impressions)}
                </p>
                <img
                  className="edit-symbol"
                  src={editSymbol}
                  alt="edit-symbol"
                ></img>
                <img
                  src={deleteSymbol}
                  alt="delete-symbol"
                  className="delete-symbol"
                  onClick={() => handleDeleteQuiz(quiz)}
                ></img>
                <img
                  src={shareSymbol}
                  alt="share-symbol"
                  className="share-symbol"
                  onClick={() => handleShareQuiz(quiz)}
                ></img>
                <p
                  onClick={() => handleQuestionWiseAnalysisLinkClick(quiz)}
                  className="question-wise-analysis-text"
                >
                  Question wise Analysis
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {questionWiseAnalysisOpen && (
        <div className="question-wise-analysis">
          <h1 className="question-wise-analysis-title">
            {quiz.title} Question Analysis
          </h1>
          <div className="question-wise-analysis-created-date-impressions">
            <p>Created on: {(quiz.createdAt) ? new Date(quiz.createdAt)?.toDateString() : "N/A"}</p>
            <p>Impressions: {formatNumber(quiz.impressions)}</p>
          </div>

          {quiz.questions.map((question, index) => (
            <React.Fragment key={index}>
              <div className="question-wise-analysis-each-question">
                <h1>
                  Q.{index + 1} {question.question}
                </h1>
              </div>
              {quiz.type === "question" ? (
                <div className="options-analysis">
                  <div className="option-analysis-each-block">
                    <h1>
                      {question.totalCorrectSubmissions +
                        question.totalIncorrectSubmissions}
                    </h1>
                    <p>people Attempted the question</p>
                  </div>
                  <div className="option-analysis-each-block">
                    <h1>{question.totalCorrectSubmissions}</h1>
                    <p>people Answered Correctly</p>
                  </div>
                  <div className="option-analysis-each-block">
                    <h1>{question.totalIncorrectSubmissions}</h1>
                    <p>people Answered Incorrectly</p>
                  </div>
                </div>
              ) : (
                <div className="options-analysis">
                  {question.options.map((option, index) => (
                    <div
                      className="option-analysis-each-block-poll"
                      key={index}
                    >
                      <h1>{option.selectedCount}</h1>
                      <p>{`option ${index + 1}`}</p>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      {deleteQuizNotification && (
        <div className="overlay">
          <div className="delete-quiz-notification">
            <p>
              Are you confirm you <br />
              want to delete?
            </p>
            <div className="confirm-delete-cancel-buttons">
              <button
                className="confirm-delete-button"
                onClick={(e) => handleConfirmDeleteQuiz(e)}
              >
                Confirm Delete
              </button>
              <button
                className="cancel-delete-button"
                onClick={(e) => handleCancelDeleteQuiz(e)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AnalyticsPage;
