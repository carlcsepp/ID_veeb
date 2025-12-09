const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "./public/news_images/" });

//kontrollerid
const{
    newsHome,
    newsAdd,
    newsAddPost} = require("../controllers/newsControllers")

router.route("/").get(newsHome);
router.route("/newsadd").get(newsAdd);
router.route("/newsadd").post(upload.single("photoInput"),newsAddPost);

module.exports = router;

