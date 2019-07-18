
const path = require('path');
const queryHandler = require('../handlers/query-handler');
const CONSTANTS = require('../utils/constants');

class Socket{

	constructor(socket){
		this.io = socket;
		this.Mongodb = require("../config/db");
		
	}
	
	socketEvents(){

		this.io.on('connection', (socket) => {

			/* Get the user's Chat list	*/
			socket.on(`chat-list`, async (data) => {
				if (data.userId == '') {
					this.io.emit(`chat-list-response`, {
						error : true,
						message : CONSTANTS.USER_NOT_FOUND
					});
				}else{
					try {
						const [UserInfoResponse, chatlistResponse] = await Promise.all([
							queryHandler.getUserInfo( {
								userId: data.userId,
								socketId: false
							}),
							queryHandler.getChatList( socket.id )
							]);
						this.io.to(socket.id).emit(`chat-list-response`, {
							error : false,
							singleUser : false,
							chatList : chatlistResponse
						});
						socket.broadcast.emit(`chat-list-response`,{
							error : false,
							singleUser : true,
							chatList : UserInfoResponse
						});
					} catch ( error ) {
						this.io.to(socket.id).emit(`chat-list-response`,{
							error : true ,
							chatList : []
						});
					}
				}
			});

			/**
			* send the messages to the user
			*/
			socket.on(`add-message`, async (data) => {
				if (data.message === '') {
					this.io.to(socket.id).emit(`add-message-response`,{
						error : true,
						message: CONSTANTS.MESSAGE_NOT_FOUND
					}); 
				}else if(data.fromUserId === ''){
					this.io.to(socket.id).emit(`add-message-response`,{
						error : true,
						message: CONSTANTS.SERVER_ERROR_MESSAGE
					}); 
				}else if(data.toUserId === ''){
					this.io.to(socket.id).emit(`add-message-response`,{
						error : true,
						message: CONSTANTS.SELECT_USER
					}); 
				}else{
					try{
						const [toSocketId, messageResult ] = await Promise.all([
							queryHandler.getUserInfo({
								userId: data.toUserId,
								socketId: true
							}),
							queryHandler.insertMessages(data)						
						]);
						this.io.to(toSocketId).emit(`add-message-response`,data); 
					} catch (error) {
						this.io.to(socket.id).emit(`add-message-response`,{
							error : true,
							message : CONSTANTS.MESSAGE_STORE_ERROR
						}); 
					}
				}				
			});


			/**
			* Logout the user
			*/
			socket.on('logout', async (data)=>{
				try{
					const userId = data.userId;
					await queryHandler.logout(userId);
					this.io.to(socket.id).emit(`logout-response`,{
						error : false,
						message: CONSTANTS.USER_LOGGED_OUT,
						userId: userId
					});

					socket.broadcast.emit(`chat-list-response`,{
						error : false ,
						userDisconnected : true ,
						userid : userId
					});
				} catch (error) {
					console.log(error);
					this.io.to(socket.id).emit(`logout-response`,{
						error : true,
						message: CONSTANTS.SERVER_ERROR_MESSAGE,
						userId: userId
					});
				}
			});


			/**
			* sending the disconnected user to all socket users. 
			*/
			socket.on('disconnect',async () => {
				socket.broadcast.emit(`chat-list-response`,{
					error : false ,
					userDisconnected : true ,
					userid : socket.request._query['userId']
				});
				
			});

			//isseen

			socket.on('is seen', data => {

			var message_list_name_senderID = data.fromUserId + data.toUserId;
            var message_list_name_receiveID = data.toUserId + data.fromUserId;

			DB.collection('messages').updateMany({ $or: [{message_list_name: message_list_name_senderID}, {message_list_name: message_list_name_receiveID}]}, { $set: { isSeen: true}})

			.catch(err => console.log(err))

            DB.collection('users').findOne({_id: ObjectID(data.fromUserId)})
            .then( sender => {

                if(sender._id){
                    socket.to(sender.socketId).emit('is seen', "seen");
				}
				
            })
      
            .catch(err => console.log(err))
            
        })

		});

	}
	
	socketConfig(){
		this.io.use( async (socket, next) => {
			try {
				await queryHandler.addSocketId({
					userId: socket.request._query['userId'],
					socketId: socket.id
				});
				next();
			} catch (error) {
          		// Error
          		console.error(error);
          	}
          });

		this.socketEvents();
	}
}
module.exports = Socket;