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
        await client.connect();
        // Send a ping to confirm a successful connection

        const glaryCollection = client.db('Dagma-edu').collection('photoGlary')
        const teacherCollection = client.db('Dagma-edu').collection('teacher')
        const noticeCollection = client.db('Dagma-edu').collection('notice')
        const usersCollection = client.db('Dagma-edu').collection('users')
        const forumCollection = client.db('Dagma-edu').collection('forum')
        const cornerCollection = client.db('Dagma-edu').collection('corner')
        const resultCollection = client.db('Dagma-edu').collection('result')



        app.get('/allMemorys', async (req, res) => {
            const result = await glaryCollection.find().sort({ date: -1 }).toArray()
            res.send(result)
        })
        app.get('/singleMemory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await glaryCollection.findOne(query)
            res.send(result)
        })

        app.delete('/memory/delete/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await glaryCollection.deleteOne(filter)
            res.send(result)
        })

        app.get('/allTeachers', async (req, res) => {
            const result = await teacherCollection.find().toArray()
            res.send(result)
        })
        app.get('/teacher/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await teacherCollection.findOne(query)
            res.send(result)
        })
        app.get('/getTeacher/role/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await teacherCollection.findOne(query)
            res.send(result)
        })

        app.get('/all/forum/post', async (req, res) => {
            const result = await forumCollection.find().sort({ date: -1 }).toArray()
            res.send(result)
        })

        app.put('/update/teacher/:id', async (req, res) => {
            const teacherData = req.body
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: teacherData.name,
                    subject: teacherData.subject,
                    number: teacherData.number,
                    photo: teacherData.photo,
                    email: teacherData.email
                }
            }
            const result = await teacherCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.get('/singleNotice/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await noticeCollection.findOne(filter)
            res.send(result)
        })

        app.put('/notice/update/:id', async (req, res) => {
            const id = req.params.id
            const noticeData = req.body
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: noticeData.title,
                    photo: noticeData.photo,
                    UpdateDate: noticeData.UpdateDate,
                    status: noticeData.status
                }
            }
            const result = await noticeCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.post('/create/newPost', async (req, res) => {
            const postData = req.body
            const result = await forumCollection.insertOne(postData)
            res.send(result)
        })

        app.post('/addTeacher', async (req, res) => {
            const data = req.body
            const result = await teacherCollection.insertOne(data)
            res.send(result)
        })

        app.put('/add/comment/:id', async (req, res) => {
            const id = req.params.id
            const commentData = req.body
            const filter = { _id: new ObjectId(id) }
            let getCommentPost = await forumCollection.findOne(filter)
            getCommentPost.allCommentData.push(commentData)
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    allCommentData: getCommentPost.allCommentData
                }
            }
            const result = await forumCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.put('/delete/comment', async (req, res) => {
            const data = req.body
            const filter = { _id: new ObjectId(data.postId) }
            const selectPost = await forumCollection.findOne(filter)
            const existComment = selectPost.allCommentData.filter(comment => comment.idForComment !== data.commentId)
            const options = { upsert: true };
            const updateComment = {
                $set: {
                    allCommentData: existComment
                }
            }
            const result = await forumCollection.updateOne(filter, updateComment, options)
            res.send(result)
        })

        app.get('/user/:email', async (req, res) => {
            const userEmail = req.params.email
            const query = { email: userEmail }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })
        app.post('/add/new/user', async (req, res) => {
            const data = req.body
            const query = { email: data.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send('user already Added')
            }
            const result = await usersCollection.insertOne(data)
            res.send(result)
        })

        app.get('/all/notice', async (req, res) => {
            const result = await noticeCollection.find().sort({ date: -1 }).toArray()
            res.send(result)
        })

        app.post('/add/notice', async (req, res) => {
            const data = req.body
            const result = await noticeCollection.insertOne(data)
            res.send(result)
        })

        app.get('/get/corner/data', async (req, res) => {
            const result = await cornerCollection.find().toArray()
            res.send(result)
        })

        app.post('/update/corner/:id', async (req, res) => {
            const cornerData = req.body
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            await cornerCollection.deleteOne(filter)
            const result = await cornerCollection.insertOne(cornerData)
            res.send(result)
        })

        app.post('/addMemory', async (req, res) => {
            const data = req.body
            const result = await glaryCollection.insertOne(data)
            res.send(result)
        })

        app.delete('/post/delete/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await forumCollection.deleteOne(filter)
            res.send(result)
        })

        app.delete('/teacher/delete/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await teacherCollection.deleteOne(filter)
            res.send(result)
        })

        app.put('/update/teacher/role/:id', async (req, res) => {
            const id = req.params.id
            const {teacherRole} = req.body
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    teacherRole: teacherRole
                }
            }
            const result = await teacherCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.delete('/notice/delete/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await noticeCollection.deleteOne(filter)
            res.send(result)
        })

        app.get('/all/result', async (req, res) => {
            const result = await resultCollection.find().sort({ date: -1 }).toArray()
            res.send(result)
        })

        app.get('/section/result/:section', async (req, res) => {
            const section = req.params.section
            const filter = { select: section }
            const result = await resultCollection.find(filter).toArray()
            res.send(result)
        })

        app.get('/single/result/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await resultCollection.findOne(filter)
            res.send(result)
        })

        app.put('/result/update/:id', async (req, res) => {
            const id = req.params.id
            const updateResultData = req.body
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    updatePersonEmail: updateResultData.updatePersonEmail,
                    updatePerson: updateResultData.updatePerson,
                    publisherEmail: updateResultData.publisherEmail,
                    publisherName: updateResultData.publisherName,
                    date: updateResultData.date,
                    title: updateResultData.title,
                    select: updateResultData.select,
                    resultPic: updateResultData.resultPic,
                    participant: updateResultData.participant,
                    aPlus: updateResultData.aPlus,
                    passed: updateResultData.passed,
                    failed: updateResultData.failed,
                }
            }
            const result = await resultCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.post('/add/result', async (req, res) => {
            const resultData = req.body
            const result = await resultCollection.insertOne(resultData)
            res.send(result)
        })

        app.delete('/delete/result/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await resultCollection.deleteOne(filter)
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