import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

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
});

// Handling data for a old user
app.post("/login", async (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.query("SELECT username, password FROM users WHERE username = $1", [email]);
  if (result.rows.length === 1) {
  const dbHashedPassword = result.rows[0].password;
  const passwordMatch = await bcrypt.compare(password, dbHashedPassword);
  if (passwordMatch) {
    res.redirect("/");
  } else {
    res.send("Wrong credentials");
  }
} else {
  res.send("Wrong credentials");
}

});

// For a new user
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Credentials for a new user
app.post("/register", async (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if the user already exists
    const result = await db.query(
      "SELECT username FROM users WHERE username = $1",
      [email]
    );

    if (result.rows.length === 0) {
      // User does not exist, so insert
      await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
        email,
        hashedPassword,
      ]);
      res.redirect("/");
    } else {
      res.send("User already exists");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server working ✅");
});
