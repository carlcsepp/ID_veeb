const express = require("express");
const multer = require("multer");
const router = express.Router();

const {galleryPage} = require("../controllers/galleryControllers");

router.route("/").get(galleryPage);

module.exports = router;