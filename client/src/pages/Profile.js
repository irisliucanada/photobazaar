import React from "react";
import ProfileComponent from "../components/profile";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Profile() {
  return (
    <div>
      <Header />
      <ProfileComponent />
      {/* <Footer/> */}
    </div>
  );
}

export default Profile;
