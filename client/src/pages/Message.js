import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { IoIosNotificationsOutline } from 'react-icons/io';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Message() {
    const url = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('accessToken')


    const [userList, setUserList] = useState([]);//users to chat with 
    const [selectedUser, setSelectedUser] = useState(null);//user chatting with

    const [newMessage, setNewMessage] = useState('');
    const [searchUserBy, setSearchUserBy] = useState('');//string for searching username or nickname
    const [userListFromSearch, setUserListFromSearch] = useState([]);//result of searching users
    const [socket, setSocket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);//user logged in

    useEffect(() => {
        try {
            if (token) {
                axios.get(`${url}/api/users/auth`, { headers: { accessToken: token } })
                    .then(response => {
                        const user = response.data.user
                        setCurrentUser(user)

                        axios.get(`${url}/api/messages`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                            .then(res => {
                                setUserList(res.data);
                            });
                    }).catch((err) => {
                        console.log(err)
                    });
            }
        } catch (error) {
            console.log(error)
        }

    }, [])


    useEffect(() => {
        if (!currentUser) { return };

        const newSocket = io.connect(url);
        
        newSocket.on('connect', () => {
            newSocket.emit('user_info', { id:currentUser.id,username: currentUser.username })
            console.log(currentUser.username + ' Connected to server');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        newSocket.on("sendback", function (message) {
            // console.log(message)
            setUserList((prevUserList) => {
                return prevUserList.map((user) => {
                    if (user.id === message.sender_id) {
                        if ((currentUser.id !== user.id)) {
                            user.hasMessageUnread = true;
                        }
                        return {
                            ...user,
                            messages: [...user.messages, message],
                        };
                    }

                    return user;
                });
            });

        });
        setSocket(newSocket);
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };


    }, [currentUser]);

    const selectUser = (user) => {
        setSelectedUser(user);
    };

    useEffect(() => {
        if (!selectedUser) return;
        
        selectedUser.hasMessageUnread = false;
        console.log(selectedUser);

        selectedUser.messages.forEach(async (message) => {
            if (!message.is_read && message.receiver_id === currentUser.id) {
                message.is_read = true;
                try {
                    console.log(`message is read: ${message.id}`)
                  axios.patch(`${url}/api/messages/${message.id}`, null,{ headers: { accessToken: token } });
                } catch (error) {
                  console.error(`Error patch message: ${message.id}`);
                }
            }
        });
        setUserList([...userList]);
    },[selectedUser])

    const sendMessage = () => {
        if (!socket || !selectedUser || !newMessage) return;

        const message = {
            sender_id: currentUser.id,
            receiver_id: selectedUser.id,
            message: newMessage,
        }
        socket.emit('private-message', message);

        // setMessages([...messages, message]);
        setUserList((prevUserList) => {
            return prevUserList.map((user) => {
                if (user.username === selectedUser.username) {
                    return {
                        ...user,
                        messages: [...user.messages, message],
                    };
                }
                return user;
            });
        });
        setNewMessage('');
    };

    useEffect(() => {
        if (selectedUser) {
            userList.map(user => {
                if (user.username === selectedUser.username) {
                    setSelectedUser(user)
                }
            })
        }
    }, [userList])
    const searchUsers = () => {
        if (!token || !searchUserBy) {
            return;
        }
            try {
                axios.get(`${url}/api/users/search/${searchUserBy}`, { headers: { accessToken: token } })
                    .then(response => {
                        const users = response.data;
                        
                        const usersWithMessages = users.map(user => ({ ...user, messages: [] }));
                        setUserListFromSearch(usersWithMessages);
                        console.log(userListFromSearch)
                    })
                    .catch(err=>
                    console.log(err)
                    )
            } catch (err) {
                console.log(err)
            }
        

    }

    const selectUserFromSearch = (selectedResult) => {
        const existingUser = userList.find((user) => user.username === selectedResult.username);

        if (existingUser) {
            selectUser(existingUser);
        } else {
            // console.log(selectedResult)
            const newUser = selectedResult;
            setUserList([...userList, newUser]);
            selectUser(newUser);
        }
        setUserListFromSearch([]);
    }
    return (
        <div>
            <Header />
            {/* {currentUser && (currentUser.username)} */}
            <div className="message-container bg-gray-100 h-screen p-4 flex flex-col md:flex-row justify-center items-center"
                style={{ backgroundImage: 'url("./images/bg_seashore.jpg")' , backgroundSize: 'cover'}}>
                
                <div className="user-container bg-white p-4 rounded-lg shadow-lg md:w-1/3 self-stretch mx-6 my-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    <div className="user-list font-bold text-lg mb-4">
                        {userList.map((user) => (
                            <div
                                key={user.username}
                                className={`user-item ${selectedUser && selectedUser.username === user.username ? 'bg-blue-500 text-white rounded' : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <span className="flex items-center ml-4">
                                    {user.hasMessageUnread && (
                                        <span className="bg-white bg-opacity-0 rounded-full w-9 h-9 flex items-center justify-center ml-4">
                                            <IoIosNotificationsOutline size={20} color="red" />
                                        </span>
                                    )}
                                    <span className="text-lg">{user.nickname}</span>
                                    <span className="text-gray-500 ml-2">({user.username})</span>
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="user-search mt-4">
                        <input
                            type="text"
                            placeholder="Search user..."
                            value={searchUserBy}
                            onChange={(e) => setSearchUserBy(e.target.value)}
                            className="border border-gray-300 rounded p-2 mr-2"
                        />
                        <button
                            onClick={searchUsers}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded px-4 py-2"
                        >Search
                        </button>
                        <div className="search-results">
                            {userListFromSearch.map((user) => (
                                <div
                                    key={user.username}
                                    className="search-result-item cursor-pointer hover:bg-gray-100 p-2"
                                    onClick={() => selectUserFromSearch(user)}
                                >
                                    {user.username} - {user.nickname}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {selectedUser && (
                    <div className="chat-container bg-white p-4 rounded-lg shadow-lg md:w-1/3 self-stretch mx-6 my-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>

                        <div className="chat-header bg-gray-100 text-blue-500  p-1 rounded font-bold text-lg" >
                            {`Chat with ${selectedUser.nickname}`}
                        </div>

                        <div className="chat-messages mt-4">
                            {selectedUser.messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`message mb-2 ${message.sender_id === currentUser.id
                                        ? 'text-right'
                                        : ''
                                        }`}
                                >
                                    <span
                                        className={`message-content inline-block p-1 rounded ${message.sender_id === currentUser.id
                                            ? 'bg-green-500 text-black'
                                            : 'bg-gray-200 text-black'
                                            }`}
                                    >
                                        {message.message}
                                    </span>
                                </div>

                            ))}
                        </div>
                        <div className="chat-input p-4 flex flex-col items-center">
                            <div className="flex w-full">
                                <textarea
                                    rows="3"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                            <div className="mt-2">
                                <button
                                    onClick={sendMessage}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded px-4 py-2"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer fixBottom={true} />
        </div>
    );
}

export default Message