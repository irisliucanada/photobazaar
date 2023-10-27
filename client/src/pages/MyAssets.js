import React from "react";
import HeaderComponent from "../components/Header";
import FooterComponent from "../components/Footer";
import ArtworkList from "../components/ArtworkList";
import { useParams } from "react-router-dom";


function MyAssets() {
    let { userId } = useParams();
    return (
        <div>
            <HeaderComponent />
            <ArtworkList userId={userId} page={"myAssets"} />
            <FooterComponent fixBottom={true} />
        </div>
    );
}

export default MyAssets;