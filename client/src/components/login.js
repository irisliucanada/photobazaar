import React, { useContext, useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Helpers/AuthContext";
// import ForgotPassword from "../pages/ForgotPassword";

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setLoginStatus, setRole, setUserId } = useContext(AuthContext);
  const { loginStatus, role, userId } = useContext(AuthContext);
  const Navigate = useNavigate("");
  const navigateToForgot = () => {
    Navigate("/forgotpassword");
  };

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // useEffect(() => {
  //   //fixme:
  //   if (loginStatus) Navigate("/");
  //   else Navigate("/login");
  //   // if (loginStatus) Navigate("/");
  // });
  //user login
  const authUser = (e) => {
    e.preventDefault();
    Axios.post("http://localhost:3001/api/users/auth", {
      email,
      password,
    })
      .then((response) => {
        if (response.data.error) {
          setError(response.data.error);
        } else if (response.data.message) {
          setMessage(response.data.message);
          //set token
          localStorage.setItem("accessToken", response.data.token);
          localStorage.setItem("userId", response.data.user._id);
          localStorage.setItem("user", response.data.user);
          console.log("inside login:" + localStorage.getItem("user"));

          // setUserEmail(response.data.email);
          // setUsername(response.data.username);
          setUserId(response.data._id);
          setRole(response.data.role);
          setLoginStatus(true);
          Navigate("/"); // Redirect to the home page
        }
      })
      .catch((error) => {
        const { message: resMessage } = error.response.data;
        setError(resMessage);
      });
  };

  return (
    <div className="w-1/2 mx-auto">
      <form>
        <h1 className="text-3xl my-5 font-bold text-center">Please Sign In</h1>
        <div className="mb-4">
          <label className="text-left block text-sm font-medium text-gray-700">
            User email:
          </label>
          <input
            type="text"
            placeholder="Enter user email"
            className="mt-1 p-2 w-full rounded-md border border-gray-300"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="text-left block text-sm font-medium text-gray-700">
            Password:
          </label>
          <input
            type="password"
            placeholder="Enter password"
            className="mt-1 p-2 w-full rounded-md border border-gray-300"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          onClick={authUser}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Login
        </button>
        {/* forgot password */}
      </form>
      {/* fix me: change to link text */}
      <button onClick={navigateToForgot} className="mb-3">
        Forgot password?
      </button>
      {error && <div className="text-red-500 mb-8">{error}</div>}
      {message && <div className="text-green-500 mb-8">{message}</div>}
    </div>
  );
}

export default LoginComponent;
