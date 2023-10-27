const { Server } = require("socket.io");
const Message = require("../models/message.model");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const userSockets = {};

  io.on('connection', async (socket) => {
    // console.log('A user connected');
    socket.on('user_info', (userInfo) => {
      userSockets[userInfo.id] = socket;
      console.log(`${userInfo.username}(id: ${userInfo.id}) Connected to server, socket_id: ${socket.id}`);
      
    })
  
    socket.on("private-message", async (data) => {
      const sender_id = data.sender_id; //todo: auth
      const receiver_id = data.receiver_id; 
      const message = data.message;
      console.log(`receive private-message sender_id: ${data.sender_id},receiver_id: ${data.receiver_id},message: ${data.message}`);
  
      try {
        const insertedId = await Message.save(sender_id, receiver_id, message);
        console.log("message inserted:" + insertedId)
        const receiverSocket = userSockets[data.receiver_id];
        if (receiverSocket) {
          // console.log(receiverSocket.id)
          const sendback = data;
          sendback.id = insertedId;
          receiverSocket.emit('sendback', sendback);
          // console.log(`send to ${data.receiver_id}: private-message sender_id: ${data.sender_id},receiver_id: ${data.receiver_id},message: ${data.message}`);
        }
      } catch (error) {
        console.error('Failed to save message to database:', error);
      }
    });
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
  
};
