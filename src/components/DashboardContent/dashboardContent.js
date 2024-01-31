import React from "react";
import { useState, useEffect } from "react";
import "./../DashboardContent/dashboardContent.modules.css";
import { useNavigate } from "react-router";
import axios from "axios";
import impressionSymbol from "../../Assets/impressionSymbol.png";
const BASE_URL = "http://localhost:8000";

function DashboardContent() {
  const navigate = useNavigate();
  const [trendingQuizzes, setTrendingQuizzes] = useState([]);
  const [countOfQuizzes, setCountOfQuizzes] = useState("0");
  const [countOfQuestions, setCountOfQuestions] = useState("0");
  const [countOfImpressions, setCountOfImpressions] = useState("0");
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
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Token is missing
        navigate("/");
        return;
      }
      return token;
    };
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/quiz/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const quizzesCount = formatNumber(response.data.countOfQuizzes);
        const questionsCount = formatNumber(response.data.countOfQuestions);
        const impressionsCount = formatNumber(response.data.countOfImpressions);
        setTrendingQuizzes(response.data.trendingQuizzes);
        setCountOfQuizzes(quizzesCount);
        setCountOfQuestions(questionsCount);
        setCountOfImpressions(impressionsCount);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };
    checkToken();
    fetchData();
  }, []);
  return (
    <div className="dashboard-content">
      <div className="quiz-info">
        <div className="quizzes-created">
          <div className="quiz-count">
            <p>{countOfQuizzes}</p>
            <h2>Quiz</h2>
          </div>
          <h2>Created</h2>
        </div>
        <div className="questions-created">
          <div className="questions-count">
            <p>{countOfQuestions}</p>
            <h2>questions</h2>
          </div>
          <h2>Created</h2>
        </div>
        <div className="impressions-created">
          <div className="impressions-count">
            <p>{countOfImpressions}</p>
            <h2>Total</h2>
          </div>
          <h2>Impressions</h2>
        </div>
      </div>
      <p className="trending-quiz-text">Trending Quizs</p>
      <div className="trending-quiz-data">
        {trendingQuizzes?.map((quiz, index) => (
          <div className="each-trending-quiz" key={index}>
            <h1>{quiz.title}</h1>
            <div className="each-trending-question-impressions">
              <p className="impressions-count-number">
                {formatNumber(quiz.impressions)}
              </p>
              <img
                src={impressionSymbol}
                alt="impressions-symbol"
                className="impressions-symbol"
              ></img>
            </div>
            <p className="created-date">Created on: {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardContent;
