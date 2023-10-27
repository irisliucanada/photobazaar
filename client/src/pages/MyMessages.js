import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { IoIosNotificationsOutline  } from 'react-icons/io';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Message() {
    const [userList, setUserList] = useState([]);//users to chat with 
    const [selectedUser, setSelectedUser] = useState(null);//user chatting with

    const [newMessage, setNewMessage] = useState('');
    const [searchUserBy, setSearchUserBy] = useState('');//string for searching username or nickname
    const [userListFromSearch, setUserListFromSearch] = useState([]);//result of searching users
    const [socket, setSocket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);//user logged in

    useEffect(() => {
        fetchUserList();
        setCurrentUser('user1');
    }, [])
    useEffect(() => {

        const newSocket = io.connect('http://localhost:3001');
        newSocket.on('connect', () => {
            newSocket.emit('user_info', { username: currentUser })
            console.log(currentUser + ' Connected to server');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        newSocket.on("sendback", function (message) {

            setUserList((prevUserList) => {
                return prevUserList.map((user) => {
                    if (user.username === message.sender_username) {
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


    const fetchUserList = async () => {
        setUserList([
            {
                username: 'user1',
                nickname: 'nickname1',
                messages: [
                    { sender_username: 'user1', receiver_username: 'user2', message: 'hello, I am user1', isread: false },
                    { sender_username: 'user2', receiver_username: 'user1', message: 'hello, I am user2', isread: false }
                ],
                hasMessageUnread: true
            },
            {
                username: 'user2',
                nickname: 'nickname2',
                messages: [
                    { sender_username: 'user2', receiver_username: 'user1', message: 'bonjour, je suis user2', isread: false },
                    { sender_username: 'user1', receiver_username: 'user2', message: 'bonjour, je suis user1', isread: false }
                ],
                hasMessageUnread: true
            }])
        //todo: get contacted users
        
        //todo: get messages from each user
    };

    const selectUser = (user) => {
        setSelectedUser(user);
    };

    const sendMessage = () => {
        if (!socket || !selectedUser || !newMessage) return;

        const message = {
            sender_username: currentUser,
            receiver_username: selectedUser.username,
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
        //todo: search users from api/users
        setUserListFromSearch([
            {
                username: 'user1',
                nickname: 'nickname1',
                messages: []
            },
            {
                username: 'new user',
                nickname: 'new user from search',
                messages: []
            }
        ])

    }
    const selectUserFromSearch = (selectedResult) => {
        const existingUser = userList.find((user) => user.username === selectedResult.username);

        if (existingUser) {
            selectUser(existingUser);
        } else {
            const newUser = {
                username: selectedResult.username,
                nickname: selectedResult.nickname,
                messages: []
            };
            setUserList([...userList, newUser]);
            selectUser(newUser);
        }
        setUserListFromSearch([]);
    }
    return (
        <div>
            <Header/>
            <div className="bg-gray-100 h-screen p-4 flex flex-col md:flex-row justify-center items-center">
                <div>
                    {currentUser === 'user1' && (<p>user1</p>)}
                    {currentUser === 'user2' && (<p>user2</p>)}
                    <button onClick={() => {
                        setCurrentUser(currentUser === 'user1' ? 'user2' : 'user1')
                    }}>Switch User</button>

                </div>
                <div className="user-container bg-white p-4 rounded-lg shadow-lg md:w-1/2  flex-grow self-stretch mx-2 my-2">
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
                    <div className="user-container bg-white p-4 rounded-lg shadow-lg md:w-1/2  flex-grow self-stretch mx-2 my-2" >

                        <div className="chat-header bg-gray-100 text-blue-500  p-1 rounded font-bold text-lg" >
                            {`Chat with ${selectedUser.nickname}`}
                        </div>

                        <div className="chat-messages mt-4">
                            {selectedUser.messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`message mb-2 ${message.sender_username === currentUser
                                            ? 'text-right'
                                            : ''
                                        }`}
                                >
                                    <span
                                        className={`message-content inline-block p-1 rounded ${message.sender_username === currentUser
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
            <Footer/>
        </div>
    );
}

export default Message