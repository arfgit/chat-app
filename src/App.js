import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./features/home/Home";
import { Navbar } from "./features";
import SignUp from "./features/signup/SignUp";
import Login from "./features/login/Login";
import AuthProvider from "./context/auth";
import { PrivateRoute } from "./context/PrivateRoute";
import Profile from "./features/profile/Profile";

const App = () => {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<PrivateRoute />}>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/profile" element={<Profile />} />
        </Route>
        <Route exact path="/signup" element={<SignUp />} />
        <Route exact path="/login" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
