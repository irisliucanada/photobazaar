import React from 'react';
import ArtworkListComponent from '../components/ArtworkList';
import HeaderComponent from "../components/Header";
import FooterComponent from "../components/Footer";


function ArtworkList() {

    return (
        <>
            <HeaderComponent />
            <ArtworkListComponent />
            <FooterComponent fixBottom={true} />
        </>

    )
}

export default ArtworkList;