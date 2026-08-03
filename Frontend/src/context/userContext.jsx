import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";



const UserContext = createContext();

const useUser = ()=>{
    const context =  useContext(UserContext)
    return context
}


const UserProvider = ({ children }) => {
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);


  const getUser = async () => {
    try {
      const response = await api.get("/api/auth/profile");
      setUser(response.data.user);
    } catch (error) {
     console.log(error)
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     getUser();
  }, []);
   const Logout = async ()=>{
    try {
      const response = await api.post("/api/auth/logout")
  
    
    } catch (error) {
     console.log(error)
      
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, Logout ,getUser}}>
      {children}
    </UserContext.Provider>
  );


}

export { useUser, UserProvider };

