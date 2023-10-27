import React from 'react';
import HeaderComponent from "../components/Header";
import FooterComponent from "../components/Footer";
import CartComponent from "../components/Cart";
import { useParams } from 'react-router-dom';

function Cart() {
    let { userId } = useParams();
    return (
        <>
            <HeaderComponent />
            <CartComponent buyerId={userId} />
            <FooterComponent fixBottom={true} />
        </>

    )
}

export default Cart;