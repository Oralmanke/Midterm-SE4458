const express = require ("express")
const router = express.Router() 

const controller = require("../controllers/reservations.js")
const validate = require("../validation.js")
const auth = require("../auth")

//reservations endpoints

router.get("/reservations", auth.auth,controller.get_all_reservations)
  
router.get("/reservations/:reservation_id", auth.auth,controller.get_reservation_by_id)
  
router.post("/reservations", validate.validate_reservation_data, auth.auth, controller.create_new_reservations)
  
router.put("/reservations/:reservation_id", auth.auth, controller.update_reservations)


module.exports = router