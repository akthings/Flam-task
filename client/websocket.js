// client/websocket.js

const SocketManager = (function() {
    let socket = null;
    let userId = null;
    let userColor = '#000000'; // Default, will be updated on connection
    
    // Callbacks to be set by main.js
    let onStateReceived;
    let onPointReceived;
    let onUserListUpdated;
    let onCursorReceived;
    let onUndoReceived;
    let onConnectSuccess;

    /**
     * Connects to the server and sets up all event listeners.
     */
    function connect(callbacks) {
        // Set callbacks
        ({
            onStateReceived, 
            onPointReceived, 
            onUserListUpdated, 
            onCursorReceived, 
            onUndoReceived,
            onConnectSuccess
        } = callbacks);

        // Connect to Socket.io
        socket = io();

        // --- CORE CONNECTION EVENTS ---
        socket.on('connect', () => {
            console.log('Connected to server with ID:', socket.id);
            userId = socket.id;
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        socket.on('room:full', (message) => {
            alert(message);
        });

        // --- INITIAL STATE & USER MANAGEMENT ---
        socket.on('user:join', (user) => {
            // New user joined, update local color if it's 'me'
            if (user.id === userId) {
                userColor = user.color;
                onConnectSuccess(user);
            }
            console.log(`User joined: ${user.name} (${user.color})`);
        });

        socket.on('user:list', (users) => {
            onUserListUpdated(users);
        });

        socket.on('canvas:history', (history) => {
            onStateReceived(history);
        });

        // --- REAL-TIME DRAWING EVENTS ---
        
        // Handle incoming drawing points from OTHER users
        socket.on('drawing:point', (data) => {
            if (data.userId !== userId) {
                onPointReceived(data);
            }
        });
        
        // Handle cursor updates from OTHER users
        socket.on('drawing:cursor', (data) => {
            if (data.userId !== userId) {
                onCursorReceived(data);
            }
        });

        // Handle global undo
        socket.on('canvas:undo', (undoneStroke) => {
            onUndoReceived(undoneStroke);
        });
    }

    // --- EMITTER FUNCTIONS ---

    /**
     * Sends a drawing point to the server.
     * @param {object} pointData - {x, y, color, width, type: 'start'|'draw'|'end', tool: 'brush'|'eraser'}
     */
    function sendDrawingPoint(pointData) {
        if (socket && socket.connected) {
            socket.emit('drawing:point', { 
                ...pointData, 
                color: userColor // Ensure our assigned color is used
            });
        }
    }

    /**
     * Sends a cursor position to the server.
     * @param {number} x 
     * @param {number} y 
     */
    function sendCursorPosition(x, y) {
        if (socket && socket.connected) {
            socket.emit('drawing:cursor', { x, y });
        }
    }
    
    /**
     * Sends a global undo request.
     */
    function sendUndoRequest() {
        if (socket && socket.connected) {
            socket.emit('drawing:undo');
        }
    }

    return {
        connect,
        sendDrawingPoint,
        sendCursorPosition,
        sendUndoRequest,
        getUserId: () => userId,
        getUserColor: () => userColor
    };
})();