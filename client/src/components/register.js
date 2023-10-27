import React, { useEffect, useState } from "react";
import Axios from "axios";
import * as Yup from "yup";

function SignupComponent() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [userNameExists, setUserNameExists] = useState([]);
  const [emailExists, setEmailExists] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // useEffect(() => {
  //   Axios.get("http://localhost:3001/api/users")
  //     .then((response) => {
  //       var username = response.data.map((user) => user.username);
  //       setUserNameExists(username);
  //       var email = response.data.map((user) => user.email);
  //       setEmailExists(email);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }, [error]);

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .min(4, "User name must be at least 2 characters.\n") //fix me, how to output \n
      .max(20, "User name must not exceed 20 characters.\n")
      .matches(
        /^[a-z0-9]+$/,
        "Must contain only lowercase letters and numbers.\n"
      )
      .test("unique-username", "User name already exists.\n", (value) => {
        // Check if the username exists
        return !userNameExists.includes(value);
      })
      .required("User name is required"),
    password: Yup.string()
      .min(4, "Password must be at least 2 characters.\n")
      .max(100, "Password must not exceed 100 characters.\n")
      .matches(/[a-z]/, "Must contain at least one lowercase letter.\n")
      .matches(/[A-Z]/, "Must contain at least one uppercase letter.\n")
      .matches(
        /[0-9!@#$%^&*(),.?":{}|<>]/,
        "Must contain at least one number or special character.\n"
      )
      .required("Password is required."),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("password"), null],
        "password and confirm password not the same.\n"
      )
      .required("Confirm password is required."),
    email: Yup.string()
      .email("Invalid email format")
      .test("unique-email", "Email already exists.", (value) => {
        // Check if the username exists in itemNameExists
        return !emailExists.includes(value);
      })
      .required("Seller email is required."),
  });

  const addUser = (e) => {
    e.preventDefault();
    validationSchema
      .validate(
        {
          username,
          password,
          confirmPassword,
          email,
        },
        { abortEarly: false } // Collect all validation errors, not just the first one
      )
      .then(() => {
        Axios.post("http://localhost:3001/api/users", {
          username,
          password,
          email,
          confirmPassword,
          role: "user",
        })
          .then((response) => {
            // Handle the response if needed
            console.log("response data:" + response.data);
          })
          .catch((error) => {
            // Handle errors
            setError(error.response.data.message);
          });
      })
      .catch((validationErrors) => {
        setError(validationErrors.errors);
      });
  };

  return (
    <div className="w-1/2 mx-auto">
      <form>
        <h1 className="text-3xl my-5 font-bold text-center">
          Please Register to Photobazaar
        </h1>

        <div className="mb-4">
          <label className="text-left block text-sm font-medium text-gray-700">
            Username:
          </label>

          <input
            type="text"
            placeholder="Enter username"
            className="mt-1 p-2 w-full rounded-md border border-gray-300"
            name="username"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />

          {/* <p className="text-sm text-gray-500">
            Required, 4-20 characters, contains only numbers and lowercase
            letters.
          </p> */}
        </div>

        <div className="mb-4">
          <label className="text-left block text-sm font-medium text-gray-700">
            Password:
          </label>

          <input
            type="password" // hide the password
            placeholder="Enter password"
            className="mt-1 p-2 w-full rounded-md border border-gray-300"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* <p className="text-sm text-gray-500">
            Required, 6-100 characters, at least one uppercase letter, one
            lowercase letter, one number or special character.
          </p> */}
        </div>

        <div className="mb-4">
          <label className="text-left block text-sm font-medium text-gray-700">
            Confirm Password:
          </label>

          <input
            type="password" // hide the password
            placeholder="Confirm password"
            className="mt-1 p-2 w-full rounded-md border border-gray-300"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* <p className="text-sm text-gray-500">
            Required, 6-100 characters, at least one uppercase letter, one
            lowercase letter, one number or special character.
          </p> */}
        </div>

        <div className="mb-4">
          <label className="text-left block text-sm font-medium text-gray-700">
            Email:
          </label>

          <input
            type="email"
            placeholder="Enter email"
            className="mt-1 p-2 w-full rounded-md border border-gray-300"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* <p className="text-sm text-gray-500">
            Required, please provide a valid email.
          </p> */}
        </div>

        <button
          onClick={addUser}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Register
        </button>
      </form>
      {error && <div className="text-red-500 mb-8">{error}</div>}
      {message && <div className="text-green-500 mb-8">{message}</div>}
    </div>
  );
}

export default SignupComponent;
