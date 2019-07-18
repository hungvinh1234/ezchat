import * as axios from 'axios';
import config from '../config'
 
class ChatHttpServer {

    getUserId() {
        return new Promise((resolve, reject) => {
            try {
                resolve(sessionStorage.getItem('userid'));
            } catch (error) {
                reject(error);
            }
        });
    }

    removeLS() {
        return new Promise((resolve, reject) => {
            try {
                sessionStorage.removeItem('userid');
                sessionStorage.removeItem('username');
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    setLS(key, value) {
        return new Promise((resolve, reject) => {
            try {
                sessionStorage.setItem(key, value);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    login(userCredential) {
        return new Promise(async (resolve, reject) => {
            try {
                axios.post(config.url+'/login', userCredential).then(result => {
                    resolve(result.data);
                }).catch( err => {
                    console.log(err.response.data)
                    resolve(err.response.data)
                }
                )
            } catch (error) {
                reject(error);
            }
        });
    }

    checkUsernameAvailability(username) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(config.url+'/usernameAvailable', {
                    username: username
                });
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }
    
    register(userCredential) {
        return new Promise(async (resolve, reject) => {
            try {
                axios.post(config.url+'/register', userCredential).then(result => {
                    resolve(result.data);
                }).catch( err => 
                    resolve(err.response.data)
                )
            } catch (error) {
                reject(error);
            }
        });
    }

    userSessionCheck(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(config.url+'/userSessionCheck', {
                    userId: userId
                });
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }

    getMessages(userId, toUserId) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(config.url+'/getMessages', {
                    userId: userId,
                    toUserId: toUserId
                });
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }
    
}

export default new ChatHttpServer();