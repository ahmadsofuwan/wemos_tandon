require('dotenv').config();
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;
let stop = 10;
let start = 30;
let nowlevel = 0;
let stopNow = false;
let startNow = false;

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  
 
  //main endpoint
  if (req.method === 'GET' && pathname === '/') {
    if(query.level){
        const level = query.level;
        nowlevel = parseInt(level) ? parseInt(level) : 0;
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
     start = query.start;
     stop = query.stop;
    
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
    let response = {
        status: startNow,
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }
  // 404 untuk route lain
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
