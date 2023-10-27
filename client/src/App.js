import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AddArtwork from "./pages/AddArtwork";
import Message from "./pages/Message";
import Payment from "./pages/Payment";
import TrackPayments from "./pages/TrackPayments"
import { AuthProvider } from "./Helpers/AuthContext";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
//fix me: footer cover the register button
import Artwork from "./pages/ArtworkList";
import MyArtwork from "./pages/MyArtwork";
import "./App.css";
import UpdateArtwork from "./pages/UpdateArtwork";
import ArtworkDetails from "./pages/ArtworkDetails";
import MyAssets from "./pages/MyAssets";
import Admincenter from "./pages/Admincenter";
import MyCart from "./pages/Cart";

function App() {
  return (
    <AuthProvider>
      <div className="page-container">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/message" element={<Message />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/trackpayments" element={<TrackPayments />} />
            <Route path="/artwork" element={<Artwork />} />
            <Route path="/addArtwork" element={<AddArtwork />} />
            <Route path="/updateArtworkMainInfo/:artworkId" element={<UpdateArtwork />} />
            <Route path="/details/:artworkId" element={<ArtworkDetails />} />
            <Route path="/artwork/:userId" element={<MyArtwork />} />
            <Route path="/asset/:userId" element={<MyAssets />} />
            <Route path="/cart" element={<MyCart />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/changepassword/:email" element={<ChangePassword />} />
            <Route path="/admincenter/:id" element={<Admincenter />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
