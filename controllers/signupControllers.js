const mysql = require("mysql2/promise");
const argon2 = require("argon2");
const validator = require("validator");
// const dbInfo = require("../../../../vp2025config");
const pool = require("../src/dbPool")

/* const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
} */

//@desc home page for signup
//@route GET /signup
//@access public

const signupPage = (req, res)=>{
	res.render("signup", {notice: "Ootan andmeid"});
};



//@desc page for creaing user account, signup
//@route POST /signup
//@access public


const signupPagePost = async (req, res)=>{
	//let conn;
	let notice = "";
	console.log(req.body);

	//andmete valideerimine
/* 	if(
		!req.body.firstNameInput ||
		!req.body.lastNameInput ||
		!req.body.birthDateInput ||
		!req.body.genderInput ||
		!req.body.emailInput ||
		req.body.passwordInput.length < 8 ||
		req.body.passwordInput !== req.body.confirmPasswordInput
	) {
		let notice = "Andmeid on puudu või miski on vigane!"
		console.log(notice);
		return res.render("signup", {notice: notice});
	} */
	//puhastame andmeid

	const firstName = validator.escape(req.body.firstNameInput.trim());
	const lastName = validator.escape(req.body.lastNameInput.trim());
	const birthDate = req.body.birthDateInput;
	const gender = req.body.genderInput;
	const email = req.body.emailInput.trim();
	const password = req.body.passwordInput;
	const confirmPassword = req.body.confirmPasswordInput;

	//kas kõik oluline on olemas?
	if(!firstName || !lastName || !birthDate || !gender || !email || !password || !confirmPassword){
		let notice = "Andmeid on puudu või miski on vigane!";
		console.log(notice);
		return res.render("signup", {notice: notice});
	}

	//kas email on korras?
	if(!validator.isEmail(email)){
		let notice = "E-mail on vigane!";
		//console.log(notice);
		return res.render("signup", {notice: notice});
	}

	// kas parool on õige?
	const passwordOptions = {minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0};
	if(!validator.isStrongPassword(password, passwordOptions)){
		let notice = "Parool on liiga nõrk!";
		//console.log(notice);
		return res.render("signup", {notice: notice});
	}

	//kas paroolid klapivad?
	if(password !== confirmPassword){
		let notice = "Paroolid ei klapi!";
		//console.log(notice);
		return res.render("signup", {notice: notice});
	}

	//kas sünnikuupäev on korrektne?
	if(!validator.isDate(birthDate) || validator.isAfter(birthDate)){
		let notice = "Sünnikuupäev pole reaalne";
		//console.log(notice);
		return res.render("signup", {notice: notice});
	}
		

	try {
		//conn = await mysql.createConnection(dbConf);
		//kontrollin, ega sellist juba pole
		let sqlReq = "SELECT id from uid WHERE email = ?";
		//const [users] = await conn.execute(sqlReq, [req.body.emailInput]);
		const [users] = await pool.execute(sqlReq, [req.body.emailInput]);
		if(users.length > 0){
			notice = "Selline kasutaja on juba olemas!";
			console.log(notice);
			return res.render("signup", {notice: notice});
		}
		//krüpteerime parooli
		const pwdHash = await argon2.hash(req.body.passwordInput)
		//console.log(pwdHash);
		//console.log(pwdHash.length);
		sqlReq = "INSERT INTO uid (first_name, last_name, birth_date, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)";

	  const [result] = await pool.execute(sqlReq, [
		req.body.firstNameInput,
		req.body.lastNameInput,
		req.body.birthDateInput,
		req.body.genderInput,
		req.body.emailInput,
		pwdHash
	  ]);
	  console.log("Salvestati kasutaja: " + result.insertId);
	  res.render("signup", {notice:"Valmis!"});
	}
	catch(err) {
	  console.log(err);
	  res.render("signup", {notice:"Tehniline viga"});
	}
	finally {
/* 	  if(conn){
	  await conn.end();
	    console.log("Andmebaasiühendus on suletud!");
	  } */
	}
};

module.exports = {
	signupPage,
	signupPagePost
};