import React, { useContext, useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../Helpers/AuthContext";

function ChangepasswordComponent() {
  const navigate = useNavigate("");
  const [password, setresetpw] = useState("");
  const [confirmPassword, setConfirmpw] = useState("");
  // const { token } = useParams();
  const { email } = useParams();
  const { authStatus, setAuthStatus } = useContext(AuthContext);
  const navigateToChange = () => {
    navigate("/changepassword");
  };

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    Axios.put(`http://localhost:3001/api/users/changepassword/${email}`, {
      password,
      confirmPassword,
    })
      .then((response) => {
        if (response.data.error) {
          const { message: resMessage } = error.response.data;
          setError(resMessage);
        } else {
          const { message: resMessage } = response.data;
          setMessage(resMessage);
          navigate("/login");
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
        <h1 className="text-3xl my-5 font-bold text-center">Reset password</h1>
        <div className="mb-4">
          <label className="text-left block text-sm font-medium text-gray-700">
            Reset Password:
          </label>
          <input
            type="password"
            placeholder="rest user password"
            className="mt-1 p-2 w-full rounded-md border border-gray-300"
            name="password"
            value={password}
            onChange={(e) => setresetpw(e.target.value)}
          />
          <label className="text-left block text-sm font-medium text-gray-700">
            Confirm Password:
          </label>
          <input
            type="password"
            placeholder="Confirm user password"
            className="mt-1 p-2 w-full rounded-md border border-gray-300"
            name="confirmpassword"
            value={confirmPassword}
            onChange={(e) => setConfirmpw(e.target.value)}
          />
        </div>

        <button
          type="submit"
          onClick={submitHandler}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
      {error && <div className="text-red-500 mb-8">{error}</div>}
      {message && <div className="text-green-500 mb-8">{message}</div>}
    </div>
  );
}
export default ChangepasswordComponent;
