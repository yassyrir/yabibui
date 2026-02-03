// file: tools.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Tambahkan axios

const { requireAuth } = require('./auth.middleware.js');

// ==================== TOOLS ROUTES ==================== //

// Helper function
function serveToolPage(res, filename, toolName) {
    const filePath = path.join(__dirname, "!─☇𝐒𝐢𝐗", "tools", filename);
    
    if (fs.existsSync(filePath)) {
        fs.readFile(filePath, "utf8", (err, html) => {
            if (err) {
                console.error(`❌ Error loading ${toolName}:`, err);
                sendFallback(res, toolName);
            } else {
                res.send(html);
            }
        });
    } else {
        sendFallback(res, toolName);
    }
}

function sendFallback(res, toolName) {
    res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${toolName} - Indictive Core</title>
                <style>
                    body { background:#080310; color:white; font-family:'Share Tech Mono',monospace; padding:20px; }
                    .container { max-width:600px; margin:100px auto; text-align:center; }
                    h1 { color:#db2777; margin-bottom:20px; }
                    .status { background:#1a0b2e; padding:20px; border-radius:10px; border:1px solid #db2777; margin:20px 0; }
                    .back-btn { display:inline-block; background:#db2777; color:white; padding:10px 20px; border-radius:5px; text-decoration:none; margin-top:20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 ${toolName}</h1>
                    <div class="status">
                        <h3>🛠️ Tool dalam Pengembangan</h3>
                        <p>Tool ini akan segera hadir di update berikutnya.</p>
                        <p><em>Stay tuned!</em></p>
                    </div>
                    <a href="/dashboard" class="back-btn">← Kembali ke Dashboard</a>
                </div>
            </body>
            </html>
    `);
}

// ============================================
// USER TRACKING SYSTEM (Pindahkan ke atas sebelum digunakan)
// ============================================
const userTracking = {
  requests: new Map(),
  targets: new Map(),
  
  resetDaily() {
    this.requests.clear();
    this.targets.clear();
  },
  
  canUserSend(userId, count) {
    const today = new Date().toDateString();
    const key = `${userId}-${today}`;
    const current = this.requests.get(key) || 0;
    return current + count;
  },
  
  canTargetReceive(target, count) {
    const today = new Date().toDateString();
    const key = `${target}-${today}`;
    const current = this.targets.get(key) || 0;
    return current + count;
  },
  
  updateUser(userId, count) {
    const today = new Date().toDateString();
    const key = `${userId}-${today}`;
    const current = this.requests.get(key) || 0;
    this.requests.set(key, current + count);
  },
  
  updateTarget(target, count) {
    const today = new Date().toDateString();
    const key = `${target}-${today}`;
    const current = this.targets.get(key) || 0;
    this.targets.set(key, current + count);
  },
  
  getUserStats(userId) {
    const today = new Date().toDateString();
    const key = `${userId}-${today}`;
    return this.requests.get(key) || 0;
  },
  
  getTargetStats(target) {
    const today = new Date().toDateString();
    const key = `${target}-${today}`;
    return this.targets.get(key) || 0;
  }
};

// Reset daily at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    userTracking.resetDaily();
  }
}, 60000);

// ============================================
// FUNGSI NGL SPAM - UPDATED
// ============================================
async function nglSpam(target, message, count) {
  const logs = [];
  let success = 0;
  let errors = 0;

  const sendNGLMessage = async (target, message, attempt) => {
    const formData = new URLSearchParams();
    formData.append('username', target);
    formData.append('question', message);
    formData.append('deviceId', generateEnhancedUUID());
    formData.append('gameSlug', '');
    formData.append('referrer', '');
    formData.append('timestamp', Date.now().toString());

    if (attempt > 1) {
      const randomDelay = Math.floor(Math.random() * 4000) + 2000;
      await new Promise(resolve => setTimeout(resolve, randomDelay));
    }

    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    try {
      
      const response = await axios.post('https://ngl.link/api/submit', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': randomUserAgent,
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://ngl.link',
          'Referer': `https://ngl.link/${target}`,
          'X-Requested-With': 'XMLHttpRequest',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        },
        timeout: 15000,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      if (response.status === 200) {
        if (response.data && response.data.success !== false) {
          success++;
          logs.push(`[${attempt}/${count}] ✅ Berhasil dikirim ke ${target}`);
          return true;
        } else {
          errors++;
          logs.push(`[${attempt}/${count}] ⚠️ Response tidak valid: ${JSON.stringify(response.data)}`);
          return false;
        }
      } else if (response.status === 429) {
        errors++;
        logs.push(`[${attempt}/${count}] 🚫 Rate limited - tunggu beberapa saat`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        return false;
      } else {
        errors++;
        logs.push(`[${attempt}/${count}] ❌ HTTP ${response.status}: ${response.statusText}`);
        return false;
      }
    } catch (error) {
      errors++;
      console.error(`🔍 Error in attempt ${attempt}:`, error.message);
      
      if (error.response) {
        logs.push(`[${attempt}/${count}] ❌ HTTP ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        logs.push(`[${attempt}/${count}] ❌ Network Error: Tidak dapat terhubung ke server NGL`);
      } else {
        logs.push(`[${attempt}/${count}] ❌ Error: ${error.message}`);
      }
      
      return false;
    }
  };

  function generateEnhancedUUID() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `web-${timestamp}-${random}`;
  }

  if (!target || !message || count <= 0) {
    throw new Error('Input tidak valid');
  }

  if (count > 50) {
    throw new Error('Maksimal 50 pesan per request untuk menghindari detection');
  }

  logs.push(`🚀 Memulai spam ke: ${target}`);
  logs.push(`📝 Pesan: ${message}`);
  logs.push(`🔢 Jumlah: ${count} pesan`);
  logs.push(`⏳ Delay: 2-6 detik random antar pesan`);
  logs.push(`─`.repeat(40));

  for (let i = 0; i < count; i++) {
    const result = await sendNGLMessage(target, message, i + 1);
    
    if (i > 0 && i % 10 === 0) {
      logs.push(`⏸️  Istirahat sebentar setelah ${i} pesan...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  logs.push(`─`.repeat(40));
  logs.push(`📊 SELESAI! Sukses: ${success}, Gagal: ${errors}`);

  return { success, errors, logs };
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============ TikTok Downloader ============ \\
router.get("/tiktok-downloader", requireAuth, (req, res) => {
    serveToolPage(res, "tiktok-downloader.html", "TikTok Downloader");
});

// ============ Anime-station ============ \\
router.get("/anime", requireAuth, (req, res) => {
    serveToolPage(res, "anime.html", "Anime Play");
});

// ============ Music Search ============ \\
router.get("/search-music", requireAuth, (req, res) => {
    serveToolPage(res, "search-music.html", "TikTok Downloader");
});

// ============ Test Speed ============ \\
router.get("/test-speed", requireAuth, (req, res) => {
    serveToolPage(res, "test-speed.html", "Test Speed");
});

// ============ Nik Detail ============ \\
router.get("/nik-detail", requireAuth, (req, res) => {
    serveToolPage(res, "nik-detail.html", "NIK Detail");
});

// ============ Domain OSINT ============ \\
router.get("/domain-osint", requireAuth, (req, res) => {
    serveToolPage(res, "domain-osint.html", "DOMAIN OSINT");
});

// ============ Get Code ============ \\
router.get("/get-code", requireAuth, (req, res) => {
    serveToolPage(res, "get-code.html", "GET CODE");
});

// ============ iPhone IQC ============ \\
router.get("/iphone-iqc", requireAuth, (req, res) => {
    serveToolPage(res, "iphone-iqc.html", "IPHONE QUOTED");
});

// ============ Pinterest Downloader ============ \\
router.get("/pinterest-downloader", requireAuth, (req, res) => {
    serveToolPage(res, "pinterest-downloader.html", "PINTEREST");
});

// ============ Pinterest Downloader ============ \\
router.get("/spam-telegram", requireAuth, (req, res) => {
    serveToolPage(res, "spam-telegram.html", "SPAM TELEGRAM");
});

// ============ Spam NGL ============ \\
router.get("/ngl-spam", requireAuth, (req, res) => {
  const username = req.cookies.sessionUser;
  const formattedExp = "-";

  const userId = req.ip || req.headers['x-forwarded-for'] || username;
  const userUsageToday = userTracking.getUserStats(userId);
  const remainingUser = 200 - userUsageToday;
  const usagePercentage = (userUsageToday / 200) * 100;

  const filePath = path.join(__dirname, "!─☇𝐒𝐢𝐗", "tools", "spam-ngl.html");
  
  fs.readFile(filePath, "utf8", (err, html) => {
    if (err) {
      console.error("❌ Gagal membaca file spam-ngl.html:", err);
      return res.status(500).send("File tidak ditemukan");
    }

    let finalHtml = html
      .replace(/\${username}/g, username)
      .replace(/\${formattedExp}/g, formattedExp)
      .replace(/\${userUsageToday}/g, userUsageToday)
      .replace(/\${remainingUser}/g, remainingUser)
      .replace(/\${usagePercentage}/g, usagePercentage);
    
    res.send(finalHtml);
  });
});

// ============ API ENDPOINTS ============ //

// API NGL Stats
router.get("/api/ngl-stats", requireAuth, (req, res) => {
  const userId = req.ip || req.headers['x-forwarded-for'] || req.cookies.sessionUser || 'anonymous';
  
  res.json({
    userStats: {
      todayUsage: userTracking.getUserStats(userId),
      dailyLimit: 200,
      remaining: 200 - userTracking.getUserStats(userId)
    },
    resetTime: 'Midnight (00:00 WIB)',
    message: 'Statistik penggunaan hari ini'
  });
});

// API Target Stats
router.get("/api/ngl-target-stats/:target", requireAuth, (req, res) => {
  const { target } = req.params;
  
  res.json({
    target: target,
    todayReceived: userTracking.getTargetStats(target),
    dailyLimit: 100,
    remaining: 100 - userTracking.getTargetStats(target),
    resetTime: 'Midnight (00:00 WIB)'
  });
});

// API NGL Spam
router.post("/api/ngl-spam-js", requireAuth, async (req, res) => {
  const { target, message, count } = req.body;
  
  const userId = req.ip || req.headers['x-forwarded-for'] || req.cookies.sessionUser || 'anonymous';
  
  const limits = {
    maxPerRequest: 100,
    minDelay: 3000,
    maxDailyPerUser: 200,
    maxDailyPerTarget: 100
  };
  
  if (!target || !message || !count) {
    return res.status(400).json({ error: "Semua field harus diisi" });
  }

  if (count > limits.maxPerRequest) {
    return res.status(400).json({
      error: `❌ Untuk keamanan, maksimal ${limits.maxPerRequest} pesan per request`,
      currentCount: count,
      maxAllowed: limits.maxPerRequest
    });
  }

  if (count < 1) {
    return res.status(400).json({
      error: '❌ Jumlah pesan harus minimal 1'
    });
  }

  const userTotal = userTracking.canUserSend(userId, count);
  if (userTotal > limits.maxDailyPerUser) {
    const currentUsage = userTracking.getUserStats(userId);
    return res.status(429).json({
      error: '🚫 Limit harian tercapai!',
      message: `Kamu sudah kirim ${currentUsage} pesan hari ini. Limit: ${limits.maxDailyPerUser}/hari`,
      currentUsage: currentUsage,
      dailyLimit: limits.maxDailyPerUser,
      remaining: limits.maxDailyPerUser - currentUsage,
      resetTime: 'Midnight (00:00 WIB)'
    });
  }

  const targetTotal = userTracking.canTargetReceive(target, count);
  if (targetTotal > limits.maxDailyPerTarget) {
    const currentTargetUsage = userTracking.getTargetStats(target);
    return res.status(429).json({
      error: '🚫 Target sudah menerima terlalu banyak pesan!',
      message: `Target ${target} sudah terima ${currentTargetUsage} pesan hari ini. Limit: ${limits.maxDailyPerTarget}/hari`,
      currentTargetUsage: currentTargetUsage,
      targetDailyLimit: limits.maxDailyPerTarget,
      remaining: limits.maxDailyPerTarget - currentTargetUsage,
      resetTime: 'Midnight (00:00 WIB)'
    });
  }

  try {
    const result = await nglSpam(target, message, parseInt(count));
    
    userTracking.updateUser(userId, result.success);
    userTracking.updateTarget(target, result.success);
    
    res.json({
      ...result,
      stats: {
        userToday: userTracking.getUserStats(userId),
        userLimit: limits.maxDailyPerUser,
        targetToday: userTracking.getTargetStats(target),
        targetLimit: limits.maxDailyPerTarget,
        remaining: {
          user: limits.maxDailyPerUser - userTracking.getUserStats(userId),
          target: limits.maxDailyPerTarget - userTracking.getTargetStats(target)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ YouTube Downloader ============ \\
router.get("/youtube-downloader", requireAuth, (req, res) => {
    serveToolPage(res, "youtube-downloader.html", "YouTube Downloader");
});

// API YouTube Search
router.post('/api/youtube/search', requireAuth, async (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({
      error: "Query pencarian wajib diisi."
    });
  }

  try {
    const searchResponse = await axios.get(`https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(query)}`);
    
    if (searchResponse.data && searchResponse.data.data) {
      return res.json({
        success: true,
        results: searchResponse.data.data
      });
    } else {
      return res.status(404).json({
        error: "Tidak ada hasil ditemukan"
      });
    }
  } catch (error) {
    console.error('YouTube Search Error:', error);
    res.status(500).json({
      error: error.message || "Terjadi kesalahan saat mencari video"
    });
  }
});

// API YouTube Download
router.post('/api/youtube/download', requireAuth, async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      error: "URL video YouTube wajib diisi."
    });
  }

  try {
    const downloadResponse = await axios.get(`https://restapi-v2.simplebot.my.id/download/ytmp3?url=${encodeURIComponent(url)}`);
    
    if (downloadResponse.data && downloadResponse.data.result) {
      return res.json({
        success: true,
        audioUrl: downloadResponse.data.result
      });
    } else {
      return res.status(404).json({
        error: "Gagal mendapatkan URL download"
      });
    }
  } catch (error) {
    console.error('YouTube Download Error:', error);
    res.status(500).json({
      error: error.message || "Terjadi kesalahan saat mendownload audio"
    });
  }
});

// ============ NSFW Generator ============ \\
router.get("/nsfw-generator", requireAuth, (req, res) => {
  const filePath = path.join(__dirname, "!─☇𝐒𝐢𝐗", "tools", "nsfw-anime.html");
  res.sendFile(filePath);
});

router.get('/api/nsfw/random', requireAuth, async (req, res) => {
  try {
    const apiEndpoints = [
      'https://api.waifu.pics/nsfw/waifu',
      'https://api.waifu.pics/nsfw/neko',
      'https://api.waifu.pics/nsfw/blowjob',
      'https://nekos.life/api/v2/img/nsfw_neko_gif',
      'https://nekos.life/api/v2/img/lewd',
      'https://purrbot.site/api/img/nsfw/neko/gif'
    ];

    let imageUrl = null;
    let attempts = 0;

    for (const endpoint of apiEndpoints) {
      attempts++;
      try {
        const response = await axios.get(endpoint, { timeout: 10000 });
        
        if (response.data) {
          if (response.data.url) {
            imageUrl = response.data.url;
          } else if (response.data.image) {
            imageUrl = response.data.image;
          } else if (response.data.message) {
            imageUrl = response.data.message;
          } else if (response.data.result) {
            imageUrl = response.data.result;
          }
        }

        if (imageUrl) {
          break;
        }
      } catch (apiError) {
        console.log(`❌ API ${endpoint} gagal:`, apiError.message);
        continue;
      }
    }

    if (imageUrl) {
      return res.json({
        success: true,
        image: imageUrl
      });
    } else {
      return res.status(404).json({ 
        error: "Semua API tidak merespons. Coba lagi nanti." 
      });
    }

  } catch (error) {
    console.error('NSFW API Error:', error.message);
    res.status(500).json({ 
      error: "Gagal mengambil gambar. Server API sedang gangguan." 
    });
  }
});

module.exports = router;