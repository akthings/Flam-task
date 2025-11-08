// server/rooms.js

const MAX_USERS = 8;
const USER_COLORS = [
    '#E74C3C', // Red
    '#3498DB', // Blue
    '#2ECC71', // Green
    '#F1C40F', // Yellow
    '#9B59B6', // Purple
    '#1ABC9C', // Teal
    '#E67E22', // Orange
    '#34495E'  // Dark Blue
];

/**
 * Manages connected users and assigns them properties.
 */
class RoomManager {
    constructor() {
        // userId -> { id: string, name: string, color: string }
        this.users = {};
    }

    /**
     * Adds a new user and assigns a unique name and color.
     * @param {string} userId - The socket ID.
     * @returns {object} The new user object.
     */
    addUser(userId) {
        const userCount = Object.keys(this.users).length;
        if (userCount >= MAX_USERS) {
            return null; // Room full
        }
        
        const user = {
            id: userId,
            name: `Guest ${userCount + 1}`,
            color: USER_COLORS[userCount % USER_COLORS.length]
        };
        this.users[userId] = user;
        return user;
    }

    /**
     * Removes a user.
     * @param {string} userId - The socket ID.
     */
    removeUser(userId) {
        delete this.users[userId];
    }

    /**
     * Gets all current users.
     * @returns {Array} List of user objects.
     */
    getUsers() {
        return Object.values(this.users);
    }
}

module.exports = new RoomManager();