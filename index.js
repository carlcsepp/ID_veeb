const express = require("express");
const fs = require("fs");
const bodyparser = require("body-parser")
const dateEt = require("./src/dateTimeET");
// Loome objekti, mis ongi express.js programm ja edasi kasutamegi seda
const app = express();
// Maarame renderdajaks ejs
app.set("view engine", "ejs");
// Määrame kasutamiseks avaliku kataloogi
app.use(express.static("public"));
// Päringu URL-i parsimine, eraldame POST osa. False, kui ainult tekst, True kui muud infot ka
app.use(bodyparser.urlencoded({extended:false}));

app.get("/", (req, res)=>{
	//res.send("Express.js läks edukalt käma!");
	res.render("index");
});

app.get("/timenow", (req, res)=>{
	res.render("timenow", {nowDate: dateEt.longDate(), nowWd: dateEt.weekDay()});
});

app.get("/vanasonad", (req, res)=>{
	fs.readFile("public/txt/vanasonad.txt", "utf8", (err, data)=>{
		if(err){
			res.render("genericlist", {heading: "Valik Eesti tuntud vanasأµnasid", listData: ["Kahjuks vanasأµnasid ei leidnud!"]});
		} else {
			let folkWisdom = data.split(";");
			res.render("genericlist", {heading: "Valik Eesti tuntud vanasأµnasid", listData: folkWisdom});
		}
	});
	
});

app.get("/reqvisit", (req, res)=>{
	res.render("reqvisit");
});

app.post("/reqvisit", (req, res)=>{
	console.log(req.body);
	//avan tekstifaili kirjutamiseks sellisel moel, et kui teda pole, luuakse (parameeter "a")
	fs.open("public/txt/visitlog.txt", "a", (err, file)=>{
		if(err){
			throw(err);
		}
		else {
			//faili senisele sisule lisamine
			fs.appendFile("public/txt/visitlog.txt", req.body.nameInput + ";", (err)=>{
				if(err){
					throw(err);
				}
				else {
					console.log("Salvestatud!");
					res.render("reqvisit");
				}
			});
		}
	});
});

app.listen(5225);