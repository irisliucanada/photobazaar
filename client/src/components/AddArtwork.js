import React, { useState, useEffect } from "react";
import Axios from "axios";
import * as Yup from "yup";
import UploadImagesBoxComponent from "./UploadImagesBox";
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { useNavigate } from "react-router-dom";
export default AddArtworkComponent;

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

function AddArtworkComponent({ isAdd, artwork_id }) {
  const [tagList, setTagList] = useState([]); // all tags
  const [tagArray, setTagArray] = useState([]);
  const tags = tagArray.map((data) => ({ tag_id: data }));
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [artworkToUpdate, setArtworkToUpdate] = useState([]);
  // box handle adding photo
  const [imagesBoxes, setImagesBoxes] = useState([
    {
      index: 1,
      status: "show",
    },
  ]);

  useEffect(() => {
    if (token) {
      Axios.get(`http://localhost:3001/api/users/auth`, {
        headers: { accessToken: token },
      })
        .then((response) => {
          setToken(response.data.token);
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, []);

  // when + click, show a new image box
  const handleAddImagesBox = (event) => {
    event.preventDefault();
    const newImagesBox = {
      index: imagesBoxes.length + 1,
      status: "show",
    };

    const newImagesBoxes = [...imagesBoxes, newImagesBox];
    setImagesBoxes(newImagesBoxes);
    if (newImagesBoxes.length === 8) {
      // disable the add image button
      alert("You can only upload 8 images.");
    }
  };

  // when - click, hide the image box
  const handleShowImagesBox = (index) => {
    //change status in newImagesBoxes based on index
    const updatedUploadImages = imagesBoxes.filter(
      (imagesBox) => imagesBox.index !== index
    );
    setImagesBoxes(updatedUploadImages);
  };

  // dynamic add choosed tags in array and show in input
  const handleTags = (event, id) => {
    event.preventDefault();

    if (tagArray.includes(id)) {
      const updatedTagArray = tagArray.filter((_id) => _id !== id);
      setTagArray(updatedTagArray);
    } else {
      if (tagArray.length < 5) {
        setTagArray([...tagArray, id]);
      } else {
        alert("You can only choose 5 tags.");
      }
    }
  };

  // get artwork data if it is edit
  useEffect(() => {
    if (!isAdd) {
      Axios.get(`http://localhost:3001/api/artworks/${artwork_id}`)
        .then((response) => {
          setArtworkToUpdate(response.data);
          setTagArray(response.data.tags.map((tag) => tag.tag_id));
          setTitle(response.data.title);
          setDescription(response.data.description);
          setPrice(response.data.price);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  // get all the tags
  useEffect(() => {
    Axios.get("http://localhost:3001/api/tags")
      .then((response) => {
        setTagList(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState();
  const [uploadImg, setUploadImg] = useState([]); // all images to upload
  let index = 0; // index for each image in uploadImg, 0 is cover image, 1-8 are photos

  // save cover image to uploadImg
  const handleSaveCoverImage = (event) => {
    event.preventDefault();
    const data = {
      index: 0,
      name: title,
      description: "cover image",
      file: event.target.files[0],
    };
    const newUploadImg = [...uploadImg, data];
    setUploadImg(newUploadImg);
  };

  // save photos from image box to uploadImg
  const handleSaveChildrenPhoto = (data) => {
    const updatedUploadImages = uploadImg.filter(
      (photo) => photo.index !== data.index
    );
    const newUploadImg = [...updatedUploadImages, data];
    setUploadImg(newUploadImg);
  };

  // save image to s3 bucket
  const saveImage = (img, flag) => {
    // flag = 0 is cover image
    let newFileName = "";

    if (flag == 0) {
      newFileName = `${Date.now()}_${user.id}.cover.${img.file.name
        .split(".")
        .pop()}`;
    } else {
      newFileName = `${Date.now()}.${index++}_${user.id}.photo.${img.file.name
        .split(".")
        .pop()}`;
    }

    const uploadParams = {
      Bucket: config.bucketName,
      Key: "artwork/" + newFileName,
      Body: img.file,
    };
    // Create a promise for each image upload
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
  };

  // save new artwork to database
  const saveArtwork = (event) => {
    event.preventDefault();

    validationSchema
      .validate({ title, description, price }, { abortEarly: false })
      .then(() => {
        //Validate Cover Image
        const uploadPromises = []; // Create an array to store promises for image uploads
        if (
          uploadImg === null ||
          uploadImg[0] === null ||
          uploadImg[0] === undefined ||
          uploadImg[0].file.size > 5000000
        ) {
          alert("Please select a file less than 5MB");
          return;
        } else {
          // save cover image to s3 bucket
          uploadPromises.push(saveImage(uploadImg[0], 0));
          // save photos to s3 bucket
          for (let i = 1; i < uploadImg.length; i++) {
            uploadPromises.push(saveImage(uploadImg[i], 1));
          }
        }
        // Use Promise.all to wait for all image uploads to complete
        Promise.all(uploadPromises)
          .then((fileNames) => {
            console.log("All images uploaded successfully.", fileNames[0]); // 'fileNames' contain an array of successfully uploaded file names
            // get photos data
            const photos = [];
            for (let i = 0; i < uploadImg.length; i++) {
              photos.push({
                photo_name: uploadImg[i].name,
                description: uploadImg[i].description,
                file_url: `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${config.dirName}/${fileNames[i]}`,
                upload_time: new Date(),
                modify_time: new Date(),
              });
            }

            // save artwork to database
            Axios.post("http://localhost:3001/api/artworks", {
              author_id: user.id,
              title: title,
              description: description,
              price: parseFloat(price),
              cover_url: `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${config.dirName}/${fileNames[0]}`,
              tags: tags,
              photos: photos.slice(1), // exclude cover image
            })
              .then((response) => {
                console.log(response);
                alert("Artwork saved successfully!");
                navigate(`/artwork/${user.id}`);
                index = 0; // reset index to 0

                // add artwork_id to user
                // Axios.patch(`http://localhost:3001/api/users/my_assets/${user.id}`, {
                //     my_assets: response.data._id,
                // }).then((response) => {
                //     console.log("after patch," + response);
                // })
                //     .catch((error) => {
                //         console.error(error);
                //     });

                // add tag count
                tagArray.forEach((tag) => {
                  Axios.patch(
                    `http://localhost:3001/api/tags/updateTagCountIncrease/${tag}`,
                    {
                      increseBy: 1,
                    }
                  )
                    .then((response) => {
                      console.log("after patch," + response);
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                });
              })
              .catch((error) => {
                console.error(error);
              });
          })
          .catch((uploadErrors) => {
            console.error("Error uploading images:", uploadErrors);
          });
      })
      .catch((validationErrors) => {
        console.error("Validation errors:", validationErrors);
      });
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .min(1, "Title must be at least 10 Characters, Only Letters Or Spaces.")
      .max(50, "Title must not exceed 50 characters.")
      .matches(/^[a-zA-Z ]*$/, "Only letters and spaces are allowed")
      .required("Title is required"),
    description: Yup.string()
      .min(5, "Description must be at least 5 characters")
      .max(100, "Description must not exceed 100 characters")
      .matches(
        /^[a-zA-Z0-9 ./,_()-]*$/,
        "Item name must only contain uppercase, lowercase, digits, spaces, and: ./,_()-"
      )
      .required("Description is required"),
    price: Yup.number()
      .min(0, "price must be equal or higher than 0")
      .required("price is required")
      .test("is-decimal", "Price must be a decimal number", (value) => {
        if (value === undefined) return true; // Allow undefined values
        return /^\d+(\.\d+)?$/.test(value);
      }),
  });

  // update artwork main info(title, description, price, tags, cover page) to database if it is edit
  const updateArtwork = (event) => {
    event.preventDefault();
    validationSchema
      .validate({ title, description, price }, { abortEarly: false })
      .then(() => {
        //Validate Cover Image
        const uploadPromises = [];
        let changeCover = false;
        if (uploadImg.length >= 1) {
          console.log(uploadImg[0].file.name);
          if (uploadImg[0].file.size > 5000000 || uploadImg[0] === undefined) {
            alert("Please select a file less than 5MB");
            return;
          } else {
            changeCover = true;
            // save cover image to s3 bucket
            uploadPromises.push(saveImage(uploadImg[0], 0));

            // delete old cover image from s3 bucket
            const parts = artworkToUpdate.cover_url.split(".com/");
            const deleteFileName = parts.pop();
            const deleteParams = {
              Bucket: config.bucketName,
              Key: deleteFileName, // Specify the path to the file you want to delete
            };

            client
              .send(new DeleteObjectCommand(deleteParams))
              .then((data) => console.log(data))
              .catch((error) => console.log(error));
          }
        }
        Promise.all(uploadPromises)
          .then((fileNames) => {
            console.log("All images uploaded successfully.", fileNames); // 'fileNames' contain an array of successfully uploaded file names

            // patch artwork to database
            Axios.patch(
              `http://localhost:3001/api/artworks/mainInfo/${artworkToUpdate._id}`,
              {
                title: title,
                description: description,
                price: parseFloat(price),
                cover_url: !changeCover
                  ? artworkToUpdate.cover_url
                  : `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${config.dirName}/${fileNames[0]}`,
              }
            )
              .then((response) => {
                console.log(response);
                alert("Artwork updated successfully!");
              })
              .catch((error) => {
                console.error(error);
              });

            // compare old tag array and new tag array
            const oldTagArray = artworkToUpdate.tags.map((tag) => tag.tag_id);

            // find tags that are in old tag array but not in new tag array, decrease count
            const decreaseTagArray = oldTagArray.filter(
              (tag) => !tagArray.includes(tag)
            );
            if (decreaseTagArray.length > 0) {
              decreaseTagArray.forEach((tag) => {
                Axios.patch(
                  `http://localhost:3001/api/tags/updateTagCountDecrease/${tag}`,
                  {
                    decreaseBy: 1,
                  }
                )
                  .then((response) => {
                    console.log("after patch," + response);
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              });
            }

            // find tags that are in new tag array but not in old tag array, increase count
            const increaseTagArray = tagArray.filter(
              (tag) => !oldTagArray.includes(tag)
            );
            if (increaseTagArray.length > 0) {
              increaseTagArray.forEach((tag) => {
                Axios.patch(
                  `http://localhost:3001/api/tags/updateTagCountIncrease/${tag}`,
                  {
                    increaseBy: 1,
                  }
                )
                  .then((response) => {
                    console.log("after patch," + response);
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              });
            }
            navigate(`/artwork/${user.id}`);
          })
          .catch((uploadErrors) => {
            console.error("Error uploading images:", uploadErrors);
          });
      })
      .catch((validationErrors) => {
        console.error("Validation errors:", validationErrors);
      });
  };

  return (
    <div className="editArtworkBox m-5 p-5 capitalize">
      <div className="text-2xl font-bold subpixel-antialiased">
        {" "}
        {isAdd ? <>Create artwork</> : <>Edit artwork</>}
      </div>
      <div className="mainInfoBox">
        <div className="text-xl font-semibold capitalize mt-5 mb-4">
          General Information
        </div>
        <div className="generalInfoBox flex items-center">
          <form>
            <div>
              {isAdd ? (
                <></>
              ) : (
                <>
                  <div className="mb-4">
                    <label
                      htmlFor="formArtworkId"
                      className="block font-medium mb-2"
                    >
                      artwork Id:
                    </label>
                    <input
                      type="text"
                      id="formArtworkId"
                      name="artworkId"
                      className="block w-full border border-gray-300 rounded p-2"
                      defaultValue={artwork_id}
                      readOnly
                    />
                  </div>
                </>
              )}

              <div className="mb-4">
                <label
                  htmlFor="formArtworkTitle"
                  className="block font-medium mb-2"
                >
                  title:
                </label>
                <input
                  type="text"
                  id="formArtworkTitle"
                  name="artworkTitle"
                  defaultValue={isAdd ? "" : artworkToUpdate.title}
                  className="block w-full border border-gray-300 rounded p-2"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-gray-500 text-sm">
                  Required, 10-50 characters, only letters or spaces.
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="formArtworkDescription"
                  className="block font-medium mb-2"
                >
                  Description:
                </label>
                <input
                  type="text"
                  id="formArtworkDescription"
                  name="artworkDescription"
                  defaultValue={isAdd ? "" : artworkToUpdate.description}
                  className="block w-full border border-gray-300 rounded p-2"
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-gray-500 text-sm">
                  Required, 50-100 characters.
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="formCoverUrl"
                  className="block font-medium mb-2"
                >
                  cover image:
                </label>
                {isAdd ? (
                  <></>
                ) : (
                  <>
                    <img
                      src={artworkToUpdate.cover_url}
                      alt="cover image"
                      className="w-1/3 my-3 border-2"
                    />
                  </>
                )}
                <input
                  type="file"
                  id="formCoverUrl"
                  name="coverUrl"
                  accept=".jpg, .png, .jpeg"
                  multiple={false}
                  className="block w-full border border-gray-300 rounded p-2"
                  onChange={handleSaveCoverImage}
                />
                <p className="text-gray-500 text-sm">
                  Required, image format should be JPG or PNG.
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="formArtworkTag"
                  className="block font-medium mb-2"
                >
                  Tags:
                </label>
                <input
                  type="text"
                  id="formArtworkTag"
                  name="artworkTag"
                  defaultValue={tagArray
                    .map((id) => {
                      const matchingTag = tagList.find((tag) => tag._id === id);
                      return matchingTag ? matchingTag.tag : ""; // If a matching tag is found, return its tag, otherwise an empty string
                    })
                    .join(", ")}
                  className="block w-full border border-gray-300 rounded p-2 mb-2"
                />
                <p className="text-gray-500 text-sm">
                  Required, maximum choose 5 tags.
                </p>
                {tagList.map((tag, index) => {
                  return (
                    <button
                      key={index}
                      className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                      onClick={(event) => handleTags(event, tag._id)}
                    >
                      {tag.tag}
                    </button>
                  );
                })}
              </div>

              <div className="mb-4">
                <label htmlFor="formArtworkPrice" className="block font-medium">
                  Price:
                </label>
                <input
                  type="number"
                  id="formArtworkPrice"
                  name="artworkPrice"
                  className="block w-full border border-gray-300 rounded p-2"
                  min="0"
                  step="any"
                  defaultValue={isAdd ? "" : artworkToUpdate.price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <p className="text-gray-500 text-sm">
                  Required, must be equal or higher than 0.
                </p>
              </div>
            </div>

            {isAdd ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="text-xl font-bold capitalize">Photo</div>
                  <button
                    className={"items-center px-1 bg-blue"}
                    onClick={handleAddImagesBox}
                    disabled={imagesBoxes.length >= 8}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke={imagesBoxes.length >= 8 ? "gray" : "blue"}
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-500 text-sm">
                  Required, maximum 8 photos.
                </p>

                <div className="flex flex-wrap">
                  {imagesBoxes.map((imagesBox, index) => (
                    <div key={index}>
                      <UploadImagesBoxComponent
                        key={index}
                        index={imagesBox.index}
                        status={imagesBox.status}
                        handleShowImagesBox={(index) =>
                          handleShowImagesBox(index)
                        }
                        handleSaveChildrenPhoto={handleSaveChildrenPhoto}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <></>
            )}

            <div className="flex items-center mt-4 font-bold">
              {isAdd ? (
                <>
                  <button
                    onClick={(e) => saveArtwork(e)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-4"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => updateArtwork(e)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-4"
                  >
                    Update
                  </button>
                </>
              )}

              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                variant="warning"
                onClick={() => navigate(`/artwork/${user.id}`)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
