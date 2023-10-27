import React from 'react';
import ArtworkListComponent from '../components/ArtworkList';
import { useParams } from 'react-router-dom';
import HeaderComponent from "../components/Header";
import FooterComponent from "../components/Footer";

function MyArtwork() {
    let { userId } = useParams();

    return (
        <>
            <HeaderComponent />
            <ArtworkListComponent userId={userId} page="myArtworks" />
            <FooterComponent />
        </>
    )
}

export default MyArtwork;