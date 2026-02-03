// file: session-store.js
const fs = require('fs');
const path = require('path');

const activeSessionsPath = path.join(__dirname, "database", "sessions.json");
let activeSessions = new Map();

// ==================== SESSION MANAGEMENT ==================== //
function loadPersistentSessions() {
    if (!fs.existsSync(activeSessionsPath)) {
        console.log('[SESSION] 📂 No persistent sessions file, creating new');
        const initialData = {};
        fs.writeFileSync(activeSessionsPath, JSON.stringify(initialData, null, 2));
        return new Map();
    }
    
    try {
        const fileContent = fs.readFileSync(activeSessionsPath, 'utf8');
        if (!fileContent.trim()) {
            return new Map();
        }
        
        const sessionsData = JSON.parse(fileContent);
        const map = new Map();
        
        // Filter session yang belum expired
        const now = Date.now();
        let validCount = 0;
        
        Object.entries(sessionsData).forEach(([username, sessionData]) => {
            // Cek apakah session belum expired
            if (sessionData.expiresAt > now) {
                map.set(username, sessionData);
                validCount++;
            } else {
                console.log(`[SESSION] 🗑️ Discarding expired session for ${username}`);
            }
        });
        
        console.log(`[SESSION] 📂 Loaded ${validCount} valid sessions from file`);
        return map;
        
    } catch (err) {
        console.error('[SESSION] ❌ Error loading persistent sessions:', err);
        // Backup file corrupt
        const backupPath = activeSessionsPath + '.backup-' + Date.now();
        fs.copyFileSync(activeSessionsPath, backupPath);
        
        // Return empty map
        return new Map();
    }
}

// Fungsi untuk save sessions ke file
function savePersistentSessions() {
    try {
        const sessionsObj = {};
        
        activeSessions.forEach((sessionData, username) => {
            sessionsObj[username] = sessionData;
        });
        
        // Buat directory jika belum ada
        const dir = path.dirname(activeSessionsPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(activeSessionsPath, JSON.stringify(sessionsObj, null, 2));
        
    } catch (err) {
        console.error('[SESSION] ❌ Error saving persistent sessions:', err);
    }
}

// Function untuk clean up session yang sudah expired
function cleanupExpiredSessions() {
    const now = Date.now();
    let removedCount = 0;
    
    activeSessions.forEach((session, username) => {
        if (session.expiresAt < now) {
            activeSessions.delete(username);
            removedCount++;
        }
    });
    
    if (removedCount > 0) {
        console.log(`[CLEANUP] 🗑️ Removed ${removedCount} expired sessions`);
        savePersistentSessions();
    }
}

function generateSessionId() {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
}

// Load sessions saat module di-load
activeSessions = loadPersistentSessions();

module.exports = {
    activeSessions,
    savePersistentSessions,
    cleanupExpiredSessions,
    generateSessionId,
    loadPersistentSessions
};