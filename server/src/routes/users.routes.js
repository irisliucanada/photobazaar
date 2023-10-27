const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");

// Retrieve all users
router.get("/", userController.findAll);

// validate token
router.get("/auth", userController.validateToken);

// Retrieve a single user with user email
router.get("/:email", userController.findUserByEmail);

// Retrieve a single user with user id
router.get("/id/:id", userController.findUserById);

//get user profile by user id
router.get("/userProfile/:id", userController.userProfile);

// Create a new user
router.post("/", userController.addUser);

// Delete a user with user email
router.delete("/:email", userController.deleteUserByEmail);

// Authentic a user
router.post("/auth", userController.authUser);

// Update a user password with email
router.put("/:email", userController.updateUserByEmail); // should be patch?

// Update my_assets with user id
router.patch("/my_assets/:id", userController.addMyAssetsById);

// forgot password and send mailgun
router.post("/forgotpassword", userController.forgotPassword);
//update user password
router.put("/changepassword/:email", userController.updateUserByEmail);
//update user name by email
router.put("/changeusername/:email", userController.updateUsernameByEmail);
//delete user by email
router.delete("/deleteuser/:email", userController.deleteUserByEmail);

//disable user by email
router.get("/disableuser/:email", userController.disableUserByEmail);

//enable user by email
router.get("/enable/:email", userController.enableUserByEmail);
//search users
router.get("/search/:searchString", userController.searchUsers);

//update profile icon
router.put("/profile/:email", userController.updateProfileIcon);

module.exports = router;
