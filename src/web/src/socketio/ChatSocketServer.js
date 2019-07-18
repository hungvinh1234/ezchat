import * as io from 'socket.io-client';
import config from '../config'

const events = require('events');

class ChatSocketServer {
    
    socket = null
    eventEmitter = new events.EventEmitter();

    // Connecting to Socket Server
    establishSocketConnection(userId) {
        try {
            this.socket = io(config.url, {
                query: `userId=${userId}`
            });
        } catch (error) {
            alert(`Something went wrong; Can't connect to socket server`);
        }
    }

    getChatList(userId) {
        this.socket.emit('chat-list', {
            userId: userId
        });
        this.socket.on('chat-list-response', (data) => {
            this.eventEmitter.emit('chat-list-response', data);
        });
    }

    sendMessage(message) {
        this.socket.emit('add-message', message);
        
    }

    receiveSeen(x){
        this.socket.on('is seen', (data) => {
            x();
        });

    }

    sendSeen(data){
        this.socket.emit('is seen', data);
    }

    receiveMessage() {
        this.socket.on('add-message-response', (data) => {
            this.eventEmitter.emit('add-message-response', data);
        });
    }

    logout(userId) {
        this.socket.emit('logout', userId);
        this.socket.on('logout-response', (data) => {
            this.eventEmitter.emit('logout-response', data);
        });
    }


}

export default new ChatSocketServer()