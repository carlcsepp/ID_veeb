const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const sharp = require("sharp");
const dbInfo = require("../../../../vp2025config");

const dbConf = {
  host: dbInfo.configData.host,
  user: dbInfo.configData.user,
  password: dbInfo.configData.passWord,
  database: dbInfo.configData.dataBase
};


//@desc Home page for news
//@royte GET /news
//@access public
const newsHome = async (req, res) => {
  let conn;
  try{
    conn = await mysql.createConnection(dbConf);
    const sqlReq = "SELECT * FROM news WHERE expire > ? ORDER BY id DESC"
    const [rows] = await conn.execute(sqlReq, [new Date()]);
    res.render("news", {news:rows});
  }catch(err) {
    console.log(err);
  }
  finally {
    if (conn) {
      await conn.end();
      console.log("Andmebaasi ühendus suletud");
    }
  } 
};

// @desc Page for adding news
// @route GET /newsAdd
// @access public
const newsAdd = async (req, res) => {
  res.render("newsAdd", { notice: ""});
};

// @desc Add news 
// @route POST /newsAddPost
// @access public
const newsAddPost = async (req, res) => {
  let conn;
  console.log(req.body);
  console.log(req.file);

  try {
    const sqlReq = "INSERT INTO news(title, content, expire, photofilename, alttext, userid) VALUES (?,?,?,?,?,?)"
    const userId = 1;
    let fileName = null;
    if (req.file) {
      fileName = "news_" + Date.now() + "_" + req.file.originalname;
      await fs.rename(req.file.path, req.file.destination + fileName);
    }

    conn = await mysql.createConnection(dbConf);
    const [result] = await conn.execute(sqlReq, [
      req.body.titleInput,
      req.body.contentInput,
      req.body.expireInput,
      fileName,
      req.body.altInput,
      userId
    ]);

    console.log("Uudis lisatud id-ga: " + result.insertId);
    res.redirect("/news");
  } catch (err) {
    console.log("Viga: " + err);
    res.render("newsadd", { notice: "Tekkis viga!" });
  } finally {
    if (conn) {
      await conn.end();
      console.log("Andmebaasi ühendus suletud");
    }
  }
};

  


module.exports = {
    newsHome,
    newsAdd,
    newsAddPost};