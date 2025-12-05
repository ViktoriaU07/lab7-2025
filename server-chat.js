const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

let clients = [];

app.get('/events', (req, res) => {

    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    clients.push(newClient);

    req.on('close', () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
    });
});

app.post('/message', (req, res) => {
    const { username, text } = req.body;
    const time = new Date().toLocaleTimeString();
    
    const message = { username, text, time };

    clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify(message)}\n\n`);
    });

    res.json({ status: 'sent' });
});

app.listen(3000, () => console.log('SSE Chat Server running on port 3000'));