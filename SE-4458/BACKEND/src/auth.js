const jwt = require("jsonwebtoken")




async function auth(req,res,next){
	try {
		
		let decoded = jwt.verify(req.headers["authorization"], process.env.JWT_SECRET)
		req.user = decoded
	} catch(err) {
		return res.status(404).send("Token is invalid or expired")
	}
	next()
}




module.exports = {
	auth,
}