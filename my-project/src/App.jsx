// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Insights from "./Insights";
import Home from "./Home";
import About from "./About";
import Contact from "./Contact";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Header from "./components/Header";
import Reports from "./Reports";
import Feedback from "./Feedback";


export default function App() {
  return (
    <Router>
      {/* you can keep your header here or inside each page */}
      <Header />
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </Router>
  );
}