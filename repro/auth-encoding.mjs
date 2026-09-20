import http from 'http';
import axios from '../lib/axios.js';

const expected = (s) => 'Basic ' + Buffer.from(s, 'utf8').toString('base64');

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.setHeader('content-type', 'text/plain');
      res.end(req.headers.authorization || '(none)');
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const server = await startServer();
const port = server.address().port;
const base = `http://127.0.0.1:${port}/`;
const userinfoBase = `http://%E7%94%A8%E6%88%B7:pw@127.0.0.1:${port}/`;

async function tryReq(label, opts, adapter, url = base) {
  try {
    const r = await axios.get(url, { ...opts, adapter, timeout: 4000 });
    console.log(label + '\n   => OK serverSaw=' + JSON.stringify(r.data));
  } catch (e) {
    console.log(label + '\n   => ERR code=' + e.code + ' name=' + e.name + ' msg=' + JSON.stringify(e.message));
  }
}

console.log('expected base64(utf8(用户:pw))   =', expected('用户:pw'));
console.log('expected base64(utf8(user:口令)) =', expected('user:口令'));
console.log('---- non-Latin1 USERNAME via config.auth ----');
await tryReq('[http ] config.auth {username:用户,password:pw}', { auth: { username: '用户', password: 'pw' } }, 'http');
await tryReq('[fetch] config.auth {username:用户,password:pw}', { auth: { username: '用户', password: 'pw' } }, 'fetch');
console.log('---- non-Latin1 PASSWORD via config.auth ----');
await tryReq('[http ] config.auth {username:user,password:口令}', { auth: { username: 'user', password: '口令' } }, 'http');
await tryReq('[fetch] config.auth {username:user,password:口令}', { auth: { username: 'user', password: '口令' } }, 'fetch');
console.log('---- non-Latin1 USERNAME via URL userinfo ----');
await tryReq('[http ] URL userinfo 用户:pw', {}, 'http', userinfoBase);
await tryReq('[fetch] URL userinfo 用户:pw', {}, 'fetch', userinfoBase);

server.close();
