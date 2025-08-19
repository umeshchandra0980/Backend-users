

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const path = require('path')
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');
// const { hasSubscribers } = require('diagnostics_channel');

// const sqlite3 = require('sqlite3').verbose()
// const db = new sqlite3.Database('./users.db')
const dbPath = path.join(__dirname, './Allusers.db');

app.use(express.json())
app.use(cors());

db=null

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT,
              password TEXT
            );
          `);
          const authorCount = await db.get(`SELECT COUNT(*) AS count FROM users`);
        if (authorCount.count === 0) {
            await db.run(`
                INSERT INTO users (Email,password)
                VALUES ('J.K. Rowling',1234), ('George R.R. Martin',3456), ('Harper Lee',33333);
            `);
        }
       
        app.listen(3006, () => {
            console.log("✅ Server is running on http://localhost:3006");
        });

    } catch (e) {
        console.error("❌ Error: " + e.message);
        process.exit(1);
    }
};
initializeDBAndServer()



app.get('/users',async (req,res) => {
    const data = await db.all('SELECT * FROM users');
    res.send(data)
})

app.post('/signup',async (req,res) => {
  const {email,password} = req.body
  const hashpassword = await bcrypt.hash(password,10)
  console.log(hashpassword)
  console.log(email,password)
  const data = await db.get(`SELECT * FROM users WHERE email = '${email}'`)
    
    if(data  === undefined){
    
    const dataAdd = await db.run(`INSERT INTO users (email,password) VALUES ('${email}','${hashpassword}')`)
    res.send("user added succufully")
     const payload = {email:email}
     
         const jwtToken = jwt.sign(payload,'secretkey',{expiresIn : '2h'})
         res.send({jwtToken})

    }

  
    else{
        res.status(400)
        res.send("user already exits")
    }
} )

app.post('/login',async (req,res) => {
    const {email,password} = req.body
    const data =  await db.get(`SELECT * FROM users WHERE email = '${email}'`)
    console.log(data)
    if (data === undefined){
        res.status(400).send("Invalid username or password")
    }
    else{
      const cheaking = await bcrypt.compare(password,data.password)
      if (cheaking == true){
        const payload = {}
     
         const jwtToken = jwt.sign(payload,'secretkey',{expiresIn : '2h'})
         res.send({jwtToken})
      }
      else{
        res.status(400).send("Invalid email or password")
      }
    }
})





