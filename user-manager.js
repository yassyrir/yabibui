// file: user-manager.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, "database", "user.json");

// ==================== USER MANAGEMENT ==================== //
function getUsers() {
    if (!fs.existsSync(filePath)) {
        console.log(`📁 File user.json tidak ditemukan, membuat baru...`);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const initialData = [];
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), "utf-8");
        return initialData;
    }
    
    try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        
        if (!fileContent.trim()) {
            console.log("⚠️ File user.json kosong, mengembalikan array kosong");
            return [];
        }
        
        const users = JSON.parse(fileContent);
        
        // Pastikan setiap user punya semua field yang diperlukan
        return users.map(user => ({
            username: user.username || '',
            key: user.key || '',
            expired: user.expired || Date.now() + (30 * 86400000),
            role: user.role || 'user',
            telegram_id: user.telegram_id || '',
            isLoggedIn: user.isLoggedIn || false,
            createdBy: user.createdBy || 'system',
            createdAt: user.createdAt || Date.now()
        }));
    } catch (err) {
        console.error("✗ Gagal membaca file user.json:", err);
        
        // Backup dan reset
        try {
            const backupPath = filePath + '.backup-' + Date.now();
            fs.copyFileSync(filePath, backupPath);
            console.log(`✓ Backup file corrupt dibuat: ${backupPath}`);
        } catch (backupErr) {
            console.error("✗ Gagal membuat backup:", backupErr);
        }
        
        const initialData = [];
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), "utf-8");
        console.log("✓ File user.json direset karena corrupt");
        
        return initialData;
    }
}

function saveUsers(users) {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // ✅ NORMALISASI DATA: tambahkan field default jika tidak ada
        const usersWithDefaults = users.map(user => {
            const validRoles = ['owner', 'admin', 'user'];
            const userRole = user.role && validRoles.includes(user.role.toLowerCase()) 
                ? user.role.toLowerCase() 
                : 'user';
            
            return {
                username: user.username || '',
                key: user.key || '',
                expired: user.expired || Date.now() + (30 * 86400000),
                role: userRole,
                telegram_id: user.telegram_id || '',
                isLoggedIn: user.isLoggedIn || false,
                createdBy: user.createdBy || 'system',
                createdAt: user.createdAt || Date.now()
            };
        });

        fs.writeFileSync(filePath, JSON.stringify(usersWithDefaults, null, 2), "utf-8");
        console.log("✅ Data user disimpan. Total:", usersWithDefaults.length);
        return true;
    } catch (err) {
        console.error("✗ Gagal menyimpan user:", err);
        return false;
    }
}

// ==================== ACCESS CONTROL ==================== //
function loadAkses() {
    const accessFile = path.join(__dirname, "database", "akses.json");
    
    if (!fs.existsSync(accessFile)) {
        const initData = {
            owners: [],
            akses: []  // Hanya untuk admin saja
        };
        fs.writeFileSync(accessFile, JSON.stringify(initData, null, 2));
        return initData;
    }

    // baca file
    let data = JSON.parse(fs.readFileSync(accessFile));

    // normalisasi - hapus field yang tidak diperlukan
    if (data.resellers) delete data.resellers;
    if (data.pts) delete data.pts;
    if (data.moderators) delete data.moderators;

    return data;
}

function saveAkses(data) {
    const accessFile = path.join(__dirname, "database", "akses.json");
    
    // Hanya simpan owners dan akses
    const cleanData = {
        owners: data.owners || [],
        akses: data.akses || []
    };
    fs.writeFileSync(accessFile, JSON.stringify(cleanData, null, 2));
}

function isOwner(id) {
    const data = loadAkses();
    return data.owners.includes(id.toString());
}

function isAuthorized(id) {
    const data = loadAkses();
    
    // Cek apakah ID ada di owners atau akses
    if (isOwner(id)) return true;
    
    // Cek di database user untuk role admin
    const users = getUsers();
    const user = users.find(u => u.telegram_id === id.toString());
    if (user && user.role === 'admin') return true;
    
    // Cek di file akses.json
    return data.akses.includes(id.toString());
}

module.exports = {
    getUsers,
    saveUsers,
    loadAkses,
    saveAkses,
    isOwner,
    isAuthorized
};