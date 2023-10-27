import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from '../components/Header';
import Footer from '../components/Footer';
import PayForm from '../components/PayForm'


function Payment() {
    const purchase_id="652226c2f905b8dea4f77130"
    

    return (
        <div className="Payment">
            <Header/>
            <PayForm purchase_id={purchase_id}/>
            <Footer/>
        </div>
    );
}

export default Payment;