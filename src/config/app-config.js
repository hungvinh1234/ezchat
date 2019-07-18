
const expressConfig = require('./express-config');
const cors = require('cors');
const dotenv = require('dotenv');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var path = require('path');
var express = require('express');

class AppConfig{
	
	constructor(app){
		dotenv.config();
		this.app = app;
	}

	includeConfig() {
        this.app.use(helmet())
        this.app.use(cors())
        this.app.use(bodyParser.urlencoded({
            extended: false
        }))
        this.app.use(bodyParser.json({
            limit: '50mb',
            type: ['application/json', 'text/plain']
        }))
        this.app.use(express.static(path.join(__dirname, '../web/build')));
        this.app.use((err, req, res, next) => {
            reject(new Error("Something went wrong!, err: " + err))
            res.status(500).send("Something went wrong!")
        })
        this.app.use((req, res, next) => {
            req.body = JSON.parse(JSON.stringify(req.body))
            req.query = JSON.parse(JSON.stringify(req.query))
            next();
        })
       //app build
    //    this.app.use(express.static(path.join(__dirname, '../web/build', 'index.html')));
       
    // this.app.use(express.static(__dirname + '/public'));
    this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../web/build/index.html'));
      
    })

		new expressConfig(this.app);
	}

}
module.exports = AppConfig;
