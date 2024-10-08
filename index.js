const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`Brainyplay server is running at: ${port}`)
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5xew4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


        //create collection
        const toysCollection = client.db("toysDB").collection("toys");

        //get all toys
        app.get('/toys', async (req, res) => {
            const cursor = toysCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        //get all toys sorted
        app.get('/toys/sorted', async(req, res)=> {
            let sortBy = {price: 1};
            if(parseInt(req?.query?.sort) === 0){
                sortBy = {price: -1};
            }
            const cursor = toysCollection.find().sort(sortBy);
            const result = await cursor.toArray();
            res.send(result);
        })

        //get a specific users toys
        app.get('/mytoys', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email };
            }
            const cursor = toysCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        //get a toy
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const toy = await toysCollection.findOne(query);
            res.send(toy);
        })

        //get a specific category toys
        app.get('/categories/:category', async(req, res) => {
            const category = req.params.category;
            const query = {category: category};
            const cursor = toysCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        //add a toy to database
        app.post('/addtoys', async (req, res) => {
            const toy = req.body;
            console.log(toy);
            const result = await toysCollection.insertOne(toy);
            res.send(result);
        })

        //update a toy using id
        app.patch('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };

            const updated = req.body;
            const updateToy = {
                $set: {
                    price: updated.price,
                    quantity: updated.quantity,
                    description: updated.description,
                },
            };
            const result = await toysCollection.updateOne(filter, updateToy);
            res.send(result);
        })

        //delete a toy using id
        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is running at port:`, port);
})