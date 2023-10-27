import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    S3Client,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
export default ArtworkListComponent;


//S3 config
const config = {
    bucketName: "photobazarr",
    dirName: "artwork",
    region: "ca-central-1",
    credentials: {
        accessKeyId: process.env.REACT_APP_ACCESSKEYID,
        secretAccessKey: process.env.REACT_APP_SECRETACCESSKEY,
    },
};

const client = new S3Client(config);

function ArtworkListComponent({ userId, page }) {
    const [artworkList, setArtworkList] = useState([]);
    const [tagList, setTagList] = useState([]);
    const navigate = useNavigate();
    const [arworkIds, setArtworkIds] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("accessToken"));

    useEffect(() => {
        if (token) {
            Axios.get(`http://localhost:3001/api/users/auth`, {
                headers: { accessToken: token },
            })
                .then((response) => {
                    setToken(response.data.token);
                })
                .catch(() => {
                    localStorage.removeItem("token");
                });
        }

        if (page === "myArtworks") {
            // If userId is not null, fetch data for a specific user
            // get artwork_id from user_id
            Axios.get(`http://localhost:3001/api/artworks/author/${userId}`)
                .then((response) => {
                    // console.log(userId);
                    // console.log(response.data);
                    setArtworkList(response.data);
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            // If userId is null, fetch data for all users
            Axios.get("http://localhost:3001/api/artworks")
                .then((response) => {
                    if (page === "home") {
                        // Randomly select 4 items from the response data
                        const shuffledData = response.data.sort(() => Math.random() - 0.5);
                        const selectedItems = shuffledData.slice(0, 4)
                        setArtworkList(selectedItems);
                    } else {
                        setArtworkList(response.data);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }

        // if myAssets, get artworklist from user table
        if (page === "myAssets") {
            // get artwork_id from user_id
            Axios.get(`http://localhost:3001/api/users/id/${userId}`)
                .then((response) => {
                    let my_assets = response.data.my_assets;
                    // get artwork data from artwork_id
                    let myArtworkList = [];
                    my_assets.forEach(asset => {
                        Axios.get(`http://localhost:3001/api/artworks/${asset.artwork_id}`)
                            .then((response) => {
                                myArtworkList.push(response.data);
                                setArtworkList(myArtworkList);
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    });
                })
                .catch((error) => {
                    console.error(error);
                });
        }

        // Fetch the tag data
        Axios.get("http://localhost:3001/api/tags")
            .then((response) => {
                setTagList(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [userId]);

    const addToCart = (artworkId, authorId, userId) => {
        // check if userId is author
        if (authorId === userId) {
            alert("You cannot add your own artwork to cart!");
            return;
        }
        console.log("next");
        // check if artworkId exists in purchase
        Axios.get(`http://localhost:3001/api/purchases/checkPurchased/${artworkId}/${userId}`)
            .then((response) => {
                console.log(response.data);
                console.log("enter");
                console.log(artworkId);
                if (response.data == null) {

                    // if no, add artworkId to purchase
                    Axios.post(`http://localhost:3001/api/purchases`, {
                        artwork_id: artworkId,
                    },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                        .then((response) => {
                            console.log(response.data);
                            alert("Artwork added to cart!");
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    response.data.is_paid === true ? alert("Artwork has been purchased!") : alert("Artwork has already been added to cart!");
                }
            })
            .catch((error) => {
                console.error(error);
            });

    }

    const deleteArtwork = (artwork) => {
        if (!window.confirm("Are you sure you to delete it?")) {
            return;
        } else {
            // check if artworkId exists in purchase
            Axios.get(`http://localhost:3001/api/purchases/checkSold/${artwork._id}`)
                .then((response) => {
                    if (response.data === null) {

                        const deleteFiles = [];
                        // get cover_url
                        deleteFiles.push(artwork.cover_url);
                        // get photos_url
                        artwork.photos.forEach(photo => {
                            deleteFiles.push(photo.file_url);
                        });

                        // get deleteFilesNames
                        const deleteFilesNames = [];
                        deleteFiles.map(file => {
                            const fileName = file.split(".com/").pop();
                            deleteFilesNames.push(fileName);
                        });

                        // delete files from s3
                        let deleteFilesParams = {};
                        const deleteFilesPromises = [];
                        deleteFilesNames.forEach((fileName) => {
                            deleteFilesParams = {
                                Bucket: config.bucketName,
                                Key: fileName,
                            };
                            const deleteFilesPromise = client
                                .send(new DeleteObjectCommand(deleteFilesParams))
                                .then((data) => console.log(data))
                                .catch((error) => console.log(error));
                            deleteFilesPromises.push(deleteFilesPromise);
                        });
                        Promise.all(deleteFilesPromises).then(() => {
                            // delete artwork from db
                            Axios.delete(`http://localhost:3001/api/artworks/${artwork._id}`)
                                .then((response) => {
                                    console.log(response.data);
                                    alert("Artwork deleted!");
                                    window.location.reload();
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                        }
                        ).catch((error) => {
                            console.error(error);
                        });
                    }
                    else {
                        // if yes, alert user that artwork has been purchased
                        alert("Artwork has been purchased!");
                    }
                })
        }
    }

    return (
        <>
            <div className="card flex flex-wrap justify-center p-3 m-5">
                {artworkList.length > 0 ? (<>{artworkList.map((artwork, index) => (
                    <div key={index} className="border-4 w-96 h-100 m-5 flex flex-col justify-between rounded-lg w-1/4">
                        <img src={artwork.cover_url} className="mx-auto my-auto w-90 h-60 pt-2" alt="Artwork" />
                        <div className="ml-4">
                            <div className="text-lg subpixel-antialiased font-bold uppercase">{artwork.title}</div>
                            <div className="flex justify-between mt-3">
                                <div className="flex items-center mr-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                        />
                                    </svg>
                                    <span className='ml-2'>{artwork.photos.length}</span>
                                </div>
                                <div className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className='ml-2 mr-4'>{artwork.price}</span>
                                </div>
                                <div className="button-group flex border-2 mr-4 p-1 rounded-full">
                                    {/* show/edit photos */}
                                    <button className={`${page === "home" || page === "myAssets" ? 'border-r-2 pr-1' : ''} items-center pl-1`}
                                        onClick={() => {
                                            if (userId === null || userId === undefined) {
                                                alert("Please login first!");
                                                navigate('/Login')
                                            } else { navigate(`/details/${artwork._id}`, { state: { page: page } }); }
                                        }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    </button>
                                    {page === "myAssets" || page === "home" ? (<></>) : (<>
                                        {/* edit main info */}
                                        <button className={`${page === "myArtworks" ? 'border-l-2 pl-1' : ''} border-r-2 items-center ml-1`}
                                            onClick={() => {
                                                navigate(`/updateArtworkMainInfo/${artwork._id}`);
                                            }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </button></>)}
                                    {page === "myAssets" || userId === null || userId === undefined || page === "myArtworks" ?
                                        (<></>) :
                                        (<>
                                            {/* add to cart */}
                                            <button className={`${page === "home" ? '' : 'border-r-2'} items-center px-1`}
                                                onClick={() => {
                                                    addToCart(artwork._id, artwork.author_id, userId)
                                                }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button></>)}

                                    {page === "home" ? (<></>) : (<>
                                        {/* delete artwork */}
                                        <button className="items-center px-1"
                                            onClick={() => {
                                                deleteArtwork(artwork)
                                            }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button></>)}
                                </div>
                            </div>
                            <div className="text-base capitalize mt-2">{artwork.description}</div>
                            <div className="mb-2 flex justify-center mt-1">
                                {artwork.tags.map((tag, tagIndex) => {
                                    // Find the corresponding tag object in tagList
                                    const tagData = tagList.find(t => t._id === tag.tag_id);
                                    return (
                                        <div key={tagIndex} className="font-serif capitalize p-1 text-sm inline ml-2 bg-sky-500/50 rounded-lg">
                                            {tagData ? tagData.tag : ""}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}</>) : (<p>You don't have any artworks!</p>)}

                {/* add artwork button */}
                {page !== "myArtworks" ? (<></>) : (<>
                    <button className="border-4 w-60 h-60 m-auto flex flex-col justify-center items-center rounded-full" onClick={() => navigate('/addArtwork')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                        <div className="text-2xl font-bold subpixel-antialiased capitalize">Add Artwork</div>
                    </button> </>)}
            </div >
        </>
    )
}
