
const express = require("express");
const http = require('http');
const socketio = require('socket.io');

const socketEvents = require('./socketio/socket'); 
const routes = require('./routes/routes'); 
const appConfig = require('./config/app-config');

var config = require("./config/serverConfig");

global.DB;
global.ObjectID;

class Server{

    constructor(){
        this.app = express();
        this.http = http.Server(this.app);
        this.socket = socketio(this.http);
        this.Mongodb = require("./config/db");
    }

    mongoConnect(){
        return new Promise( async (resolve, reject) => {
            this.Mongodb.onConnect("chatrealtime").then((a) => {
                global.DB = a[0];
                global.ObjectID = a[1];
                resolve();
            }).catch(err => {          
                reject(err);
            })	
        });
    }
    

    appConfig(){        
        new appConfig(this.app).includeConfig();
    }

    /* Including app Routes starts*/
    includeRoutes(){
        new routes(this.app).routesConfig();
        new socketEvents(this.socket).socketConfig();
    }
    /* Including app Routes ends*/  

    appExecute(){
        this.mongoConnect().then(() => {
            this.appConfig();
            this.includeRoutes();
    
            const port =  process.env.PORT || config.port;
            const host = config.host || 'localhost';      
    
            this.http.listen(port, host, () => {
                console.log(`Listening on http://${host}:${port}`);
            });
        }).catch(err => {
            return err;
        })
    }
}
    
var app = new Server(); 
app.appExecute();
module.exports = {app};
