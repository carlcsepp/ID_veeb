const express = require("express");
const router = express.Router();

const {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	ametid,
	ametidPost,
	filmid,
	filmidPost} = require("../controllers/eestifilmControllers");

router.route("/").get(eestifilm);

router.route("/filmiinimesed").get(inimesed);

router.route("/filmiinimesed_add").get(inimesedAdd);
router.route("/filmiinimesed_add").post(inimesedAddPost);

router.route("/filmid").get(filmid);
router.route("/filmid").post(filmidPost);

router.route("/ametid").get(ametid);
router.route("/ametid").post(ametidPost);

module.exports = router;