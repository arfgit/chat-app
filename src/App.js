import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./features/home/Home";
import { Navbar } from "./features";
import SignUp from "./features/signup/SignUp";

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
  );
};

export default App;
