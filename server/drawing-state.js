// server/drawing-state.js

/**
 * Global state management for the canvas.
 * Stores a history of drawing operations (strokes).
 */
class DrawingState {
    constructor() {
        // history: Array of stroke objects. Each stroke is a complete path drawn by a user.
        // { id: string, userId: string, points: Array<{x: number, y: number}>, color: string, width: number }
        this.history = [];
        this.currentStroke = null; // Used for in-progress drawing
    }

    /**
     * Adds a point to an ongoing stroke or starts a new one.
     * @param {string} userId - ID of the user performing the action.
     * @param {object} pointData - {x, y, color, width, type: 'start'|'draw'|'end'}
     * @returns {object|null} The stroke data if it's an 'end' event, otherwise null.
     */
    addPoint(userId, pointData) {
        if (pointData.type === 'start') {
            const strokeId = Date.now().toString() + '-' + userId; // Simple unique ID
            this.currentStroke = {
                id: strokeId,
                userId: userId,
                color: pointData.color,
                width: pointData.width,
                type: pointData.tool, // 'brush' or 'eraser'
                points: [{ x: pointData.x, y: pointData.y }]
            };
            return null;
        } else if (pointData.type === 'draw') {
            if (this.currentStroke && this.currentStroke.userId === userId) {
                this.currentStroke.points.push({ x: pointData.x, y: pointData.y });
            }
            return null;
        } else if (pointData.type === 'end') {
            if (this.currentStroke && this.currentStroke.userId === userId) {
                // Finalize the stroke and add it to history
                const finalStroke = { ...this.currentStroke };
                this.history.push(finalStroke);
                this.currentStroke = null;
                return finalStroke;
            }
            return null;
        }
    }

    /**
     * Reverts the last operation from the history (Global Undo).
     * @returns {object|null} The undone stroke, or null if history is empty.
     */
    undo() {
        if (this.history.length > 0) {
            return this.history.pop();
        }
        return null;
    }

    /**
     * Returns the full history of drawing operations.
     * @returns {Array} The canvas state history.
     */
    getHistory() {
        return this.history;
    }

    /**
     * Clears the history (for full canvas clear or future redo).
     */
    clear() {
        this.history = [];
    }
}

module.exports = new DrawingState();