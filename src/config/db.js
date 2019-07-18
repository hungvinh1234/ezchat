
const mongodb = require('mongodb');
const assert = require('assert');
var hostDB = require('../config/serverConfig').mongo;

class Db{

	constructor(){
		this.mongoClient = mongodb.MongoClient;
		this.ObjectID = mongodb.ObjectID;
	}

	onConnect(dbName){
		return new Promise( (resolve, reject) => {
			this.mongoClient.connect(hostDB, (err, db) => {
            
                if (err) {
					reject(err);
				} else {
					var dbo = db.db(dbName);
					console.log('Connect To DB Successful !')
					assert.equal(null, err);
					resolve([dbo,this.ObjectID]);
				}
			});
		});
	}
}
module.exports = new Db();