// client/main.js

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const colorPicker = document.getElementById('color-picker');
    const widthRange = document.getElementById('stroke-width');
    const widthDisplay = document.getElementById('width-display');
    const undoButton = document.getElementById('undo-button');
    const userListElement = document.querySelector('#user-list ul');
    const toolButtons = document.querySelectorAll('.tool-button');

    // --- UI EVENT LISTENERS ---

    // Tool Selection
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            toolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const tool = button.id.startsWith('brush') ? 'brush' : 'eraser';
            CanvasManager.setTool(tool);
        });
    });

    // Color Picker
    colorPicker.addEventListener('input', (e) => {
        CanvasManager.setColor(e.target.value);
    });

    // Stroke Width
    widthRange.addEventListener('input', (e) => {
        const width = parseInt(e.target.value);
        widthDisplay.textContent = width;
        CanvasManager.setWidth(width);
    });
    
    // Undo Button
    undoButton.addEventListener('click', () => {
        // Disable button briefly to prevent spamming
        undoButton.disabled = true;
        undoButton.textContent = 'Processing...';
        SocketManager.sendUndoRequest();
        
        // Re-enable after a short delay (a small client-side prediction for UX)
        setTimeout(() => {
            undoButton.disabled = false;
            undoButton.textContent = '↩️ Undo';
        }, 500); 
    });

    // --- USER INTERFACE MANAGEMENT ---

    /**
     * Renders the list of currently online users.
     * @param {Array} users - List of user objects.
     */
    function updateUserList(users) {
        userListElement.innerHTML = ''; // Clear current list
        
        users.forEach(user => {
            const isMe = user.id === SocketManager.getUserId();
            
            // 1. Update the User List UI
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="user-color-dot" style="background-color: ${user.color};"></span>
                <strong>${user.name}</strong> ${isMe ? '(You)' : ''}
            `;
            userListElement.appendChild(li);

            // 2. Update the Remote Cursor Colors
            const remoteCursors = CanvasManager.getRemoteCursors();
            const cursorDiv = remoteCursors[user.id];
            if (cursorDiv) {
                cursorDiv.style.backgroundColor = user.color;
                cursorDiv.style.borderColor = isMe ? 'white' : user.color;
            }
        });
    }

    // --- SOCKET.IO CALLBACKS ---
    
    const socketCallbacks = {
        onConnectSuccess: (user) => {
            // Set initial color and update UI to show "You"
            CanvasManager.setColor(user.color);
            colorPicker.value = user.color;
            console.log(`Assigned color: ${user.color}`);
        },
        onStateReceived: (history) => {
            console.log(`Received initial history of ${history.length} strokes.`);
            CanvasManager.loadHistory(history);
        },
        onPointReceived: CanvasManager.handleRemotePoint,
        onCursorReceived: CanvasManager.handleRemoteCursor,
        onUndoReceived: CanvasManager.handleGlobalUndo,
        onUserListUpdated: (users) => {
            updateUserList(users);
            // Also clean up cursors for users that left
            const activeUserIds = users.map(u => u.id);
            const remoteCursors = CanvasManager.getRemoteCursors();
            Object.keys(remoteCursors).forEach(userId => {
                if (!activeUserIds.includes(userId)) {
                    CanvasManager.removeRemoteCursor(userId);
                }
            });
        }
    };

    // --- INITIALIZATION ---
    
    CanvasManager.addListeners();
    SocketManager.connect(socketCallbacks);
});