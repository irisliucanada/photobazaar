import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";
import axios from "axios";

function HeaderComponent() {
  const url = process.env.REACT_APP_API_URL;
  const Navigate = useNavigate();
  const myRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [user, setUser] = useState(localStorage.getItem("user"));
  let page = "myArtworks";


  useEffect(() => {
    if (token) {
      axios
        .get(`http://localhost:3001/api/users/auth`, {
          headers: { accessToken: token },
        })
        .then((response) => {
          setToken(response.data.token);
          setUser(response.data.user);
          // console.log("inside header:" + user.email);
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    window.location.reload("/");
  };

  return (
    <header className="bg-white">
      <nav
        className="mx-auto flex flex-wrap w-full items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="home flex lg:flex-1">
          <button onClick={() => Navigate("/")} className="-m-1.5 p-1.5">
            <span className="sr-only">Photobazarr</span>
            <img className="h-8 w-auto" src="https://photobazarr.s3.ca-central-1.amazonaws.com/logo2.png" alt="photobazarr" />
          </button>
        </div>
        <h1 className="name text-4xl font-extrabold text-gray-800 font-serif">
          PhotoBazaar
        </h1>
        <p className="slogan text-lg font-semibold text-gray-600 mx-5">
          Your Photos, Our Marketplace
        </p>
        {/* shows up when user haven't login in or sign up */}
        {!user && (
          <>
            <div className="lg:flex lg:flex-1 lg:justify-end">
              <button
                href="#"
                className="text-sm font-semibold leading-6 text-gray-900"
                onClick={() => Navigate("/login")}
              >
                Sign in <span aria-hidden="true"></span>
              </button>
              <button
                className="mx-3 text-sm bg-sky-500 font-semibold rounded-lg px-2 py-1.5 text-base leading-6 text-white hover:bg-sky-600"
                onClick={() => Navigate("/register")}
              >
                Join Us
              </button>
            </div>
          </>
        )}
        {/* shows up when user have loged in */}
        {user && (
          <>
            <div className="lg:flex lg:flex-1 lg:justify-end mx-3">
              <button
                className="block flex items-center px-1 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  Navigate(`/message`);
                }}
              >
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
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </button>
            </div>
            <div className="relative inline-block text-left">
              <img
                onClick={() => setIsOpen(!isOpen)}
                alt="tania andrew"
                className="border border-gray-900 p-0.5 w-6 h-6 object-cover rounded-full cursor-pointer"
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
              />

              <Transition
                show={isOpen}
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
                    className="origin-top-right absolute right-0 mt-2 w-50 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <div className="py-1" role="none">
                      <div className="flex mx-3 items-center">
                        <button
                          className="block flex items-center px-1 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                          onClick={() => {
                            setIsOpen(false); // Close the dropdown
                            Navigate(`/profile/${user.id}`);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6 mr-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975M23.963 18.725A9 9 0 0012 15.75a9 9 0 00-11.963 2.975M23.963 18.725A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Profile
                        </button>
                      </div>

                      <div className="mx-3 flex items-center">
                        <button
                          className="block flex items-center px-1 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                          onClick={() => {
                            setIsOpen(false);
                            Navigate(`/artwork/${user.id}`);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6 mr-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                          </svg>
                          Artworks
                        </button>
                      </div>
                      <div className="flex mx-3 items-center">
                        <button
                          className="block flex items-center px-1 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                          onClick={() => {
                            Navigate(`/asset/${user.id}`, page = "myArtworks");
                            setIsOpen(false);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 mr-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                          </svg>
                          Assets
                        </button>
                      </div>
                      <div className="flex mx-3 items-center">
                        <button
                          className="block flex items-center px-1 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                          onClick={() => {
                            // Navigate(`/cart/${user.id}`)
                            Navigate(`/cart`)
                            setIsOpen(false);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 mr-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                            />
                          </svg>
                          Cart
                        </button>
                      </div>
                      {user && user.role && user.role === "admin" && (
                        <>
                          <div className="mx-3 flex items-center">
                            <button
                              className="block flex items-center px-1 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                              onClick={() => {
                                setIsOpen(false);
                                Navigate(`/admincenter/${user.id}`);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-6 h-6 mr-2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                                />
                              </svg>
                              AdminCenter
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mx-3 flex items-center">
                      <div className="border-t border-gray-400 w-full"></div>
                    </div>
                    <div className="mx-3 flex items-center">
                      <button
                        onClick={handleLogout}
                        className="block flex items-center px-1 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </Transition>
            </div>
          </>
        )}
      </nav>
    </header>
    // </AuthContext.Provider>
  );
}

export default HeaderComponent;
