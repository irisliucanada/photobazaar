import React from 'react';
import AddArtworkComponent from '../components/AddArtwork';
import HeaderComponent from "../components/Header";
import FooterComponent from "../components/Footer";
import { useParams } from 'react-router-dom';



function UpdateArtwork() {
    let { artworkId } = useParams();

    return (
        <>
            <HeaderComponent />
            <AddArtworkComponent isAdd={false} artwork_id={artworkId} />
            <FooterComponent />
        </>

    )
}

export default UpdateArtwork;