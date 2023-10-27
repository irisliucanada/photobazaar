import React from "react";
import SignupComponent from "../components/register";
import Header from "../components/Header";

// import "bootstrap/dist/css/bootstrap.min.css";

function Signup() {
  return (
    <div>
      <Header />
      <SignupComponent />
      {/* <Footer/> */}
    </div>
  );
}

export default Signup;
