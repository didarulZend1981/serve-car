const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
// middlewares 

const logger = (req, res, next) =>{
  console.log('log: info', req.method, req.url);
    next();
}

const verifyToken = (req, res, next) =>{
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  // no token available 
  if(!token){
      return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
      if(err){
          return res.status(401).send({message: 'unauthorized access'})
      }
      req.user = decoded;
      next();
  })
}
// console.log(process.env.BD_USER);
// console.log(process.env.BD_PASS);


// const uri = "mongodb://localhost:27017";

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.ckoz8fu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const serviceCollection = client.db('carDoctor').collection('services');
    const bookingCollection = client.db('carDoctor').collection('bookings');
    
    //Auth related
    app.post('/jwt',logger, async(req,res)=>{
      const user = req.body;
      console.log(user);
      const token =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
      res
      .cookie('token',token,{
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
      .send({success:true})
    })
    
    
    
    
    
    
    
    //service related
    app.get('/services',logger, async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/services/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }
          const options = {
            projection: { title: 1, price: 1, service_id: 1, img: 1 },
          };
          const result = await serviceCollection.findOne(query,options);
          
          res.send(result);

          
      });

      //booking purpose
      app.post('/bookings',logger,verifyToken, async (req, res) => {
        const booking = req.body;
        console.log(booking);
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
     });

     app.get('/bookings',logger,verifyToken, async (req, res) => {
          console.log(req.query.email);
          // console.log('ttttt token', req.cookies.token)
          console.log('user in the from valid token',req.user)
          if(req.user.email !== req.query.email){
            return res.status(403).send({message: 'forbidden access'})
          }
          let query = {};
          if (req.query?.email) {
              query = { email: req.query.email }
          }
          const result = await bookingCollection.find(query).toArray();
          res.send(result);
      })
      app.patch('/bookings/:id', async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const updatedBooking = req.body;
          console.log(updatedBooking);
          const updateDoc = {
              $set: {
                  status: updatedBooking.status
              },
          };
          const result = await bookingCollection.updateOne(filter, updateDoc);
          res.send(result);
      })

      app.delete('/bookings/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }
          const result = await bookingCollection.deleteOne(query);
          res.send(result);
      })


    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`Car Doctor Server is running on port ${port}`)
})

