const express = require ("express")
const router = express.Router() 

const controller = require("../controllers/listing.js")
const validate = require("../validation.js")
const auth = require("../auth")
//listings endpoints

router.get("/listings", controller.get_all_listing)
  
router.get("/listings/:listing_id", controller.get_listings_by_id)

router.post("/listings", validate.validate_listing_data, auth.auth,controller.create_new_listing)
  
router.put("/listings/:listing_id", auth.auth, controller.update_listing)
  
router.delete("/listings/:listing_id", auth.auth,controller.delete_listing)
 

module.exports = router