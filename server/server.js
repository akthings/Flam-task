// server/server.js

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const DrawingState = require('./drawing-state');
const RoomManager = require('./rooms');

const app = express();
const httpServer = http.createServer(app);
// Socket.io initialization with CORS for development flexibility
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// --- WebSocket Protocol ---
io.on('connection', (socket) => {
    const userId = socket.id;
    const user = RoomManager.addUser(userId);
    
    if (!user) {
        // Handle full room scenario
        socket.emit('room:full', 'The room is currently full.');
        socket.disconnect(true);
        return;
    }

    console.log(`User connected: ${user.name} (${userId})`);
    
    // 1. Send initial state to the new user
    socket.emit('canvas:history', DrawingState.getHistory());
    
    // 2. Notify all clients about the new user and send updated user list
    io.emit('user:join', user);
    io.emit('user:list', RoomManager.getUsers());
    
    // DRAWING EVENT HANDLERS
    
    // EVENT: 'drawing:point' - Sent frequently for real-time drawing (Client-side prediction is key here)
    socket.on('drawing:point', (pointData) => {
        // Add user ID to the data for tracking
        const strokeData = DrawingState.addPoint(userId, { ...pointData, userId });
        
        // Broadcast the point to all OTHER clients (optimization: don't send back to sender)
        socket.broadcast.emit('drawing:point', { ...pointData, userId });
        
        // If the stroke ended, we broadcast the full, final stroke object
        if (pointData.type === 'end' && strokeData) {
            io.emit('drawing:stroke-end', strokeData);
        }
    });

    // EVENT: 'drawing:cursor' - Sent frequently for showing user indicators
    socket.on('drawing:cursor', (cursorPos) => {
        // Broadcast the cursor position to all OTHER clients
        socket.broadcast.emit('drawing:cursor', { 
            userId, 
            x: cursorPos.x, 
            y: cursorPos.y 
        });
    });

    // EVENT: 'drawing:undo' - Global undo operation
    socket.on('drawing:undo', () => {
        const undoneStroke = DrawingState.undo();
        if (undoneStroke) {
            // Broadcast the undo command to all clients
            io.emit('canvas:undo', undoneStroke);
            console.log(`Undo performed by ${user.name}. Undid stroke ID: ${undoneStroke.id}`);
        }
    });
    
    // DISCONNECT
    socket.on('disconnect', () => {
        RoomManager.removeUser(userId);
        io.emit('user:leave', userId);
        io.emit('user:list', RoomManager.getUsers());
        console.log(`User disconnected: ${user.name} (${userId})`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on *:${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});