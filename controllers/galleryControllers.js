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

//@desc home page for displaying uploaded photos
//@route GET /galleryPage
//@access public

const galleryPage = async (req, res)=>{
	let conn;
	const sqlReq = "SELECT filename FROM galleryphotos WHERE privacy = ? AND deleted IS null";
	try{
		conn = await mysql.createConnection(dbConf);
		let sqlReq = "SELECT filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL";
		const privacy = 2;
		const [rows, fields] = await conn.execute(sqlReq, [privacy]);
		console.log(rows);
		let galleryData = [];
		for (let i = 0; i < rows.length; i ++){
			let altTtext = "Galeriipilt";
			if(rows[i].alttext != ""){
				altText = rows[i].alttext;
			}
			galleryData.push({href: rows[i].filename, alt: altText});
		}
		res.render("gallery", {galleryData: galleryData, imagehref: "/gallery/thumbs/"});
	}
	catch(err) {
		throw(err);
		res.render("gallery", {galleryData: "Ei saanud pilte laadida"});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("DB suletud");
		}
	}
};

module.exports = {
	galleryPage
}