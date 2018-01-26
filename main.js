const prompt = require('prompt')
const path = require('path')
const fs = require('fs')
var request = require('request')
const filename = path.join(__dirname,'d2lcookies')

/**************************************
* The powerhouse function 
* Does the series of "secret" urls which are 
* done when you login, to get the cookies
***************************************/
function login(username, password, sub) {
	return new Promise((resolve, reject) => {
		var j = request.jar()
		request = request.defaults({
			jar: j
		})

		request.post({
			// This is the first url sent when you press login
			url: `https://${sub}.brightspace.com/d2l/lp/auth/login/login.d2l`,
			form: {
				userName: username,
				password: password,
			},
			// Which immediately redirects to something else, so need to handle that
			followAllRedirects: true,
		}, function (err, res, body) {
			if (err) {
				return reject(err)
			}

			// That redirected page returns html which only contains javascript which changes the window.location to this url, so we need to go there for them to validate our session cookies

			request.get({
				// Last url
				url: `https://${sub}.brightspace.com/d2l/lp/auth/login/ProcessLoginActions.d2l`,
			}, function (err, res, body) {
				if (err) {
					return reject(err)
				}

				// We are all set to use the api
				resolve(j)
			})
		})
	})
}

/**************************************
* The login wrapper
* Just calls the login function, 
* and writes the cookies to the file
***************************************/
async function getNewCookies(username, password, subdomain, filename) {
	var j = await login(username, password, subdomain)
	fs.writeFileSync(filename, j.getCookieString(`https://${subdomain}.brightspace.com`))
	return j
}

/**************************************
* Reads in the old cookies
* Reads the file, and turns the cookies string into
* a request jar
***************************************/
function readOldCookies(filename, sub) {
	var cookies = fs.readFileSync(filename, 'utf-8')
	var jar = request.jar()
	cookies.split('; ').forEach(cookie => jar.setCookie(request.cookie(cookie), `https://${sub}.brightspace.com`))
	return jar
}

/**************************************
* Does a basic call to the homepage to test if
* Our cookies are good cookies, or if the login failed
***************************************/
function testCookie(cookies, sub) {
	return new Promise((resolve, reject) => {
		var res = request({
			url: `https://${sub}.brightspace.com/d2l/home`,
			jar: cookies
		}, (err, res, body) => {
			if (err) reject(err)

			resolve(res.statusCode == 200)
		})
	})
}

/**************************************
* Prompts the user for login creds
***************************************/
async function askForCreds() {
	return new Promise((resolve, reject) => {
		prompt.start()
		prompt.get([{
			name: 'username',
			description: 'cct username',
			required: true
		}, {
			name: 'password',
			required: true,
			hidden: true,
			replace: '*',
		}], (err,result) => {
			if(err) reject(err)
			resolve(result)
		})
	})
}

/**************************************
* The main function
* Handles the logic of checking if we have cookies
* and double checking to see if the login worked
***************************************/
async function getCookies(filename,subdomain){
	var cookies,success
	if(fs.existsSync(filename)){
		cookies = readOldCookies(filename, subdomain)
		if(await testCookie(cookies, subdomain)){
			return cookies
		}
	}
	
	while(!success) {
		var creds = await askForCreds()
		cookies = await getNewCookies(creds.username,creds.password,subdomain,filename)
		
		var success = await testCookie(cookies, subdomain)
		if(!success){
			console.log('Failed to login')
		}
	}
	
	return cookies
}

/**************************************
* Returns the request library which has had the d2l cookies set
* does a callback if asked, otherwise returns a promise
***************************************/
module.exports.getRequest = function(subdomain,cb){
	if(!subdomain){
		throw "Need to provide a subdomain (byui or pathway)"
	}
	if(cb){
		getCookies(filename,subdomain)
			.then(cookies => {
				cb(null,request.defaults({
					jar: cookies
				}))
			})
			.catch(cb)
	} else {
		return getCookies(filename,subdomain)
			.then(cookies => {
				return request.defaults({
					jar: cookies
				})
			})
	}
}

/**************************************
* Returns cookie objects to be implemented if your using some other
* library such as puppeteer
* does a callback if asked, otherwise returns a promise
***************************************/
module.exports.getCookies = async function(subdomain,cb){
	if(!subdomain){
		throw "Need to provide a subdomain (byui or pathway)"
	}
	if(cb){
		getCookies(filename,subdomain)
			.then(cookies => {
				cb(null,cookies.getCookies(`https://${subdomain}.brightspace.com`))
			})
			.catch(cb)
	} else {
		return getCookies(filename,subdomain)
			.then(cookies => {
				return cookies.getCookies(`https://${subdomain}.brightspace.com`)
			})
	}
}