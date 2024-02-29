import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from 'bcrypt';
import axios from "axios";

const app = express();

// Middle ware
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

// Initial data for blog posts (temporary, should be fetched from the database)
let blogPost = [
    { id: 1, topic: 'Welcome to Our Mental Health Blogging Community! 🌈', Author: 'Sample', content: "Hello, wonderful readers! 🌟 Step into a space where understanding unfolds, and support blossoms. We're thrilled to have you join our community dedicated to mental well-being.In this cozy corner of the internet, we explore stories of resilience, share experiences, and foster connections that contribute to a healthier mind and heart. Whether you're seeking inspiration, information, or just a comforting read, you're in the right place. Let's embark on a journey together, breaking the stigma surrounding mental health and fostering a compassionate community. Your well-being matters, and here, you're not alone. Welcome to a space where stories empower, and together, we thrive." }
  ];
  

// Rendering the main page
app.get("/", async (req, res) => {
    try {
        const result = await axios.get(url);

        const article = result.data.articles[6] || {}; // Ensure there's an article
        const news = (article.content || '').replace(/"/g, '');
        const auth = (article.author || '').replace(/"/g, '');
        const title = (article.title || '').replace(/"/g, '');
        const image = (article.urlToImage || '').replace(/"/g, '');

        res.render("index.ejs", { news, title, image, auth });
    } catch (error) {
        console.error(error);   
        res.status(500).send("Internal Server Error");
    }
});


// fetching the questions page
app.get("/questions",(req,res)=>{
    res.render("questions.ejs");
})

app.get("/blog",(req,res)=>{
    res.render("view.ejs",{posts: blogPost});
})


// For booking an appointment
app.get("/book",(req,res)=>{
    res.render("book.ejs");
})


// For seeing the list of doctors
app.get("/doctors",(req,res)=>{
    res.render("doctors.ejs");
})


// For donating 
app.get("/donate",(req,res)=>{
    res.render("donate.ejs");
})


// For seeing the doctors
app.get("/about",(req,res)=>{
    res.render("about.ejs");
})


// for adding a new blog
app.get("/addBlog",(req,res)=>{
    res.render("addBlog.ejs");
})

app.get("/view",(req,res)=>{
    res.render("view.ejs",{posts: blogPost});
})

app.post("/view", (req, res) => {
    const newPost = {
        id: blogPost.length + 1,
        topic: req.body.topic,
        email: req.body.email,
        content: req.body.content, // Corrected the case to match the textarea name
    };
    blogPost.push(newPost);
    res.redirect('/view');
});

// Handle deleting a blog post, update the blogPost array and redirect to the view page
app.post("/delete/:id", (req, res) => {
    const postId = parseInt(req.params.id);
    blogPost = blogPost.filter(post => post.id !== postId);
    res.redirect("/view");
  });




app.get("/view", (req, res) => {
    res.render("view.ejs",{posts: blogPost});
});

// For summoning the login page
app.get("/login", (req, res) => {
    res.render("login.ejs");
});


// Login for the old user 
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


// For the new user
app.get("/registration", (req, res) => {
    res.render("registration.ejs");
});


// For the new user
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
