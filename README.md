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



### Service GET
    const serviceCollection = client.db('carDoctor').collection('services');
    app.get('/services', async (req, res) => {
          const cursor = serviceCollection.find();
          const result = await cursor.toArray();
          res.send(result);
        })
### service single GET

    app.get('/services/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }
          const options = {
            projection: { title: 1, price: 1, service_id: 1, img: 1 },
          };
          const result = await serviceCollection.findOne(query,options);
          
          res.send(result);

          
      })
### BooKing 
      app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });


    
### BooKing  GET By EMAIL
        app.get('/bookings', async (req, res) => {
              console.log(req.query.email);
              let query = {};
              if (req.query?.email) {
                  query = { email: req.query.email }
              }
              const result = await bookingCollection.find(query).toArray();
              res.send(result);
          })
### BooKing  UPDATE By PATCH
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
### BooKing  DELETE
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })




### cmd 
       npm install jsonwebtoken
### index.js
    const jwt = require('jsonwebtoken');(incluede this line)
  
### connection function 
      //Auth related -(token check)
        app.post('/jwt',async(req,res)=>{
          const user = req.body;
          console.log(user);
          const token =jwt.sign(user,'secret',{expiresIn:'1h'})
          res.send(token)
        })
### then client site---
    login.jsx
    import axios from 'axios';
        signIn(email, password)
   .then(result => {
              const loggedInUser =result.user;
              console.log('check this line',loggedInUser);
              ///this line start
                  const user ={ email };
                
                  axios.post('http://localhost:5000/jwt',user)
                  .then(res=>{
                    console.log(res.data);
                  })
              ////ending line






            // console.log("login tyme",result.user.displayName);
            // setLoading(false);
            // navigate(location?.state?location.state:'/');
            
            // toast.success("Signin Successful {result.user.displayName}")

            
        })
        .catch(error => {
          toast.error('your email and password should match with the registered email and password If it doesnt match')
                
        })

#### npm install cookie-parser (60-4 JWT Token Secret And Set Token To Http Only Cookie)
    1step  .env
          ACCESS_TOKEN_SECRET=70fce714172fedeb96b2efc20559609fe9272135a29ea4feed84a09decdb8e480046f77e3c3a9cbe361972cfce4632c0b6eb0f656b414de766ed96c39c473100
    2 step
          const cookieParser = require('cookie-parser');
          // middleware
          app.use(cookieParser());

          app.post('/jwt',async(req,res)=>{
              const user = req.body;
              console.log(user);
           // new line
              const token =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
              res
              .cookie('token',token,{
                httpOnly:true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
              })
              .send({success:true})
            // end line

            })

####
      booking-

        app.get('/bookings', async (req, res) => {
              console.log(req.query.email);
              console.log('ttttt token', req.cookies.token)//only using this line
              let query = {};
              if (req.query?.email) {
                  query = { email: req.query.email }
              }
              const result = await bookingCollection.find(query).toArray();
              res.send(result);
        })

        ####60-6 (Recap) JWT Token Http Only Cookie And Withcredentials
      