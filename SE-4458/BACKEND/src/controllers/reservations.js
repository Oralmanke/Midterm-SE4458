const db = require("../database.js")



async function get_all_reservations(req, res) {
	// Retrieve a list of all reservations

	try {
		const result = await db.query("SELECT * FROM reservations")
		res.send(result.rows)
	} catch (err) {
		console.error(err)
		res.status(404).send("Something went wrong")
	}
}

async function get_reservation_by_id(req, res)  {
	// Retrieve details of a specific reservation
	const reservation_Id = req.params.reservation_id
	try {
		const result = await db.query("SELECT * FROM reservations WHERE reservation_id = $1", [reservation_Id])
		res.send(result.rows[0])
	} catch (err) {
		console.error(err)
		res.status(404).send("Something went wrong")
	}
}

async function create_new_reservations(req, res) {
	// Create a new reservation
	const reservation_Data = req.body
	try {
		const query = await db.query("SELECT start_date,end_date FROM reservations WHERE listing_id = $1",[reservation_Data.listing_id])

		const overlapping_reservations = query.rows.filter(row => {
			const start = new Date(row.start_date)
			const end = new Date(row.end_date)
			const reservationStart = new Date(reservation_Data.start_date)
			const reservationEnd = new Date(reservation_Data.end_date)
			return (
				(start <= reservationStart && reservationStart <= end) || // new reservation starts during existing reservation
				(start <= reservationEnd && reservationEnd <= end) || // new reservation ends during existing reservation
				(reservationStart <= start && end <= reservationEnd) // new reservation completely overlaps existing reservation
			)
		})

		if (overlapping_reservations.length > 0) {
			return res.status(400).send("Reservation cannot be made for the selected dates")
		}

		const result = await db.query("INSERT INTO reservations (start_date, end_date, guests, total_price, listing_id, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [reservation_Data.start_date, reservation_Data.end_date, reservation_Data.guests, reservation_Data.total_price, reservation_Data.listing_id, req.user.user_id])
		return res.send(result.rows[0])
	} catch (err) {
		console.error(err)
		return res.status(404).send("Something went wrong")
	}
}


async function update_reservations(req, res)  {
	// Update details of a specific reservation
	const reservation_Id = req.params.reservation_id
	const reservation_Data = req.body
	try {
		const result = await db.query("SELECT * FROM reservations WHERE reservation_id = $1 and user_id = $2", [reservation_Id,req.user.user_id])

		if (result.rowCount == 0) {
			return res.status(404).send("Reservation not found")
		}

		const current_reservation_data = result.rows[0]

		for (const prop in reservation_Data){
			if (current_reservation_data.hasOwnProperty(prop)) {
				current_reservation_data[prop] = reservation_Data[prop]
			}
		}

		const update_query = `
      UPDATE reservations
      SET start_date = $1, end_date = $2, guests = $3, total_price = $4
      WHERE reservation_id = $5
      RETURNING *
    `
		const update_params = [
			current_reservation_data.start_date,
			current_reservation_data.end_date,
			current_reservation_data.guests,
			current_reservation_data.total_price,
			reservation_Id
		]
		const updated_reservations = await db.query(update_query, update_params)

		return res.send(updated_reservations.rows[0])
	} catch (err) {
		console.error(err)
		return res.status(404).send("Something went wrong")
	}
}

module.exports = {
	get_all_reservations,
	get_reservation_by_id,
	create_new_reservations,
	update_reservations
}