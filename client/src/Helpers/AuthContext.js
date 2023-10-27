import React, { useState } from "react";
import { createContext } from "react";

export const AuthContext = createContext("");

export const AuthProvider = ({ children }) => {
  const [loginStatus, setLoginStatus] = useState(false);
  // const [username, setUsername] = useState('');
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  // const [userEmail, setUserEmail] = useState('');

  const authStatus = {
    // userEmail,
    // setUserEmail,
    // username,
    // setUsername,
    role,
    setRole,
    userId,
    setUserId,
    loginStatus,
    setLoginStatus,
  };

  return (
    <AuthContext.Provider value={authStatus}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
