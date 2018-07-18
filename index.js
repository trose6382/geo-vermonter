var fs = require('fs');
var http = require('http');
var mime = require('mime-types');
const $path = require('path');


var port = process.env.PORT || 5000;
http.createServer(function (request, response) {
  let contentType = 'text/plain';
  let data;
  let path = request.url;
  let file = '.' + decodeURIComponent(request.url);
  file = $path.resolve(file);
  let publicDir = $path.resolve('.');
  if (!file.startsWith(publicDir)) {
    data = "Error: you are not permitted to access that file.";
    response.statusCode = 403; // Forbidden
    console.log("User requested file '" + request.url + "' (not permitted)");
    file = null;
  } else if (path === '/') {
    file = 'index.html';
  }

  else if (path.indexOf('.') === -1) {
    file = 'index.html';
  }

  else {
    file = '.' + decodeURIComponent(request.url);
  }

  try {
    if (file) {
      console.log('Serving ' + file);
      data = fs.readFileSync(file);
      contentType = mime.lookup(file);
    }
  } catch (error) {
    console.log(error);

    data = "Error: " + error.toString();
    response.statusCode = 404;
  }

  response.setHeader('Content-Type', contentType + '; charset=utf-8');
  response.write(data);
  response.end();
}).listen(port);

console.log("Listening on port " + port);


