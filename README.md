###cmd 
	npm init -y
	npm i express cors mongodb dotenv
  npm install -g nodemon
####create 
  index.js
	scripts
	"start":"node index.js"

### index.js

    const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion} = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.BD_USER);
// console.log(process.env.BD_PASS);


// const uri = "mongodb://localhost:27017";

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.ckoz8fu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;(this line change)

    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    async function run() {
      try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
    }
    run().catch(console.dir);




    app.get('/', (req, res) => {
        res.send('doctor is running')
    })

    app.listen(port, () => {
        console.log(`Car Doctor Server is running on port ${port}`)
    })
