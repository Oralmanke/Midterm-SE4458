const express = require("express")
const app = express()
const cors = require("cors")

//Body Parser
app.use(express.json())
app.use(cors())
const user_route = require("./routes/user")
const listing_route = require("./routes/listing")
const reservation_route = require("./routes/reservations")


app.use("/v1",user_route)
app.use("/v1",listing_route)
app.use("/v1",reservation_route)


app.listen(8800,() => {
	console.log("Backend server succesfully started at the 8800 port.")
})
