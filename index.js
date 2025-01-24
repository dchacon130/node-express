const express = require('express')
const jwt = require('jsonwebtoken');
const cors = require('cors');


const app = express();

let tasks = require('./tasksdb');

app.use(express.json());
app.use(cors(
    {origin: 'http://localhost:5173'}
)); 

const SECRET_KEY = 'NODE-EXPRESS'

const generateId = () => {
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(n => n.id)) : 0;
    return maxId + 1;
}

function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token){
        res.status(401).json({
            error: 'No access token filed'
        });
    }
    try{
        const  decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch(error){
        res.status(403).json({
            error: 'Token Invalido'
        });
    }
}

app.post('/login', (req, res) => {
    const {user, pass} = req.body;
    if( user === 'diego' && pass === '123'){
        const token = jwt.sign({user}, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    }else{
        res.status(401).json({
            error: 'Invalid credentials'
        });
    }
});

app.get('/', (req, res) => {
    const message = "<h1>Vivito y coleando!</h1>";
    res.send(message);
});

app.get('/tasks', (req, res) => {
    res.json(tasks)
});

app.get('/tasks/:id',  (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(task => task.id === id);
    if(task){
        res.json(task);
    }else{
        res.status(404).json({error: 'task not found'});
    }
});

app.post('/tasks',(req, res) => {
    const body = req.body;
    
    if(!body.title){
        return res.status(400).json({
            error: 'contnet is missing'
        })
    }else{
        const newTask = {
            id: generateId(), 
            status: body.status, 
            title: body.title, 
            comment: body.comment,
        }
        tasks.push(newTask);
        res.json(newTask);
    }
});

app.put('/tasks/:id',  autenticar, (req, res) => {
    const id = Number(req.params.id);
    const body = req.body;

    if(!body.status){
        res.status(404).json({
            error: 'No body found'
        });
    }else {
        const newTask = {
            id: id, 
            status: body.status, 
            title: body.title,
            comment: body.comment
        }
        tasks = tasks.map(task => task.id !== id ? task : newTask);
        res.json(newTask);
    }
});



app.delete('/tasks/:id', (req,res) => {
    const id = Number(req.params.id);
    tasks = tasks.filter(note => note.id !== id);
    res.status(204).json(tasks);
});


const PORT = 3002
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});