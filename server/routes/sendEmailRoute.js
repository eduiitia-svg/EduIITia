// routes/emailRoutes.js
const { Router } = require("express");
const sendEmailHandler = require("../utils/sendemail.js");

const router = Router();

router.post("/sendEmail", sendEmailHandler);

module.exports = router;
