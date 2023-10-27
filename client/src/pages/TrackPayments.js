import React from "react";
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentTrack from "../components/PaymentTrack"
function Home() {
  return <div>
    <Header />
    <PaymentTrack/>
    <Footer fixBottom={true} />
  </div>;
}

export default Home;
