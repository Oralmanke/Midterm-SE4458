const express = require("express")
const router = express.Router() 

const controller = require("../controllers/user.js")
const validate = require("../validation.js")
//User endpoints

router.get("/users", controller.get_all_users)

router.get("/users/:user_id", controller.get_user_by_id)
  
router.post("/users", validate.validate_user_data,controller.create_new_user)
  
router.put("/users/:user_id", controller.update_user)
  
router.delete("/users/:user_id", controller.delete_user)

router.post("/users/login", controller.login_user)


module.exports = router