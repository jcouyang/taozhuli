// app.js
var connect = require('connect');
function routes(app) {
  app.get('/', function(req, res, params) { 
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Hello World');
  });
}
var server = connect.createServer(
     connect.router(routes)
);
server.listen(3000);
