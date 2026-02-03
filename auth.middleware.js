// file: auth.middleware.js
const { activeSessions, savePersistentSessions } = require('./session-store.js');
const { getUsers } = require('./user-manager.js');

// Middleware requireAuth
function requireAuth(req, res, next) {
    const username = req.cookies.sessionUser;
    const clientSessionId = req.cookies.sessionId;
    
    if (!username || !clientSessionId) {
        return res.redirect("/login?msg=Silakan login terlebih dahulu");
    }
    
    // Cek di activeSessions
    const activeSession = activeSessions.get(username);
    
    if (!activeSession || activeSession.sessionId !== clientSessionId) {
        console.log(`[AUTH] Session invalid for ${username}, clearing`);
        
        // Hapus dari memory dan file
        activeSessions.delete(username);
        savePersistentSessions();
        
        res.clearCookie("sessionUser", { path: "/", expires: new Date(0) });
        res.clearCookie("sessionId", { path: "/", expires: new Date(0) });
        
        return res.redirect("/login?msg=Session tidak valid");
    }
    
    // Cek apakah session sudah expired
    if (Date.now() > activeSession.expiresAt) {
        console.log(`[AUTH] Session expired for ${username}`);
        
        activeSessions.delete(username);
        savePersistentSessions();
        
        res.clearCookie("sessionUser", { path: "/", expires: new Date(0) });
        res.clearCookie("sessionId", { path: "/", expires: new Date(0) });
        
        return res.redirect("/login?msg=Session expired, login ulang");
    }
    
    // Cek expired account di database
    const users = getUsers();
    const currentUser = users.find(u => u.username === username);
    
    if (!currentUser) {
        console.log(`[AUTH] User ${username} not found in DB`);
        activeSessions.delete(username);
        savePersistentSessions();
        
        res.clearCookie("sessionUser", { path: "/", expires: new Date(0) });
        res.clearCookie("sessionId", { path: "/", expires: new Date(0) });
        
        return res.redirect("/login?msg=User tidak ditemukan");
    }
    
    if (Date.now() > currentUser.expired) {
        console.log(`[AUTH] User ${username} account expired`);
        activeSessions.delete(username);
        savePersistentSessions();
        
        res.clearCookie("sessionUser", { path: "/", expires: new Date(0) });
        res.clearCookie("sessionId", { path: "/", expires: new Date(0) });
        
        return res.redirect("/login?msg=Akun expired, hubungi admin");
    }
    
    // Update last activity (auto-extend untuk remember me)
    if (activeSession.remember) {
        // Auto-extend session untuk remember me (tambah 7 hari setiap aktivitas)
        activeSession.expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
        activeSessions.set(username, activeSession);
        
        // Save perubahan ke file
        savePersistentSessions();
    }
    
    next();
}

module.exports = { requireAuth };