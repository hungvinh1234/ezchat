
class ExpressConfig{
	
	constructor(app){
		
		app.set('view engine', 'html');

		//Files 
		app.use(require('express').static(require('path').join('public')));
	}
}
module.exports = ExpressConfig;
