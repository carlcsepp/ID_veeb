const express = require("express");
const multer = require("multer");
const router = express.Router();

// Seadistame fotode üleslaadimiseks kindla kataloogi
const uploader = multer({dest: "./public/gallery/orig/"});

const {
	photouploadPage,
	photouploadPagePost} = require("../controllers/photouploadControllers");

router.route("/").get(photouploadPage);
router.route("/").post(uploader.single("photoInput"), photouploadPagePost);

module.exports = router;
