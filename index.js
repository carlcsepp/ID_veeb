const express = require("express");
const fs = require("fs");
const dateEt = require("./src/dateTimeET");
//päringu lahtiharutaja POST jaoks
const bodyparser = require("body-parser");
//SQL andmebaasi moodul
//const mysql = require("mysql2");
//kuna kasutame async, impordime mysql2/promise mooduli
const mysql = require("mysql2/promise");
//const dbInfo = require("../../../../vp2025config");
const textRef = "./public/txt/vanasonad.txt";
const visitRef ="./public/txt/visitlog.txt";
// Loome objekti, mis ongi express.js programm ja edasi kasutamegi seda
const app = express();
// Maarame renderdajaks ejs
app.set("view engine", "ejs");
// Määrame kasutamiseks avaliku kataloogi
app.use(express.static("public"));
// Päringu URL-i parsimine, eraldame POST osa. False, kui ainult tekst, True kui muud infot ka
app.use(bodyparser.urlencoded({extended:false}));


const dbConfig = {
	host: "localhost",
	user: "if25",
	password: "DTI2025",
	database: "if25_carlsepp"
};

app.get("/", async (req, res) => {
  let conn;
  const sqlLatestPublic = "SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)";

  try {
    conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(sqlLatestPublic, [3]);
    const photoName = rows.length ? rows[0].filename : null;

    res.render("index", { photoName });
  } catch (err) {
    console.error(err);
    res.render("index", { photoName: null });
  } finally {
    if (conn) {
      await conn.end();
      console.log("Andmebaas suletud");
    }
  }
});

app.get("/timenow", (req, res)=>{
	res.render("timenow", {nowDate: dateEt.longDate(), nowWd: dateEt.weekDay()});
});

app.get("/visitlog", (req, res)=>{
	let visitlog = [];
	fs.readFile(visitRef, "utf8", (err, data)=>{
			if(err){
				res.render("visitlog", {heading: "Registreeritud kasutajad", listData: ["Ei leidnud ühtegi kasutajat"]});
			}
	});
});

app.get("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
	console.log(req.body);
	// Avan tekstifaili kirjutamiseks sellisel moel, et kui teda pole, luuakse (parameeter "a")
	fs.open("public/txt/visitlog.txt", "a", (err, file)=>{
		if(err){
			throw(err);
		}
		else {
			// Faili senisele sisule lisamine
			fs.appendFile("public/txt/visitlog.txt", req.body.nameInput + ";", (err)=>{
				if(err){
					throw(err);
				}
				else {
					console.log("Salvestatud!");
					res.render("regvisit");
				}
			});
		}
	});
});

app.get("/vanasonad", (req, res)=>{
	let folkWisdom = [];
	fs.readFile(textRef, "utf8", (err, data)=>{
			if(err){
				//kui tuleb viga, siis ikka väljastame veebilehe ilma vanasönadeta
				res.render("genericlist", {heading: "Valik Eesti vanasõnu", listData: ["Ei leidnud ühtegi vanasõna!"]});
			} else {
				folkWisdom = data.split(";");
				res.render("genericlist", {heading: "Valik Eesti vanasõnu", listData: folkWisdom});
			}
	});
});

app.get("/visitlog", (req, res)=>{
	let listData = [];
	fs.readFile("public/txt/visitlog.txt", "utf8", (err, data)=>{
		if(err){
			res.render("genericlist", {heading: "Registreeritud külastused", listData: ["Ei leidnud ühtegi külastust!"]});
		}
		else {
			listData = data.split(";");
			let correctListData = [];
			for(let i = 0; i < listData.length - 1; i ++){
				correctListData.push(listData[i]);
			}
			res.render("genericlist", {heading: "Registreeritud külastused", listData: correctListData});
		}
	});
});

app.get("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.post("/salvestatud", (req, res)=>{
	console.log(req.body);
	// Avan teksifaili kirjutamiseks sellisel moel, et kui teda pole siis luuakse
	fs.open("./public/txt/visitlog.txt", "a", (err, file)=>{
			if(err){
				throw(err);
			} else {
				//faili senisene sisule lisamine
				fs.appendFile("./public/txt/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ", " + dateEt.longDate(), (err)=>{
					if(err){
						throw(err);
					} else {
						console.log("Salvestatud!");
						res.render("salvestatud", {firstNameInput: req.body.firstNameInput, lastNameInput: req.body.lastNameInput});
					}
				});
			}
	});
});

app.get("/eestifilm", (req, res)=>{
	res.render("eestifilm");
});

app.get("/eestifilm/inimesed_add", (req, res)=>{
	res.render("filmiinimesed_add", {notice: "Ootan sisestust!"});
});

app.post("/eestifilm/inimesed_add", (req, res)=>{
	console.log(req.body);
	// Kas andmed on olemas?
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || req.body.bornInput > new Date()){
		res.render("filmiinimesed_add", {notice: "Andmed on vigased! Vaata Ã¼le!"});
	}
	else {
		let deceasedDate = null;
		if(req.body.deceasedInput != ""){
			deceasedDate = req.body.deceasedInput;
		}
		let sqlReq = "INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)";
		conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.bornInput, deceasedDate], (err, sqlRes)=>{
			if(err){
				res.render("filmiinimesed_add", {notice: "Tekkis viga" + err});
			}
			else {
				res.render("filmiinimesed_add", {notice: "Andmed on salvestatud!"});
			}
		});
	}

});

// Eesti filmi marsruudid
const eestifilmRouter = require("./routes/eestifilmRoutes");
app.use("/eestifilm", eestifilmRouter);

// Fotode üleslaadimine
const photoupRouter = require("./routes/photoupRoutes");
app.use("/galleryphotoupload", photoupRouter);

const galleryRouter = require("./routes/galleryRoutes");
app.use("/gallery", galleryRouter);

app.listen(5225);