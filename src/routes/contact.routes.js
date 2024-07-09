const router = require("express").Router();
const { CONTACT_CONTROLLER } = require("../controllers");
const upload = require("../middlewares/upload");

router
  .route("/")
  .post(upload.single("image"), CONTACT_CONTROLLER.createNewContact)
  .get(CONTACT_CONTROLLER.getAllContacts);
router.route("/search").get(CONTACT_CONTROLLER.searchForContacts);
router
  .route("/:id")
  .get(CONTACT_CONTROLLER.getContact)
  .put(upload.single("image"), CONTACT_CONTROLLER.updateContact)
  .delete(CONTACT_CONTROLLER.deleteContact);
router.route("/export/contacts").get(CONTACT_CONTROLLER.exportContactsToCSV);

module.exports = router;
