import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";


const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useUser();
    if(loading){
   return <p>Loading...</p>
  }

  if (!user) {
   return <Navigate to={"/login"}/>;
  }



  if(role && user.role !== role) {
     return <Navigate to={"/"}/>
  }


  return children
};





export default ProtectedRoute;