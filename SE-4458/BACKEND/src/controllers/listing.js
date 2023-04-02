const db = require("../database")


async function get_all_listing(req, res) {
	// Retrieve a list of all listings
	try {
		const result = await db.query("SELECT * FROM listings")
		res.send(result.rows)
	} catch (err) {
		console.error(err)
		res.status(404).send("Something went wrong")
	}
}

async function get_listings_by_id (req, res)  {
	// Retrieve details of a specific listing
	const listing_id = req.params.listing_id
	try {
		const result = await db.query("SELECT * FROM listings WHERE listing_id = $1", [listing_id])
		res.send(result.rows[0])
	} catch (err) {
		console.error(err)
		res.status(404).send("Something went wrong")
	}
}

async function create_new_listing(req, res) {
	// Create a new listing
	const listing_data = req.body
	try {
		const result = await db.query("INSERT INTO listings (title, description, price_per_night, address, latitude, longitude, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
			[listing_data.title, listing_data.description, listing_data.price_per_night, listing_data.address, listing_data.latitude, listing_data.longitude, req.user.user_id])
		res.send(result.rows[0])
	} catch (err) {
		console.error(err)
		res.status(404).send("Something went wrong")
	}
}

async function update_listing(req, res) {
	// Update details of a specific listing
	const listing_id = req.params.listing_id
	const listing_data = req.body
	try {
		const result = await db.query("SELECT * FROM listings WHERE listing_id = $1 and user_id = $2", [listing_id,req.user.user_id])
		if (result.rows.length === 0) {
			return res.status(404).send("Listing not found")
		}

		const current_listing_data = result.rows[0]

		
		for (const prop in listing_data) {
			// eslint-disable-next-line no-prototype-builtins
			if (current_listing_data.hasOwnProperty(prop)) {
				current_listing_data[prop] = listing_data[prop]
				
			}
		}
		
		const update_query = `
      UPDATE listings
      SET title = $1, description = $2, price_per_night = $3, address = $4, latitude = $5, longitude = $6
      WHERE listing_id = $7
      RETURNING *
    `
		const update_params = [
			current_listing_data.title,
			current_listing_data.description,
			current_listing_data.price_per_night,
			current_listing_data.address,
			current_listing_data.latitude,
			current_listing_data.longitude,
			listing_id
		]
		const updated_listing = await db.query(update_query, update_params)
		res.send(updated_listing.rows[0])
		//const result = await db.query("UPDATE listings SET title = $1, description = $2, price_per_night = $3, address = $4, latitude = $5, longitude = $6 WHERE listing_id = $7 RETURNING *", [listing_data.title, listing_data.description, listing_data.price_per_night, listing_data.address, listing_data.latitude, listing_data.longitude, listing_id])
	} catch (err) {
		console.error(err)
		return res.status(404).send("Something went wrong")
	}
}

async function delete_listing(req, res) {
	// Delete a specific listing
	const listing_id = req.params.listing_id
	try {
		const listing = await db.query("SELECT user_id FROM listings WHERE listing_id = $1",[listing_id])
		if(listing.rowCount == 0){
			return res.status(404).send("Listing not found")
		}
		console.log(req.user)
		if (listing.rows[0].user_id == req.user.user_id) {
			await db.query("DELETE FROM listings WHERE listing_id = $1",[listing_id])
			return res.send("Listing succesfully deleted")
		}
		return res.send("You do not have permission to delete")
	} catch (err) {
		console.error(err)
		return res.status(404).send("Something went wrong")
	}
}

module.exports = {
	get_all_listing,
	get_listings_by_id,
	create_new_listing,
	update_listing,
	delete_listing
}