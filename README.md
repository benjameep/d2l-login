# d2l-login

##### Handles Getting and Storing d2l cookies

If cookies are invalid or expired, prompts for username and password

If cookies are good then just hands them over


``` javascript
var d2login = require('./main.js');

var d2lAPIurl = `https://byui.brightspace.com/d2l/api/lp/1.20/100283/groupcategories/`

// Using Promise Await
(async () => {

	var request = await d2login.getRequest('byui')
	
	request.get(d2lAPIurl,(err,res,body) => {
		if(err) return console.log(err)
		console.log(body)
	})
	
	var cookies = await d2login.getCookies('byui')
	console.log(cookies) // => 
/*
	[ 
		Cookie="d2lSessionVal=4KslbIcCgaYE6ggTit2NE1PAT; Path=/; hostOnly=true; aAge=1ms; cAge=1049ms",
  		Cookie="d2lSecureSessionVal=Ye9boZegghJgoJudIdPmlWLZS; Path=/; hostOnly=true; aAge=1ms; cAge=1048ms",
  		Cookie="ShibbolethSSO=LE; Path=/; hostOnly=true; aAge=1ms; cAge=1048ms" 
	]
*/
})()


// Using the callback
d2login.getRequest('byui',(err,request) => {
	if(err) return console.log(err)
	
	request.get(d2lAPIurl,(err,res,body) => {
		if(err) return console.log(err)
		console.log(body)
	})
})


```

### getRequest(subdomain, [callback])
returns the [request library](https://www.npmjs.com/package/request) which has the d2l cookies applied to it

### getCookies(subdomain, [callback])
returns an array of [tough-cookies](https://www.npmjs.com/package/tough-cookie)
