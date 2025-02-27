const express = require("express");
const router = express.Router();
const userController = require("../controller/userControllser");
const { isAuth } = require("../middleware/authMiddleware");

router.post("/register", userController.register);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);

router.post("/email", userController.verifyEmail);
router.post("/password", userController.verifyPassword);

router.get("/user-details", isAuth, userController.userDetails);

router.get("/logout", isAuth, userController.logout);

router.put("/update-user", isAuth, userController.updateUser);

router.post("/search-user", isAuth, userController.searchUser);

module.exports = router;
