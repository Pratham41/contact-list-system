const router = require("express").Router();
const contactRoutes = require("./contact.routes");

router.use("/contacts", contactRoutes);

module.exports = router;
