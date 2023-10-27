import React from 'react';
import AddArtworkComponent from '../components/AddArtwork';
import HeaderComponent from "../components/Header";
import FooterComponent from "../components/Footer";


function AddArtwork() {

    return (
        <>
            <HeaderComponent />
            <AddArtworkComponent isAdd={true} />
            <FooterComponent />
        </>

    )
}

export default AddArtwork;