import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import {
    S3Client,
    DeleteObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { useLocation } from 'react-router-dom';
export default ArtworkDetailsComponent;

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

function ArtworkDetailsComponent({ artworkId }) {
    const location = useLocation();
    const page = location.state.page;
    const [artworkToUpdate, setArtworkToUpdate] = useState([]);
    const navigate = useNavigate();
    const [tagList, setTagList] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [photoName, setPhotoName] = useState("");
    const [photoDescription, setPhotoDescription] = useState("");
    const [photoFile, setPhotoFile] = useState(null); // photo to upload
    const [author_id, setAuthor_id] = useState("");
    const [photoToUpdate, setPhotoToUpdate] = useState([]);
    const [photoToDelete, setPhotoToDelete] = useState([]);
    const [isAdd, setIsAdd] = useState(false); // add or edit photo
    const [token, setToken] = useState(localStorage.getItem('accessToken'))
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        if (token) {
            Axios.get(`http://localhost:3001/api/users/auth`, { headers: { accessToken: token } })
                .then(response => {
                    setToken(response.data.token);
                    setUser(response.data.user)
                    setUserId(response.data.user.id);
                    console.log(response.data.user);
                }).catch(() => {
                    localStorage.removeItem('token');
                });
        }
    }, []);

    useEffect(() => {
        // check if the buyer has purchased the artwork
        if (userId !== author_id) {
            Axios.get(`http://localhost:3001/api/purchases/checkPurchased/${artworkId}/${userId}`)
                .then((response) => {
                    console.log(response.data);
                    setIsPaid(response.data.is_paid);
                    console.log(response.data.is_paid);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [user]);

    console.log(page);

    useEffect(() => {
        Axios.get(`http://localhost:3001/api/artworks/${artworkId}`)
            .then((response) => {
                setArtworkToUpdate(response.data);
                setAuthor_id(response.data.author_id);
            })
            .catch((error) => {
                console.error(error);
            });
        Axios.get("http://localhost:3001/api/tags")
            .then((response) => {
                setTagList(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [artworkId]);

    const handleEditBox = (photo, index) => {  // if index is true, it's edit photo, if false, it's add photo
        // show the edit box
        setShowEdit(!showEdit);
        // if it's edit photo, pass the photo value to update 
        if (index) {
            setIsAdd(false);
            setPhotoToUpdate(photo);
            setPhotoName(photo.photo_name);
            setPhotoDescription(photo.description);
        } else {
            setIsAdd(true);
        }
    }

    // upload photo to s3
    const uploadPhoto = (img) => {
        let newFileName = `${Date.now()}_${author_id}.photo.${photoFile.name.split(".").pop()}`;

        const uploadParams = {
            Bucket: config.bucketName,
            Key: "artwork/" + newFileName,
            Body: img,
        };
        const uploadPromise = client
            .send(new PutObjectCommand(uploadParams))
            .then((uploadResult) => {
                console.log("Image uploaded successfully:", uploadResult);
                return newFileName;
            })
            .catch((error) => {
                console.error("Error uploading image:", error);
                return null;
            });
        return uploadPromise;
    }

    const deletePhoto = (photo) => {
        setPhotoToDelete(photo);
        // check if it's the last photo in the artwork
        if (artworkToUpdate.photos.length == 1) {
            alert("You cannot delete the last photo in the artwork");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this photo?")) {
            return;
        } else {
            console.log("enter");
            // delete the photo from database
            Axios.delete(`http://localhost:3001/api/artworks/${artworkId}/deletePhoto/${photo._id}`)
                .then((response) => {
                    console.log(response.data);
                    // reload the page
                    navigate(`/details/${artworkId}`, { replace: true });
                })
                .catch((error) => {
                    console.error("Error deleting photo:", error);
                });

            // delete the photo from s3
            const parts = photoToDelete.file_url.split(".com/");
            const deleteFileName = parts.pop();

            const deleteParams = {
                Bucket: config.bucketName,
                Key: deleteFileName,
            };

            client
                .send(new DeleteObjectCommand(deleteParams))
                .then((deleteResult) => {
                    console.log("Image deleted:", deleteResult)
                })
                .catch((error) => {
                    console.error("Error deleting image:", error);
                });
        }
    }

    const addPhoto = () => {
        validationSchema
            .validate({ photoName, photoDescription }, { abortEarly: false })
            .then(() => {
                const uploadPromises = [];
                // valide photo to upload
                if (photoFile == null || photoFile.size > 5000000 || photoFile == undefined) {
                    alert("Please select a file less than 5MB");
                    return;
                } else {
                    // upload the photo to s3
                    uploadPromises.push(uploadPhoto(photoFile));
                }
                Promise.all(uploadPromises)
                    .then((newFileName) => {
                        console.log("All images uploaded successfully.", newFileName); // 'fileNames' contain an array of successfully uploaded file names
                        // add photo to database
                        Axios.post(`http://localhost:3001/api/artworks/${artworkId}/addPhoto`, {
                            photo_name: photoName,
                            description: photoDescription,
                            file_url: `https://${config.bucketName}.s3.${config.region}.amazonaws.com/artwork/${newFileName}`,
                            upload_time: new Date(),
                            modify_time: new Date()
                        })
                            .then((response) => {
                                console.log(response.data);
                                setPhotoFile(null);
                                // reload the page
                                window.location.href = `/details/${artworkId}`;
                            })
                            .catch((error) => {
                                console.error("Error adding photo:", error);
                            });
                    });
            })
    }

    const updatePhoto = (photoToUpdate) => {
        validationSchema
            .validate({ photoName, photoDescription }, { abortEarly: false })
            .then(() => {
                const photoPromises = [];
                let changePhoto = false;

                // check if photo is changed
                if (photoFile != null) {  // changed, check size and type
                    if (photoFile.size > 5000000 || photoFile.size == undefined) {
                        alert("Image size should be less than 5MB");
                        return;
                    } else {
                        changePhoto = true;
                        // upload the photo to s3
                        photoPromises.push(uploadPhoto(photoFile));

                        // delete the previous photo from s3
                        const parts = photoToUpdate.file_url.split(".com/");
                        const deleteFileName = parts.pop();
                        const deleteParams = {
                            Bucket: config.bucketName,
                            Key: deleteFileName,
                        };

                        const deletePromise = client
                            .send(new DeleteObjectCommand(deleteParams))
                            .then((deleteResult) => {
                                console.log("Previous image deleted:", deleteResult)
                            })
                            .catch((error) => {
                                console.error("Error deleting previous image:", error);
                            });
                        photoPromises.push(deletePromise);
                    }
                }

                Promise.all(photoPromises)
                    .then((newFileName) => {
                        console.log("All images uploaded successfully.", newFileName); // 'fileNames' contain an array of successfully uploaded file names
                        // patch photo
                        Axios.patch(`http://localhost:3001/api/artworks/${artworkId}/editPhoto/${photoToUpdate._id}`, {
                            // newPhoto
                            photo_name: photoName,
                            description: photoDescription,
                            file_url: !changePhoto ? photoToUpdate.file_url : `https://${config.bucketName}.s3.${config.region}.amazonaws.com/artwork/${newFileName[0]}`,
                            upload_time: photoToUpdate.upload_time,
                            modify_time: new Date()
                        })
                            .then((response) => {
                                console.log(response.data);
                                setPhotoFile(null);
                                // reload the page
                                window.location.href = `/details/${artworkId}`;
                            })
                            .catch((error) => {
                                console.error("Error updating photo:", error);
                            });
                    })
                    .catch((error) => {
                        console.error("Image failed to upload:", error);
                    });
            })
            .catch((validationErrors) => {
                console.error("Validation errors:", validationErrors);
            });
    };

    const validationSchema = Yup.object().shape({
        photoName: Yup.string()
            .min(1, "Title must be at least 10 Characters, Only Letters Or Spaces.")
            .max(50, "Title must not exceed 50 characters.")
            .matches(/^[a-zA-Z ]*$/, "Only letters and spaces are allowed")
            .required("Title is required"),
        photoDescription: Yup.string()
            .min(5, "Description must be at least 5 characters")
            .max(100, "Description must not exceed 100 characters")
            .matches(
                /^[a-zA-Z0-9 ./,_()-]*$/,
                "Item name must only contain uppercase, lowercase, digits, spaces, and: ./,_()-"
            )
            .required("Description is required"),
    });
    console.log(author_id);
    console.log(userId);

    return (
        <>
            <div className='mainInfo m-5 p-3'>
                <div className='font-bold text-3xl'>{artworkToUpdate.title}</div>
                <div className="text-2xl p-3">{artworkToUpdate.description}</div>
                <div className="p-1 flex">
                    {(artworkToUpdate.tags == undefined || artworkToUpdate.tags.length == 0) ? (<></>) : (
                        artworkToUpdate.tags.map((tag, tagIndex) => {
                            //Find the corresponding tag object in tagList
                            const tagData = tagList.find(t => t._id === tag.tag_id);
                            return (
                                <div key={tagIndex} className="font-serif capitalize p-1 text-xl inline ml-2 bg-sky-500/50 rounded-lg">
                                    {tagData ? tagData.tag : ""}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className='photos  m-5 p-3 flex'>
                <div className='flex flex-wrap justify-center'>
                    {(artworkToUpdate.photos == undefined || artworkToUpdate.photos.length == 0) ? (<></>) : (
                        <>
                            {artworkToUpdate.photos.map((photo, photoIndex) => {
                                return (
                                    <div key={photoIndex} className='m-3 p-3 border-2'>
                                        <img src={photo.file_url} className='w-60 h-80 justify-center m-auto p-2' alt="Artwork" />
                                        <div className="text-xl p-3 text-center font-bold subpixel-antialiased capitalize">{photo.photo_name}</div>
                                        <div className="text-l p-3 pt-0 capitalize">{photo.description}</div>
                                        <div className="button-group flex p-3 pt-0 rounded-full justify-center mb-5">
                                            {/* only buyer or author can download */}
                                            {author_id === userId || isPaid ? (<>
                                                <a href={photo.file_url} download={photo.photo_name} className='flex justify-center'>
                                                    <button className="border-2 items-center p-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                        </svg>
                                                    </button>
                                                </a></>) : (<> </>)}
                                            {/* only author can download */}
                                            {author_id === userId ?
                                                (<>
                                                    <button className="border-2 items-center p-1"
                                                        onClick={() => handleEditBox(photo, true)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                    </button>
                                                    <button className="items-center border-2 p-1"
                                                        onClick={() => deletePhoto(photo)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button></>) : (<> </>)}


                                        </div>
                                        <div className="items-center flex justify-center">

                                        </div>
                                    </div>
                                );
                            })}
                        </>)}
                </div>
                {/* only author can add photo */}
                {author_id !== userId ? (<></>) : (<>
                    <div className='addPhotoBtn flex flex-wrap justify-center pt-3 m-5 p-5'>
                        <button className="border-4 w-60 h-60 m-auto flex flex-col justify-center items-center rounded-full" onClick={() => handleEditBox(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                            </svg>
                            <div className="text-2xl font-bold subpixel-antialiased capitalize">add photo</div>
                        </button>
                    </div></>)}
            </div>

            {!showEdit ? (<></>) : (
                <div className='editBox mb-2'>
                    <div className="text-2xl font-semibold capitalize text-center">{isAdd ? (<>Add photo</>) : (<>Edit Photo</>)}</div>
                    <div className="flex justify-center items-center">
                        <div className='editForm border-2 m-5 p-3'>
                            <div className="mb-4 p-3 pt-0">
                                <label htmlFor="formPhotoName" className="block font-medium mb-2">photo Name:</label>
                                <input
                                    type="text"
                                    id="formPhotoName"
                                    name="photoName"
                                    className="block w-full border border-gray-300 rounded p-2"
                                    defaultValue={isAdd ? '' : photoToUpdate.photo_name}
                                    onChange={(e) => setPhotoName(e.target.value)}
                                />
                                <p className="text-gray-500 text-sm">Required, 10-50 Characters, Only Letters Or Spaces.
                                </p>
                            </div>
                            <div className="mb-4 p-3">
                                <label htmlFor="formPhotoDes" className="block font-medium mb-2">photo Description:</label>
                                <input
                                    type="text"
                                    id="formPhotoDes"
                                    name="photoDes"
                                    className="block w-full border border-gray-300 rounded p-2"
                                    defaultValue={isAdd ? '' : photoToUpdate.description}
                                    onChange={(e) => setPhotoDescription(e.target.value)}
                                />
                                <p className="text-gray-500 text-sm">Required, 50-100 Characters.</p>
                            </div>
                            <div className="mb-4 p-3">
                                <label htmlFor="formUploadPhoto" className="block font-medium">Upload Image:</label>
                                <input
                                    type="file"
                                    id="formUploadPhoto"
                                    name="uploadPhoto"
                                    accept=".jpg, .png, .jpeg"
                                    className="block w-full border border-gray-300 rounded p-2"
                                    onChange={(e) => setPhotoFile(e.target.files[0])}

                                />
                                <p className="text-gray-500 text-sm">Required, Image Format Should Be JPG Or PNG.</p>
                            </div>
                            <div className="flex items-center mt-4 font-bold justify-center">
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-4"
                                    variant="warning"
                                    onClick={() => { isAdd ? (addPhoto()) : (updatePhoto(photoToUpdate)) }}
                                >
                                    {isAdd ? (<>Save</>) : (<>Update</>)}
                                </button>

                                <button
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                                    variant="warning"
                                    onClick={() => setShowEdit(!showEdit)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>)}
        </>

    )
}
