import "./App.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./components/Homepage/homepage";
import Dashboard from "./components/Dashboard/dashboard";
import Quizpage from "./components/QuizPage/Quizpage";


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<Homepage />}></Route>
          <Route exact path="/dashboard" element={<Dashboard />}></Route>
          <Route exact path="/quiz/:quizId" element={<Quizpage quizId={window.location.pathname.split("/quiz/")[1]}/>}></Route>
        </Routes>
      </Router>
      <ToastContainer/>
    </div>
  );
}

export default App;
