import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Axios from "axios";
import PayForm from '../components/PayForm';
// FIXME: CHANGE ALERT TO MODAL
import Modal from 'react-modal';

function CartComponent({ buyerId }) {
    // const [artworkInCart, setArtworkInCart] = useState([]); // all the items in cart
    // const navigate = useNavigate();

    const url = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('accessToken');
    const [purchases, setPurchases] = useState([]);
    const [selectedPurchase,setSelectedPurchase]=useState(null);

    useEffect(() => {
        Axios.get(`${url}/api/purchases/unpaid/buyer`,{
            headers: { Authorization: `Bearer ${token}` }
            })
          .then((response) => {
            const purchaseList = response.data;
            const promises = purchaseList.map(purchase => {
              return Axios.get(`${url}/api/artworks/${purchase.artwork_id}`)
                .then((artworkResponse) => {
                  const artwork = artworkResponse.data;
                  purchase.artwork = artwork;
                  return purchase;
                });
            });
            Promise.all(promises)
              .then(updatedPurchases => {
                setPurchases(updatedPurchases);
              });
          })
          .catch((error) => {
            console.error('Error fetching purchase data:', error);
          });
      }, [selectedPurchase]);
    
      useEffect(() => {
        Modal.setAppElement('#cart-container'); 
      }, []);
      
    const removeFromCart = (purchase_id) => {
        
        // delete the purchase record
        // if (!window.confirm("Are you sure you to delete it from cart?")) {
        //     return;
        // } else {
            console.log(purchase_id)
            Axios.delete(`${url}/api/purchases/${purchase_id}`)
                .then((response) => {
                    console.log(response.data);
                    // remove the artwork from artworkInCart
                    const newPurchases = purchases.filter((purchase) => purchase._id !==purchase_id);
                    setPurchases(newPurchases);
                    // window.location.href = `/cart/${buyerId}`;
                })
                .catch((error) => {
                    console.log(error);
                }
                );
        // }
    };

    // const removeAllFromCart = () => {
    //     // delete all the purchase record
    //     if (!window.confirm("Are you sure you to delete all items from cart?")) {
    //         return;
    //     } else {
    //         // map through all the artwork in cart, delete the purchase record
    //         artworkInCart.map((artwork) => {
    //             Axios.delete(`http://localhost:3001/api/purchases/${artwork.artwork_id}`)
    //                 .then((response) => {
    //                     console.log(response.data);
    //                     // remove the artwork from artworkInCart
    //                     setArtworkInCart([]);
    //                     window.location.href = `/cart/${buyerId}`;
    //                 })
    //                 .catch((error) => {
    //                     console.log(error);
    //                 }
    //                 );
    //         })
    //     }
    // }
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [purchaseIdToDelete, setPurchaseIdToDelete] = useState(null);
  
    const openModal = (purchaseId) => {
      setIsModalOpen(true);
      setPurchaseIdToDelete(purchaseId);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setPurchaseIdToDelete(null);
    };
  
    const handleDelete = () => {
      const purchaseId = purchaseIdToDelete;
  
      if (purchaseId) {
        Axios.delete(`${url}/api/purchases/${purchaseId}`)
          .then((response) => {
            console.log(response.data);
            const newPurchases = purchases.filter((purchase) => purchase._id !== purchaseId);
            setPurchases(newPurchases);
            closeModal(); 
          })
          .catch((error) => {
            console.log(error);
            closeModal(); 
          });
      }
    };
  
  
      
    return (
        <div id= "cart-container" className="cart m-5 p-5 capitalize">
            <div className="text-3xl font-bold subpixel-antialiased p-3 m-5">shopping cart</div>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Delete Confirmation Modal"
                className="fixed inset-0 flex items-center justify-center z-50"
                overlayClassName="fixed inset-0"
                >
                <div className="bg-red-200 w-80 p-4 rounded shadow-lg">
                    <h2 className="text-lg font-semibold">Confirm delete</h2>
                    <p>Are you sure you want to remove it?</p>
                    <div className="mt-4 flex justify-end">
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={handleDelete}
                    >
                        Confirm
                    </button>
                    <button
                        className="px-4 py-2 ml-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                    </div>
                </div>
            </Modal>


            {(!purchases || purchases.length===0) && 
                (
                    <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                        </svg>
                        <div className="text-4xl font-medium subpixel-antialiased p-5 m-5 text-center">You cart is empty!</div>
                    </div>
                )
            }

            {purchases && purchases.length!==0 && !selectedPurchase &&
                (
                    <>
                        {/* <div className='text-xl font-normal p-3 m-5 mt-0 text-right text-red-600 hover:text-red-600/75 underline underline-offset-auto'
                            onClick={() => {
                                // removeAllFromCart()
                            }}>Remove all
                        </div> */}

                        {purchases.map((purchase, index) => 
                            (<div key={index} className="cartItems p-3 m-5 flex flex-wrap">
                                <div className="imageBox w-full md:w-1/2 lg:w-1/4 flex flex-col items-center justify-center border-2">
                                    <img className="w-60 h-60 m-auto my-3" src={purchase.artwork.cover_url} alt="artwork cover"></img>
                                </div>
                                <div className="generalInfo w-full md:w-1/2 lg:w-1/4 flex flex-col items-center justify-center font-bold">{purchase.artwork.title}</div>
                                <div className="photos w-full md:w-1/2 lg:w-1/4 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    <span className="pl-2">{purchase.artwork.photos.length}</span>
                                </div>
                                <div className="price w-full md:w-1/2 lg:w-1/4 flex flex-col items-center justify-center">
                                    <div className="flex p-1 m-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="pl-2">{purchase.transaction_price}</span>
                                    </div>
                                    <button className="w-1/2 capitalize bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-200 p-1 m-1"
                                    onClick={()=>setSelectedPurchase(purchase)}
                                    >check out</button>
                                    <button className="w-1/2 capitalize bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-200 p-1 m-1"
                                        onClick={() => {openModal(purchase._id)
                                            // removeFromCart(purchase._id)
                                        }}>remove
                                    </button>
                                </div>
                            </div>))
                        }
                    </>
                )
            }
                        
            {selectedPurchase &&
                (<div className="Payment">
                    <PayForm purchase={selectedPurchase} onCancel={() => setSelectedPurchase(null)}/>
                </div>)

            }


        </div>
    )
}
export default CartComponent;