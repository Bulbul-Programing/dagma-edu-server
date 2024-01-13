const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173',],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use(express.json())
require('dotenv').config()


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@dagma-edu.dg5yebo.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection

        const glaryCollection = client.db('Dagma-edu').collection('photoGlary')
        const teacherCollection = client.db('Dagma-edu').collection('teacher')

        app.get('/allMemorys', async(req, res)=>{
            const result = await glaryCollection.find().toArray()
            res.send(result)
        })
        app.get('/singleMemory/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id : new ObjectId(id)}
            const result = await glaryCollection.findOne(query)
            res.send(result)
        })

        app.delete('/memory/delete/:id', async(req, res)=>{
            const id = req.params.id
            const filter = {_id : new ObjectId(id)}
            const result = await glaryCollection.deleteOne(filter)
            res.send(result)
        })

        app.get('/allTeachers', async(req, res)=>{
            const result = await teacherCollection.find().toArray()
            res.send(result)
        })
        app.get('/teacher/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id : new ObjectId(id)}
            const result = await teacherCollection.findOne(query)
            res.send(result)
        })

        app.put('/update/teacher/:id', async(req, res)=>{
            const teacherData = req.body
            const id = req.params.id
            const filter = {_id : new ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set : {
                    name : teacherData.name,
                    subject : teacherData.subject,
                    number : teacherData.number,
                    photo : teacherData.photo,
                    email : teacherData.email
                }
            }
            const result = await teacherCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.post('/addTeacher', async(req, res)=>{
            const data = req.body
            const result = await teacherCollection.insertOne(data)
            res.send(result)
        })

        app.post('/addMemory', async(req, res)=>{
            const data = req.body
            const result = await glaryCollection.insertOne(data)
            res.send(result)
        })

        app.delete('/teacher/delete/:id', async(req, res)=>{
            const id = req.params.id
            const filter = {_id : new ObjectId(id)}
            const result = await teacherCollection.deleteOne(filter)
            res.send(result)
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
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server is running ${port}`);
})