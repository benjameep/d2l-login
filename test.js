var d2login = require('./main.js');

/**************************************
* Using Promise Await
***************************************/
(async () => {
	var request = await d2login.getRequest('byui')
	
	request.get(`https://byui.brightspace.com/d2l/api/lp/1.20/10011/groupcategories/`,(err,res,body) => {
		if(err) return console.log(err)
		console.log(body)
	})
	
	var cookies = await d2login.getCookies('byui)
	console.log(cookies)
})()

/**************************************
* Using the callback
***************************************/
d2login.getRequest('byui',(err,request) => {
	if(err) return console.log(err)
	
	request.get(`https://byui.brightspace.com/d2l/api/lp/1.20/10011/groupcategories/`,(err,res,body) => {
		if(err) return console.log(err)
		console.log(body)
	})
})