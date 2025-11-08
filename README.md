# 🎨 Real-Time Collaborative Drawing Canvas

A multi-user, real-time drawing application built with **Vanilla JavaScript (ES6+), HTML5 Canvas, Node.js, and Socket.io**. This project meets all core requirements of the assignment, focusing on low-level canvas mastery and efficient state synchronization.

## 🛠️ Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone [Your-Repo-URL]
    cd real-time-collaborative-canvas
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    npm start
    # Server will start on http://localhost:3000
    ```

## 🧪 How to Test with Multiple Users

1.  Open your browser to `http://localhost:3000`.
2.  Open **incognito/private windows** or a different browser (e.g., Chrome, then Firefox, then Safari) and navigate to the same URL (`http://localhost:3000`).
3.  Each connection will be assigned a unique user color and a "Guest X" name, visible in the **"Online Users"** sidebar.
4.  Start drawing on any window. You should see the stroke appear on all other windows **in real-time** (as you draw).
5.  Move your cursor around; other windows will display your **colored cursor indicator**.
6.  Test the **"Undo"** button. The last completed stroke globally should disappear from all canvases.

## 🐛 Known Limitations / Trade-offs

* **Conflict Resolution (Simultaneous Drawing):** The current implementation uses simple **last-write-wins** on the point-by-point canvas drawing. Since the server immediately broadcasts all points, two simultaneous strokes will interleave on the canvas. The server's history maintains stroke integrity (i.e., Stroke A remains separate from Stroke B), resolving state only upon canvas reload/initialization.
* **Global Undo/Redo:** Only **Undo** is implemented. **Redo** requires a more complex `undoneHistory` stack, which was omitted for time, as real-time sync was the priority.
* **Performance:** No explicit point **batching/throttling** is done for `drawing:point` events to showcase raw real-time responsiveness. For 100+ users, this would need to be implemented (e.g., using `requestAnimationFrame` on the client and rate-limiting on the server).

## ⏱️ Time Spent on the Project

* **[Estimate: 8-12 hours]**
    * **Architecture & Setup (2h):** Planning, `package.json`, `server.js` structure, `ARCHITECTURE.md` outline.
    * **Backend Logic (3h):** `drawing-state.js`, `rooms.js`, Socket.io event handling, state serialization.
    * **Frontend Core (4h):** `canvas.js` (core drawing, resize, history replay, remote point handling), `websocket.js`, `main.js` (UI logic).
    * **Advanced Features (2h):** Global Undo implementation, User Indicator logic.
    * **Styling & Polish (1h):** `index.html`, `style.css`.

---