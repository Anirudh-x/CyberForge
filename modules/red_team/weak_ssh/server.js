const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const router = require('./app');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use('/', router);

// Terminal Logic
io.on('connection', (socket) => {
  // Spawns a bash shell
  const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env
  });

  // Send output from shell to browser
  shell.onData((data) => {
    socket.emit('output', data);
  });

  // Send input from browser to shell
  socket.on('input', (data) => {
    shell.write(data);
  });

  socket.on('disconnect', () => {
    shell.kill();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lab running at http://localhost:${PORT}`);
});