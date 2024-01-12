import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// app created
const app = express();


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


// Database connection done
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Health",
  password: "navshar0923",
  port: 5432,
});
db.connect();


// Getting the home page 
app.get("/", (req, res) => {
  res.render("index.ejs");
});


// Getting the Login page
app.get("/login",(req,res)=>{
  res.render("login.ejs");
})

// Handling data for a new user
app.post("/login", async (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  if (password.length>3) {
    await db.query("insert into users values($1, $2)",[email, password]);
    res.redirect("/");
}else{
  alert("Length not sufficient");
} 
});

// Getting the Register Page
app.get("/register",(req,res)=>{
  res.render("register.ejs");
})

app.listen(3000, () => {
  console.log("Server working ✅");
});