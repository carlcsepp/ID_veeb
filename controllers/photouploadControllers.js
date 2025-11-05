const mysql = require("mysql2/promise");
const dbInfo = require("../../../../vp2025config");
const fs = require("fs").promises;
const sharp = require("sharp");

const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

//@desc home page for uploading gallery photos
//@route GET /galleryphotoupload
//@access public

const photouploadPage = (req, res)=>{
	res.render("galleryphotoupload");
};

//@desc home page for uploading gallery photos
//@route POST /galleryphotoupload
//@access public

const photouploadPagePost = async (req, res) =>{
	let conn;
	console.log(req.body);
	console.log(req.file);
	try {
		const fileName ="vp_" + Date.now() + ".jpg";
		console.log(fileName);
		await fs.rename(req.file.path, req.file.destination + fileName);
		// Loon normaalsruuruse 800x600 px
		await sharp(req.file.destination + fileName).resize(800, 600).jpeg({quality: 90}).toFile("./public/gallery/normal" + fileName);
		// Thumbnail 100x100
		await sharp(req.file.destination + fileName).resize(100, 100).jpeg({quality: 90}).toFile("./public/gallery/thumbs" + fileName);
		conn = await mysql.createConnection(dbConf);
		let sqlReq = "INSERT INTO galleryphotos (filename, origname, alttext, privacy, userid) VALUES (?,?,?,?,?)";
		// Kuna kasutajakontosi pole, määrame userid = 1
		const userid = 1;
		const [result] = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userid]);
		res.render("galleryphotoupload");
	}
	catch(err){
		console.log(err);
		res.render("galleryphotoupload");
	}
	finally {
		if(conn){
			await conn.end();
			console.log("Andmebaas suletud");
		}
	}
};

module.exports = {
	photouploadPage,
	photouploadPagePost
};