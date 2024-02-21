import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from 'bcrypt';
import axios from "axios";

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");  // Set up EJS view engine

const url = 'https://saurav.tech/NewsAPI/top-headlines/category/health/in.json';

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Health",
    password: "navshar0923",
    port: 5432,
});
db.connect();

app.get("/", async(req, res) => {
    try{
        const result = await axios.get(url);
        const nes = JSON.stringify(result.data.articles[0].content);
        res.render("index.ejs",{news: nes});
    }catch{
        console.log(error);
    }
});

app.get("/questions",(req,res)=>{
    res.render("questions.ejs");
})

app.get("/book",(req,res)=>{
    res.render("book.ejs");
})

app.get("/doctors",(req,res)=>{
    res.render("doctors.ejs");
})

app.get("/donate",(req,res)=>{
    res.render("donate.ejs");
})

app.get("/about",(req,res)=>{
    res.render("about.ejs");
})

app.get("/blog",(req,res)=>{
    res.render("blog.ejs");
})

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post("/login", async (req, res) => {
    const email = req.body["email"];
    const password = req.body["password"];

    try {
        const result = await db.query("SELECT * FROM mental WHERE email = $1", [email]);

        if (result.rows.length === 1) {
            const hashedPassword = result.rows[0].password;

            if (await bcrypt.compare(password, hashedPassword)) {
                res.redirect("/");
            } else {
                res.send("Wrong Password");
            }
        } else {
            res.send("Wrong Email");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/registration", (req, res) => {
    res.render("registration.ejs");
});

app.post("/register", async (req, res) => {
    const name = req.body["name"];
    const email = req.body["email"];
    const password = req.body["password"];
    const confirmPassword = req.body["ConfirmPassword"];

    try {
        const result = await db.query("SELECT * FROM mental WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            if (password === confirmPassword) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.query("INSERT INTO mental (email, name, password) VALUES ($1, $2, $3)", [email, name, hashedPassword]);
                res.redirect("/");
            } else {
                res.send("Passwords do not match");
            }
        } else {
            res.send("User already exists");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.listen(3000, () => {
    console.log("Server working ✅");
});
