const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const WebSocket = require("ws");

const port = process.env.PORT || 4000; // Single port for both HTTP and WebSocket

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// WebSocket server using the same port as HTTP
const wss = new WebSocket.Server({ noServer: true }); // "noServer" allows WebSocket server to be attached to the same port

let cmd = "";
let data = null;
let folder = null;
let storage = null;

app.get('/', (req, res) => {
    res.json({ message: 'Server connected ....' });
});

app.get("/folder", function(req, res){
    res.json(folder);
});

app.get("/storage", function(req, res){
    res.json(storage);
});

app.post("/send-folder", function(req, res){
    folder = req.body; 
    res.json({ status: "Received" });
});

app.post('/send-storage', function(req, res){
    storage = req.body;
    res.json({ status: "Received" });
});

app.get("/command", function(req, res) {
    res.json({ command: cmd });
    cmd = null;
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

app.post("/send-output", function(req, res) {
    const output = req.body.output;
    broadcast({ output });
    res.json({ status: "Received" });
});

app.post("/send-success", function(req, res) {
    data = req.body;
    if(data.command !== null){
        data = data.command.split("\n");
    }
    console.log("Received data from ESP32:", data);
    res.json({ status: "Received" });
});

app.post('/send-command', (req, res) => {
    const { command } = req.body;
    console.log("Send to ESP32: ", command);
    cmd = command;
    data = null;

    let attempts = 0;
    const maxAttempts = 80;

    const waitForResponse = setInterval(() => {
        if (data) {
            clearInterval(waitForResponse);
            res.json({ message: data });
            data = null;

        } else if (attempts >= maxAttempts) {
            console.log("No response from ESP32 after timeout.");
            clearInterval(waitForResponse);
            res.json({ message: "Error: No response from ESP32" });
        } 
        attempts++;
    }, 100);
});

// Start HTTP server
const server = app.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
});

// Handle WebSocket connections on the same port
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
