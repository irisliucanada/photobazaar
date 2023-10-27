import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Helpers/AuthContext";
import UploadImagesBoxComponent from "./UploadImagesBox";
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
//S3 config
const config = {
  bucketName: "photobazarr",
  dirName: "userprofile",
  region: "ca-central-1",
  credentials: {
    accessKeyId: process.env.REACT_APP_ACCESSKEYID,
    secretAccessKey: process.env.REACT_APP_SECRETACCESSKEY,
  },
};
const client = new S3Client(config);
function ProfileComponent() {
  let { id } = useParams();
  const Navigate = useNavigate();
  const [user, setUser] = useState(localStorage.getItem("user"));
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatepwd, setUpdatepwd] = useState(false);
  const [adminBoolean, setadminBoolean] = useState(false);
  const [userList, setUserList] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  //show the update profile icon part if user want to update
  const [updateProfile, setupdateProfile] = useState(false);
  const [uploadImg, setUploadImg] = useState([]);
  //user add profile or update profile
  const [isAdd, setisAdd] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/users/userProfile/${id}`)
      .then((res) => {
        setUser(res.data.user);
        if (res.data.user.role == "admin") {
          setadminBoolean(true);
          console.log("user role is admin");
          axios.get("http://localhost:3001/api/users").then((response) => {
            setUserList(response.data);
            console.log("users list" + response.data[0].email);
          });
        }
        console.log("profile basic infor res.data.user:" + res.data.user.email);
      });
  }, [id]);

  // useEffect(() => {
  //   axios.get("http://localhost:3001/api/users").then((res) => {
  //     setUserList(res.data.users);
  //   });
  // }, []);

  //edit user name by email
  const editUsername = (event) => {
    event.preventDefault();
    console.log("inside edit user name function front end" + username);
    axios
      .put(`http://localhost:3001/api/users/changeusername/${user.email}`, {
        username,
      })
      .then((response) => {
        if (response.data.error) {
          const { message: resMessage } = error.response.data;
          setError(resMessage);
        } else {
          const { message: resMessage } = response.data;
          setMessage(resMessage);
        }
      })
      .catch((error) => {
        const { message: resMessage } = error.response.data;
        setError(resMessage);
      });
  };
  //update user password
  const updatePassword = (event) => {
    event.preventDefault();
    axios
      .put(`http://localhost:3001/api/users/changepassword/${user.email}`, {
        password,
        confirmPassword,
      })
      .then((response) => {
        if (response.data.error) {
          const { message: resMessage } = error.response.data;
          setError(resMessage);
        } else {
          const { message: resMessage } = response.data;
          setMessage(resMessage);
          // Navigate("/login");
        }
      })
      .catch((error) => {
        const { message: resMessage } = error.response.data;
        setError(resMessage);
      });
  };
  //disable an existing user by email
  const disableUser = (event, email) => {
    event.preventDefault();
    console.log("inside delete user function front end" + email);
    axios
      .get(`http://localhost:3001/api/users/disableuser/${email}`)
      .then((response) => {
        if (response.data.error) {
          const { message: resMessage } = error.response.data;
          setError(resMessage);
        } else {
          const { message: resMessage } = response.data;
          setMessage(resMessage);
        }
      })
      .catch((error) => {
        const { message: resMessage } = error.response.data;
        setError(resMessage);
      });
  };
  //when user click update password button, it shows the password fields
  const enableUpdatepwd = (event) => {
    event.preventDefault();
    setUpdatepwd(true);
  };
  // when user click update profile button, it shows the image upload field
  const enableProfileIcon = (event, isadd) => {
    event.preventDefault();
    setupdateProfile(true);
    if (isadd == "add") setisAdd(true);
    else setisAdd(false);
  };

  const handleSaveCoverImage = (e) => {
    e.preventDefault();
    const data = {
      file: e.target.files[0],
    };
    const newUploadImg = [...uploadImg, data];
    setUploadImg(newUploadImg);
  };

  // save profile image to s3 bucket
  const saveImage = (img) => {
    let newFileName = `${Date.now()}_${user._id}.avator.${img.file.name
      .split(".")
      .pop()}`;
    console.log("new file name:" + newFileName);

    const uploadParams = {
      Bucket: config.bucketName,
      Key: "userprofile/" + newFileName,
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

    //Validate Image
    const uploadPromises = []; // Create an array to store promises for image uploads
    if (
      uploadImg === null ||
      uploadImg === undefined ||
      uploadImg.size > 5000000
    ) {
      alert("Please select a file less than 5MB");
      return;
    } else {
      // save image to s3 bucket
      console.log(uploadImg[0]);
      uploadPromises.push(saveImage(uploadImg[0]));
    }
    // Use Promise.all to wait for all image uploads to complete
    Promise.all(uploadPromises)
      .then((newFileNames) => {
        console.log("All images uploaded successfully.", newFileNames); // 'fileNames' contain an array of successfully uploaded file names

        // save artwork to database
        // axios
        //   .put(`http://localhost:3001/api/users/profile/${user.email}`, {
        //     avatar: `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${config.dirName}/${fileName}`,
        //   })
        //   .then((response) => {
        //     console.log(response);
        //     alert("Artwork saved successfully!");
        //   })
        //   .catch((error) => {
        //     console.error(error);
        //   });
      })
      .catch((uploadErrors) => {
        console.error("Error uploading images:", uploadErrors);
      });
  };

  return (
    <>
      {user.role == "user" ? (
        <>
          <div className="my-4">
            <div className="container mx-auto capitalize">
              <form>
                {/* user id field */}
                <div className="mb-4">
                  <label
                    htmlFor="formArtworkId"
                    className="block font-medium mb-2"
                  >
                    User Id:
                  </label>
                  <input
                    type="text"
                    id="_id"
                    name="_id"
                    className="block w-1/2 border border-gray-300 rounded p-2"
                    defaultValue={user._id}
                    readOnly
                  />
                </div>
                {/* user name field */}
                <div className="mb-4">
                  <label
                    htmlFor="formArtworkId"
                    className="block font-medium mb-2"
                  >
                    User name:
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className=" w-1/2 border border-gray-300 rounded p-2"
                    defaultValue={user.username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <button
                    type="submit"
                    className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                    onClick={(event) => editUsername(event)}
                  >
                    Update
                  </button>
                </div>

                {/* user email field */}
                <div className="mb-4">
                  <label
                    htmlFor="formArtworkId"
                    className="block font-medium mb-2"
                  >
                    User email:
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    className="block w-1/2 border border-gray-300 rounded p-2"
                    defaultValue={user.email}
                    readOnly
                  />
                </div>

                {/* user role field */}
                <div className="mb-4">
                  <label
                    htmlFor="formArtworkId"
                    className="block font-medium mb-2"
                  >
                    User role:
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    className="block w-1/2 border border-gray-300 rounded p-2"
                    defaultValue={user.role}
                    readOnly
                  />
                </div>
                <button
                  className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                  onClick={(event) => enableUpdatepwd(event)}
                >
                  upadate password
                </button>
                {updatepwd ? (
                  <div>
                    <div className="mb-4">
                      <label
                        htmlFor="password"
                        className="block font-medium mb-2"
                      >
                        new password:
                      </label>
                      <input
                        placeholder="new password..."
                        type="password"
                        id="password"
                        name="password"
                        className="block w-1/2 border border-gray-300 rounded p-2"
                        defaultValue=""
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="confirmPassword"
                        className="block font-medium mb-2"
                      >
                        confirm password:
                      </label>
                      <input
                        placeholder="confirm new password..."
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="block w-1/2 border border-gray-300 rounded p-2"
                        defaultValue=""
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                      onClick={(event) => updatePassword(event)}
                    >
                      submit new password
                    </button>
                  </div>
                ) : (
                  <></>
                )}
                {/* update profile icon */}
                <button
                  className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                  onClick={(event) =>
                    enableProfileIcon(
                      event,
                      user.avatar == "" ? "add" : "update"
                    )
                  }
                >
                  {user.avatar == null ? (
                    <>Add Profile Icon</>
                  ) : (
                    <>Update Profile Icon</>
                  )}
                </button>
                {updateProfile ? (
                  <div>
                    <div className="mb-4">
                      <label
                        htmlFor="choosefile"
                        className="block font-medium mb-2"
                      >
                        Choose file
                      </label>
                      <input
                        type="file"
                        id="formCoverUrl"
                        name="coverUrl"
                        accept=".jpg, .png, .jpeg"
                        multiple={false}
                        className="block w-full border border-gray-300 rounded p-2"
                        onChange={(e) => handleSaveCoverImage(e)}
                      />
                      <button
                        type="submit"
                        className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                        onClick={(event) => saveArtwork(event)}
                      >
                        Upload Profile Icon
                      </button>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </form>
            </div>
          </div>
        </>
      ) : (
        <>
          {error && <div className="text-red-500 mb-8">{error}</div>}
          {message && <div className="text-green-500 mb-8">{message}</div>}
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 ">
              <div className="table-cell text-left w-1/100">User Name</div>
              <div className="table-cell text-left px-6 py-3 ">User Email</div>
              <div className="table-cell text-left px-6 py-3">User role</div>
              {/* <div className="table-cell text-left ">edit</div> */}
              <div className="table-cell text-left ">Disable</div>
            </thead>
            <div className="table-row-group">
              {userList.length > 0 ? (
                <>
                  {userList.map((user, index) => (
                    <div key={index} class="table-row">
                      <div className="table-cell ">{user.username}</div>
                      <div className="table-cell ">{user.email}</div>
                      <div className="table-cell ">{user.role}</div>

                      {/* disable button */}
                      <div className="table-cell ">
                        <button
                          type="submit"
                          className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                          onClick={(event) => disableUser(event, user.email)}
                        >
                          Disable
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p>No users!</p>
              )}
            </div>
          </table>

          {/* search artworkid */}
        </>
      )}
    </>
  );
}

export default ProfileComponent;
