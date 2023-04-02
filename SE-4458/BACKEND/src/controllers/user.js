const db = require("../database")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")



const EXPIRE_DATE = "1h"



async function get_all_users (req, res)  {
	try {
		
		const result = await db.query("SELECT user_id,name,email,phone_number,profile_picture FROM users")    
		res.send(result.rows)

	} catch (err) {
		console.error(err)
		res.status(404).send("Error retrieving users from the database")
	}
}

async function create_new_user (req, res) {
	// Create a new user
	const user_data = req.body
	try {
		const hashed_password = await bcrypt.hash(user_data.password, 10)
		await db.query("INSERT INTO users (name, email, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING *", [user_data.name, user_data.email, hashed_password, user_data.phone_number])
		res.status(200).send("Success")
	} catch (err) {
		if (err.constraints === "users_email_key") {
			res.status(400).send("Email address is already in use")
		}
		console.error(err)
		res.status(404).send("Something went wrong")
		
	}
    
}

async function get_user_by_id (req, res)  {
	// Retrieve details of a specific user
	const user_id = req.params.user_id
	try {
		const result = await db.query("SELECT * FROM users WHERE user_id = $1", [user_id])
		res.send(result.rows[0])
	} catch (err) {
		res.status(404).send("Something went wrong")
	}
}

async function update_user(req, res)  {
	// Update details of a specific user
	const user_id = req.params.user_id
	const user_data = req.body
	try {
		const result = await db.query("UPDATE users SET name = $1, email = $2 WHERE user_id = $3 RETURNING *", [user_data.name, user_data.email, user_id])
		res.send(result.rows[0])
	} catch (err) {
		console.error(err)
		res.status(404).send("Something went wrong")
	}
}

async function delete_user(req, res)  {
	// Delete a specific user
	const user_id = req.params.user_id
	try {
		await db.query("DELETE FROM users WHERE user_id = $1", [user_id])
	} catch (err) {
		console.error(err)
		res.status(404).send("Something went wrong")
	}
	res.send("Succesfully deleted user")
}
 
async function login_user(req, res){

	try {

		const user_data = req.body
		
		if (!user_data.password || !user_data.email){
			return res.status(404).send("email and password required")
		}
		const user = await db.query("SELECT * FROM users WHERE email = $1",[user_data.email])
		
		if(user.rows.length == 0){
			return res.status(404).send("user not found")
		}
		
		if (!(await bcrypt.compare(user_data.password, user.rows[0].password)) || !user){
			return res.status(404).send("Something went wrongaaa")
		}
		//console.log(config.get("JWT_SECRET"))

		const token = await jwt.sign(
			{user_id: user.rows[0].user_id, name : user.rows[0].name, email: user.rows[0].email, phone_number: user.rows[0].phone_number},
			process.env.JWT_SECRET,
			{ expiresIn:EXPIRE_DATE})


		return res.status(200).json({token: token})	
	} catch (err) {
		console.log(err)
		return res.status(404).send("Something went wrong")
	}
}



module.exports = {
	get_all_users,
	create_new_user,
	get_user_by_id,
	update_user,
	delete_user,
	login_user
}

