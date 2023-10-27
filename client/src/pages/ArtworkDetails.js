import React from 'react';
import ArtworkDetailsComponent from '../components/ArtworkDetails';
import { useParams } from 'react-router-dom';
import HeaderComponent from "../components/Header";
import FooterComponent from "../components/Footer";


function ArtworkDetails() {
    let { artworkId } = useParams();

    return (
        <>
            <HeaderComponent />
            <ArtworkDetailsComponent artworkId={artworkId} />
            <FooterComponent />
        </>

    )
}

export default ArtworkDetails;