import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../Helpers/AuthContext";
import { Transition } from "@headlessui/react";

function AdmincenterCompoment() {
  // the id of admin
  let { id } = useParams();
  const Navigate = useNavigate("");
  const myRef = useRef(null);
  //fetch user list
  const [userList, setUserList] = useState([]);
  //fetch artwork list
  const [artworkList, setArtworkList] = useState([]);
  //fetch tag list
  const [tagList, setTagList] = useState([]);
  //tag edit status
  const [tagisOpen, setTagIsOpen] = useState(false);
  // tag description status
  const [tag, setTag] = useState([]);
  //fetch current user
  const [user, setUser] = useState(localStorage.getItem("user"));
  //create a new user
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // message and errors
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    //fetch current user information
    axios
      .get(`http://localhost:3001/api/users/userProfile/${id}`)
      .then((res) => {
        setUser(res.data.user);
        if (res.data.user.role == "admin") {
          axios.get("http://localhost:3001/api/users").then((response) => {
            setUserList(response.data);
          });
        }
      });
    //fetch artwork list
    axios
      .get("http://localhost:3001/api/artworks")
      .then((response) => {
        setArtworkList(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

    // Fetch the tag list
    axios
      .get("http://localhost:3001/api/tags")
      .then((response) => {
        setTagList(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [user._id]);

  //disable/Enable an existing user by email
  const disableUser = (event, email, disableorenable) => {
    event.preventDefault();
    let requestUrl = "";
    if (disableorenable == "disable") {
      requestUrl = `http://localhost:3001/api/users/disableuser/${email}`;
    } else {
      requestUrl = `http://localhost:3001/api/users/enable/${email}`;
    }
    axios
      .get(requestUrl)
      .then((response) => {
        if (response.data.error) {
          const { message: resMessage } = error.response.data;
          setError(resMessage);
        } else {
          window.location.reload();
          const { message: resMessage } = response.data;
          setMessage(resMessage);
        }
      })
      .catch((error) => {
        const { message: resMessage } = error.response.data;
        setError(resMessage);
      });
  };

  //delete artwork by id
  const deleteArtworkById = (event, artworkid) => {
    event.preventDefault();
    axios
      .delete(`http://localhost:3001/api/artworks/${artworkid}`)
      .then((response) => {
        window.location.reload();
        const { message: resMessage } = response.data;
        setMessage(resMessage);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  //delete tag by id
  const deleteTagById = (event, tagid) => {
    event.preventDefault();
    axios
      .delete(`http://localhost:3001/api/tags/${tagid}`)
      .then((response) => {
        window.location.reload();

        const { message: resMessage } = response.data;
        setMessage(resMessage);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  //update tag by id
  const updateTagById = (event, tagid) => {
    event.preventDefault();
    axios
      .put(`http://localhost:3001/api/tags/${tagid}`)
      .then((response) => {
        window.location.reload();
        const { message: resMessage } = response.data;
        setMessage(resMessage);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  //todo: update tag description by id
  //add tag
  const addTag = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:3001/api/tags", {
        tag,
      })
      .then((response) => {
        // Handle the response if needed
        console.log("response data:" + response.data);
        const { message: resMessage } = response.data;
        setMessage(resMessage);
        setTagIsOpen(!tagisOpen);
      })
      .catch((error) => {
        // Handle errors
        setError(error.response.data.message);
      });
  };
  return (
    <div>
      {/* user management */}
      {error && <div className="text-red-500 mb-8">{error}</div>}
      {message && <div className="text-green-500 mb-8">{message}</div>}
      <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
        <thead scope="col" className="bg-gray-50">
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            User Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
            User Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            User role
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
            Disable/Enable
          </th>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {userList.length > 0 ? (
            <>
              {userList.map((user, index) => (
                <div key={index} class="table-row">
                  <div className="table-cell ">{user.username}</div>
                  <div className="table-cell ">{user.email}</div>
                  <div className="table-cell ">{user.role}</div>

                  <div className="table-cell ">
                    <button
                      type="submit"
                      className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                      onClick={(event) => {
                        disableUser(
                          event,
                          user.email,
                          user.role == "disable" ? "enable" : "disable"
                        );
                      }}
                    >
                      {user.role != "disable" ? <>Disable</> : <>Enable</>}
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p>No users!</p>
          )}
        </tbody>
      </table>

      {/* artwork management */}
      {error && <div className="text-red-500 mb-8">{error}</div>}
      {message && <div className="text-green-500 mb-8">{message}</div>}
      <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
        <thead scope="col" className="bg-gray-50">
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Artwork Id
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
            description
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            title
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
            View
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
            Delete
          </th>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {artworkList.length > 0 ? (
            <>
              {artworkList.map((artwork, index) => (
                <div key={index} class="table-row">
                  <div className="table-cell ">{artwork._id}</div>
                  <div className="table-cell ">{artwork.description}</div>
                  <div className="table-cell ">{artwork.title}</div>
                  {/* view button */}
                  <div className="table-cell ">
                    <button
                      type="submit"
                      className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                      onClick={() => {
                        Navigate(`/details/${artwork._id}`, {
                          state: { page: "myAssets" }, //fix me: page attribute
                        });
                      }}
                    >
                      view
                    </button>
                  </div>
                  {/* delete button */}
                  <div className="table-cell ">
                    <button
                      type="submit"
                      className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                      onClick={(event) => {
                        deleteArtworkById(event, artwork._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <div class="table-row">
                <button
                  type="submit"
                  className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                  onClick={() => Navigate("/addArtwork")}
                >
                  Add Artwork
                </button>
              </div>
            </>
          ) : (
            <p>No artwork!</p>
          )}
        </tbody>
      </table>
      {/* end artworklist */}
      {/*tag list */}
      {error && <div className="text-red-500 mb-8">{error}</div>}
      {message && <div className="text-green-500 mb-8">{message}</div>}
      <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
        <thead scope="col" className="bg-gray-50">
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tag Id
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
            description
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Count
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
            Edit Description
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
            Delete
          </th>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tagList.length > 0 ? (
            <>
              {tagList.map((tag, index) => (
                <div key={index} class="table-row">
                  <div className="table-cell ">{tag._id}</div>
                  <div className="table-cell ">{tag.tag}</div>
                  <div className="table-cell ">{tag.count}</div>
                  {/* view button */}
                  <div className="table-cell ">
                    <button
                      type="submit"
                      className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                      onClick={(event) => {
                        updateTagById(event, tag._id);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  {/* delete button */}
                  <div className="table-cell ">
                    <button
                      type="submit"
                      className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
                      onClick={(event) => {
                        deleteTagById(event, tag._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p>No tags!</p>
          )}
        </tbody>
      </table>
      <button
        type="submit"
        className={`font-serif capitalize p-1 text-sm inline ml-2 rounded-lg bg-sky-600 text-white mt-2`}
        onClick={() => setTagIsOpen(!tagisOpen)}
      >
        Add Tag
      </button>

      <Transition
        show={tagisOpen}
        enter="transition ease-out duration-100 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        {(ref) => (
          <div
            ref={myRef}
            // className="origin-top-right absolute right-0 mt-2 w-50 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            // role="menu"
            // aria-orientation="vertical"
            // aria-labelledby="options-menu"
          >
            <div className="w-1/3 mx-auto">
              <form>
                <h1 className="text-3xl my-5 font-bold text-center">
                  Create New Tag
                </h1>

                <div className="mb-4">
                  <label className="text-left block text-sm font-medium text-gray-700">
                    Tag name:
                  </label>

                  <input
                    type="text"
                    placeholder="Enter username"
                    className="mt-1 p-2 w-full rounded-md border border-gray-300"
                    name="tag"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                  />
                </div>

                <button
                  onClick={addTag}
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Create Tag
                </button>
              </form>
              {error && <div className="text-red-500 mb-8">{error}</div>}
              {message && <div className="text-green-500 mb-8">{message}</div>}
            </div>
          </div>
        )}
      </Transition>
      {/* end tag list */}
    </div>
  );
}

export default AdmincenterCompoment;
