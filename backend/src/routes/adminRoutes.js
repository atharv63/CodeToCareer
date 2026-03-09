const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { protect } = require("../middleware/auth");

/*
--------------------------------
COMPLAINT MANAGEMENT
--------------------------------
*/

router.get("/complaints", protect, adminController.getAllComplaints);

router.get("/complaints/:id", protect, adminController.getComplaintById);

router.put("/complaints/assign", protect, adminController.assignComplaint);

router.put("/complaints/spam/:id", protect, adminController.markSpam);

router.delete("/complaints/:id", protect, adminController.deleteComplaint);

/*
--------------------------------
MUNICIPALITY MANAGEMENT
--------------------------------
*/

router.post("/municipalities", protect, adminController.createMunicipality);

router.get("/municipalities", protect, adminController.getMunicipalities);

router.delete(
  "/municipalities/:id",
  protect,
  adminController.deleteMunicipality,
);

module.exports = router;
