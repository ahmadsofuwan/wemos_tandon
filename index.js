require('dotenv').config();
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const LOG_FILE = path.join(__dirname, 'history.json');

// Default Values
let stop = 10;
let start = 30;
let nowlevel = 0;
let stopNow = false;
let startNow = false;

// Load Settings from File (Persistence)
if (fs.existsSync(SETTINGS_FILE)) {
    try {
        const saved = JSON.parse(fs.readFileSync(SETTINGS_FILE));
        stop = saved.stop || stop;
        start = saved.start || start;
        console.log(`[SYSTEM] Settings loaded: Stop@${stop}, Start@${start}`);
    } catch (e) {
        console.error("[SYSTEM] Failed to parse settings.json");
    }
}

function saveSettings() {
    const data = { stop, start };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

function logData(level) {
    const logEntry = {
        time: new Date().toISOString(),
        level: level
    };
    // Simpan history dalam format line-by-line JSON agar efisien
    fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + "\n");
}

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  
 
  //main endpoint
  if (req.method === 'GET' && pathname === '/') {
    if(query.level){
        const level = parseInt(query.level) || 0;
        nowlevel = level;
        
        logData(nowlevel); // Simpan ke file history.json
        
        let action = "NORMAL";

        if(level < stop){
          stopNow = true;
          startNow = false;
          action = "STOP PUMP (Tandon Penuh)";
        }

        if(level > start){
          startNow = true;
          stopNow = false;
          action = "START PUMP (Tandon Kosong)";
        }

        console.log(`[${new Date().toLocaleTimeString()}] Level Diterima: ${nowlevel} | Status: ${action}`);
    }
    let response = {
        stop: stop,
        start: start
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  //check status
  if (req.method === 'GET' && pathname === '/status') {
    let response = {
        start: start,
        stop: stop,
        level: nowlevel
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  //setting level
  if (req.method === 'GET' && pathname === '/setlevel') {
     start = parseInt(query.start) || start;
     stop = parseInt(query.stop) || stop;
     
     saveSettings(); // Simpan permanen ke settings.json
    
     let response = {
         start: start,
         stop: stop,
         level: nowlevel
     }
     res.writeHead(200, { 'Content-Type': 'application/json' });
     res.end(JSON.stringify(response));
     return;
  }

  //check stop status
  if (req.method === 'GET' && pathname === '/stop') {
    let response = {
        status: stopNow,
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  //check start status
  if (req.method === 'GET' && pathname === '/start') {
    let response = {
        status: startNow,
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  //matikan pada saat ini
  if (req.method === 'GET' && pathname === '/setstop') {
    stopNow = query.status ? query.status:false;
    if(stopNow){
        startNow = false;
    }

    let response = {
        status: stopNow,
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  //hidupkan pada saat ini
  if (req.method === 'GET' && pathname === '/setstart') {
    startNow = query.status ? query.status:false;
    if(startNow){
        stopNow = false;
    }
    let response = {
        status: startNow,
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }
  // Dashboard Interface (Melayani file HTML terpisah)
  if (req.method === 'GET' && pathname === '/dashboard') {
    const filePath = path.join(__dirname, 'views', 'dashboard.html');
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to load dashboard view' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }

  // 404 untuk route lain
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
