import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";

const DashBoardRoute = () => {
  const { user } = useUser();
  if (!user) {
    return <Navigate to="/login" />;
  }

  if( user.role == "student"){
  return  <Navigate to={"/student/dashboard"}/> 

  }

  if( user.role == "instructor"){
  return  <Navigate to={"/instructor/dashboard"}/> 

  }

  if( user.role == "admin"){
  return  <Navigate to={"/admin/dashboard"}/> 

  }
  return <Navigate to={"/"}/>;
};

export default DashBoardRoute;
