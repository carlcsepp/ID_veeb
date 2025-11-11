const express = require("express");
const fs = require("fs");
//päringu lahtiharutaja POST jaoks
const bodyparser = require("body-parser");
//SQL andmebaasi moodul
//const mysql = require("mysql2");
//kuna kasutame async, impordime mysql2/promise mooduli
const mysql = require("mysql2/promise");
//const dbInfo = require("../../../../vp2025config");
const dateEt = require("./src/dateTimeET");
// Loome objekti, mis ongi express.js programm ja edasi kasutamegi seda
const app = express();
// Maarame renderdajaks ejs
app.set("view engine", "ejs");
// Määrame kasutamiseks avaliku kataloogi
app.use(express.static("public"));
// Päringu URL-i parsimine, eraldame POST osa. False, kui ainult tekst, True kui muud infot ka
app.use(bodyparser.urlencoded({extended:false}));

/*
const dbConfig = {
	host: "localhost",
	user: "if25",
	passWord: "DTI2025",
	dataBase: "if25_carlsepp"
}; */

// Funktsioon andmebaasi ühenduse loomiseks
const createConnection = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log("Andmebaasiga ühendatud!");
        return connection;
    } catch (error) {
        console.error("Andmebaasi ühenduse viga:", error);
        throw error;
    }
};

app.get("/", (req, res)=>{
	//res.send("Express.js läks edukalt käima!");
	res.render("index");
});

app.get("/timenow", (req, res)=>{
	res.render("timenow", {nowDate: dateEt.longDate(), nowWd: dateEt.weekDay()});
});

app.get("/vanasonad", (req, res)=>{
	fs.readFile("public/txt/vanasonad.txt", "utf8", (err, data)=>{
		if(err){
			res.render("genericlist", {heading: "Valik Eesti tuntud vanasõnasid", listData: ["Kahjuks vanasأµnasid ei leidnud!"]});
		} else {
			let folkWisdom = data.split(";");
			res.render("genericlist", {heading: "Valik Eesti tuntud vanasõnasid", listData: folkWisdom});
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

app.get("/visitlog", (req, res)=>{
	let listData = [];
	fs.readFile("public/txt/visitlog.txt", "utf8", (err, data)=>{
		if(err){
			// Kui tuleb viga, siis ikka väljastame veebilehe, lihtsalt vanasÃµnu pole ühtegi
			res.render("genericlist", {heading: "Registreeritud külastused", listData: ["Ei leidnud ühtegi külastust!"]});
		}
		else {
			let tempListData = data.split(";");
			for(let i = 0; i < tempListData.length - 1; i ++){
				listData.push(tempListData[i]);
			}
			res.render("genericlist", {heading: "Registreeritud külastused", listData: listData});
		}
	});
});

app.post("/salvestatud", (req, res)=>{
	console.log(req.body);
	// Avan teksifaili kirjutamiseks sellisel moel, et kui teda pole siis luuakse
	fs.open("public/txt/visitlog.txt", "a", (err, file)=>{
			if(err){
				throw(err);
			} else {
				//faili senisene sisule lisamine
				fs.appendFile("public/txt/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ", " + dateET.fullDate() + " kell " + dateET.fullTime() +  " \n", (err)=>{
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
				res.render("filmiinimesed_add", {notice: "Tekkis tehniline viga:" + err});
			}
			else {
				res.render("filmiinimesed_add", {notice: "Andmed on salvestatud!"});
			}
		});
	}

});

app.get("/", (req, res) => {
    let sqlReq = "SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)";
    
    conn.execute(sqlReq, [3], (err, result) => {
        if (err) {
            // Kui mingi viga, siis lihtsalt näitame lehte ilma pildita
            res.render("index", { latestPhoto: null });
        } else {
            // Kui leidus vähemalt üks pilt
            res.render("index", { latestPhoto: result[0] || null });
        }
    });
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