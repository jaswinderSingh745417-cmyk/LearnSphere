import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const UserContext = createContext();

const useUser = ()=>{
    const context =  useContext(UserContext)
    return context
}

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    try {
      const response = await api.get("/api/auth/profile");
      setUser(response.data.user);
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void getUser();
  }, []);
  return (
    <UserContext.Provider value={{ user, loading, getUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { useUser, UserProvider };
