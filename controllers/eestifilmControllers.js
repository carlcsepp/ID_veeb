const mysql = require("mysql2/promise");
const dbInfo = require("../../../../vp2025config");

const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

//@desc home page for Estonian Film section
//@route GET /Eestifilm
//@access public

//app.get("/Eestifilm", (req, res)=>{
const eestifilm = (req, res)=>{
	res.render("eestifilm");
};

//@desc page for people involved in Estonian Film industry
//@route GET /Eestifilm/inimesed
//@access public

// app.get("/eestifilm/filmiinimesed", async (req, res)=>{
const inimesed = async (req,res) =>{
	let conn;
	const sqlReq = "SELECT * FROM person";
	try {
		conn = await mysql.createConnection(dbConf);
		console.log("Andmebaasiga ühendus alustatud");
		const [rows, fields] = await conn.execute(sqlReq);
		res.render("filmiinimesed", {personList: rows});
	}
	catch {
		console.log("Viga!");
		res.render("filmiinimesed", {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("Andmebaasiga ühendus katkestatud");
		}
	}
};

const filmid = async (req,res) =>{
	let conn;
	const sqlReq = "SELECT * FROM movie";
	try {
		conn = await mysql.createConnection(dbConf);
		console.log("Andmebaasiga ühendus alustatud");
		const [rows, fields] = await conn.execute(sqlReq);
		res.render("filmid", {movieList: rows, notice: req.query.notice || "ootan andmeid"});
	}
	catch {
		console.log("Viga!");
		res.render("filmid", {movieList: [], notice: "Viga andmete laadimisel"});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("Andmebaasiga ühendus katkestatud");
		}
	}
};

const filmidPost = async (req, res) =>{
	let conn;
	let sqlReq = "INSERT INTO movie (title, production_year, duration) VALUES (?,?,?)";
	
	if(!req.body.titleInput || !req.body.durationInput || !req.body.yearInput || req.body.yearInput >= new Date()){
	  return res.redirect(req.baseUrl + "/filmid");
	}
	
	else {
		try {
			conn = await mysql.createConnection(dbConf);
			console.log("Andmebaasiühendus loodud!");
			const [result] = await conn.execute(sqlReq, [req.body.titleInput, req.body.yearInput, req.body.durationInput]);
			console.log("Salvestati kirje: " + result.insertId);
			return res.redirect(req.baseUrl + "/filmid");
		}
		catch(err) {
			console.log("Viga: " + err);
			return res.redirect(req.baseUrl + "/filmid");
		}
		finally {
			if(conn){
			await conn.end();
				console.log("Andmebaasiühendus on suletud!");
			}
		}
	}
};

const ametid = async (req,res) =>{
	let conn;
	const sqlReq = "SELECT * FROM `position`";
	try {
		conn = await mysql.createConnection(dbConf);
		console.log("Andmebaasiga ühendus alustatud");
		const [rows, fields] = await conn.execute(sqlReq);
		res.render("ametid", {roleList: rows, notice: req.query.notice || "ootan andmeid"});
	}
	catch {
		console.log("Viga!");
		res.render("ametid", {roleList: [], notice: "Viga andmete laadimisel"});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("Andmebaasiga ühendus katkestatud");
		}
	}
};

const ametidPost = async (req, res) =>{
	let conn;
	let sqlReq = "INSERT INTO `position` (position_name, description) VALUES (?,?)"
	
	try {
		conn = await mysql.createConnection(dbConf);
		console.log("Andmebaasiühendus loodud!");
		const [result] = await conn.execute(sqlReq, [req.body.positionInput, req.body.descriptionInput]);
		console.log("Salvestati kirje: " + result.insertId);
		return res.redirect(req.baseUrl + "/ametid");
	}
	catch(err) {
		console.log("Viga: " + err);
		return res.redirect(req.baseUrl + "/ametid");
	}
	finally {
		if(conn){
		await conn.end();
			console.log("Andmebaasiühendus on suletud!");
		}
	}
};

//@desc page for adding people in Estonian Film industry
//@route GET /Eestifilm/inimesed_add
//@access public

//app.get("/Eestifilm/inimesed_add", (req, res)=>{
const inimesedAdd = (req, res) =>{
	res.render("filmiinimesed_add", {notice: "ootan sisestust"});
};

//@desc page for adding people in Estonian Film industry
//@route POST /Eestifilm/inimesed_add
//@access public

//app.post("/Eestifilm/inimesed_add", async (req, res)=>{
const inimesedAddPost = async (req, res) =>{
	let conn;
	let sqlReq = "INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)";
	
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || req.body.bornInput >= new Date()){
	  res.render("filmiinimesed_add", {notice: "Osa andmeid oli puudu või ebakorrektsed"});
	}
	
	else {
		try {
			conn = await mysql.createConnection(dbConf);
			console.log("Andmebaasiühendus loodud!");
			let deceasedDate = null;
			if(req.body.deceasedInput != ""){
				deceasedDate = req.body.deceasedInput;
			}
			const [result] = await conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.bornInput, deceasedDate]);
			console.log("Salvestati kirje: " + result.insertId);
			res.render("filmiinimesed_add", {notice: "Andmed salvestatud"});
		}
		catch(err) {
			console.log("Viga: " + err);
			res.render("filmiinimesed_add", {notice: "Andmete salvestamine ebaönnestus"});
		}
		finally {
			if(conn){
			await conn.end();
				console.log("Andmebaasiühendus on suletud!");
			}
		}
	}
};

module.exports = {
  eestifilm,
  inimesed,
  inimesedAdd,
  inimesedAddPost,
  ametid,
  ametidPost,
  filmid,
  filmidPost
};