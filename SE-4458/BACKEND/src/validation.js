const db = require("./database.js")

function validate_reservation_data(req,res,next) {
	const reservation_data = req.body
  
	if (!reservation_data.start_date || !reservation_data.end_date || !reservation_data.guests || !reservation_data.total_price || !reservation_data.listing_id) {
		return res.status(400).send("Missing required fields.")
	}
  
	const startDate = new Date(reservation_data.start_date)
	const endDate = new Date(reservation_data.end_date)
  
	if (startDate.toString() === "Invalid Date" || endDate.toString() === "Invalid Date") {
		return res.status(400).send("Invalid date format.")
	}
  
	if (startDate >= endDate) {
		return res.status(400).send("Start date must be before end date.")
	}
  
	if (typeof reservation_data.guests !== "number" || reservation_data.guests < 1) {
		return res.status(400).send("Number of guests must be a positive integer.")
	}
  
	if (typeof reservation_data.total_price !== "number" || reservation_data.total_price <= 0) {
		return res.status(400).send("Total price must greater than 0.")
	}
  
	next()
}
  

function validate_listing_data(req,res,next){
	const listing_data = req.body
	if(!listing_data.title || !listing_data.description || typeof listing_data.price_per_night != "number" || !listing_data.address || !listing_data.latitude || !listing_data.longitude){
		return res.status(400).send("Missing required fields.")
	}

	if ( listing_data.price_per_night.get <= 0) {
		return res.status(400).send("Total price must greater than 0.")
	}
	next()
}

async function validate_user_data(req,res,next) {
	const user_data = req.body
	// Check if name, email, password, and phone_number fields are present
	if (!user_data.name || !user_data.email || !user_data.password || !user_data.phone_number) {
		return res.status(404).send("Something went aaaa")
	}

	const match_name = await db.query("SELECT * FROM users WHERE name = $1",[user_data.name])
	if (match_name.rows.length) {
		return res.status(404).send("The username was taken")
	}

	// Check if email is valid
	const emailRegex = /\S+@\S+\.\S+/
	if (!emailRegex.test(user_data.email)) {
		return res.status(404).send("Email is invalid.")
		
	}
  
	// Check if phone number is valid
	const phoneRegex = /^\d{10}$/
	if (!phoneRegex.test(user_data.phone_number)) {
		return res.status(404).send("Phone number is invalid.")
	}
	next()
}
   
module.exports = {
	validate_user_data,
	validate_reservation_data,
	validate_listing_data
}
  