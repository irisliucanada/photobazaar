//message.controller.js
const Message = require('../models/message.model');
const UserModel = require('../models/user.model');

const jwt = require('jsonwebtoken')
const secretKey = process.env.SECRET_KEY || 'importantsecret';

class MessageController {

    async createMessage(req, res) {
        //todo: auth
        const { sender_id, receiver_id, message } = req.body;

        try {
            const insertedId = await Message.save(sender_id, receiver_id, message);
            return res.status(200).json({ _id: insertedId });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create message' });
        }
    }
    
    
    
    async getUserMessages(req, res) {
        const { authorization } = req.headers;
    
        if (!authorization) {
            return res.status(400).json({ message: "No authorization" });
        }
    
        const token = authorization.split(' ')[1];
    
        if (!token) {
            return res.status(400).json({ message: "No token" });
        }
    
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                return res.status(400).json({ error: "Token is invalid" });
            }
            const owner_id = decoded.id;
            const ownerName = decoded.username;
            try {
                const messages = await Message.findAllByUser(owner_id);
                // console.log(messages)
                let userMessages = [];
    
                for (const message of messages) {
                    const foundUser = userMessages.some((userMessage) => userMessage.id === message.sender_id || userMessage.id === message.receiver_id);
    
                    if (!foundUser) {
                        const id = (message.sender_id === owner_id) ? message.receiver_id : message.sender_id;
    
                        try {
                            const user = await UserModel.findOne({ _id: id });
    
                            if (user) {
                                console.log("create a user");
                                userMessages.push({
                                    id: user.id,
                                    username: user.username,
                                    nickname: user.nickname,
                                    messages: [{
                                        id:message._id,
                                        sender_id:message.sender_id,
                                        sender_username: message.sender_id === owner_id ? ownerName : user.username,
                                        receiver_id: message.receiver_id,
                                        receiver_username: message.receiver_id === owner_id ? ownerName:user.username ,
                                        message: message.message,
                                        is_read: message.receiver_id===owner_id?message.is_read:true,
                                        send_time:message.send_time
                                    }],
                                    hasMessageUnread: message.receiver_id===owner_id?!message.is_read:false,
                                });
                                console.log(userMessages);
                            }
                        } catch (err) {
                            // console.log(err)
                        }
                    } else {
                        console.log("push a message");
                        const userToUpdate = userMessages.find((user) => user.id === message.sender_id || user.id === message.receiver_id);
                        userToUpdate.messages.push({
                            id:message._id,
                            sender_id:message.sender_id,
                            sender_username: message.sender_id === owner_id ? ownerName : userToUpdate.username,
                            receiver_id: message.receiver_id,
                            receiver_username: message.receiver_id === owner_id ? ownerName:userToUpdate.username ,
                            message: message.message,
                            is_read: message.receiver_id===owner_id?message.is_read:true,
                            send_time:message.send_time
                        });
                        userToUpdate.hasMessageUnread = userToUpdate.hasMessageUnread || (message.receiver_id === owner_id && !message.is_read);
                    }
                }
    
                // console.log(userMessages);
                return res.status(200).json(userMessages);
            } catch (error) {
                return res.status(500).json({ error: 'Failed to retrieve messages' });
            }
        });
    }
    
    
    
    
    

    async markMessageAsRead(req, res) {
        //todo: auth
        const { messageId } = req.params;

        try {
           
            await Message.markAsRead(messageId);
            return res.status(200).json({ message: 'Message marked as read' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to mark message as read' });
        }
    }

    async deleteMessage(req, res) {
        //todo: auth
        const { messageId } = req.params;

        try {
            await Message.delete(messageId);
            return res.status(200).json({ message: 'Message deleted' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete message' });
        }
    }

    async deleteAllMessages(req, res) {
        try {
            await Message.deleteAll();
            return res.status(200).json({ message: 'Messages deleted' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete messages' });
        }
    }
}

module.exports = MessageController;
