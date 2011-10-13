#!/usr/bin/env node

const https = require('https');

var people = [
  'lloyd',
  'stomlinson',
  'benadida'
];

var auth = process.env.AUTH;

if (typeof auth !== 'string') {
  console.log("oops.  define env var AUTH with '<github uname>:<github pass>'");
  process.exit(1);
}

https.get({
  host: 'api.github.com',
  port: 443,
  path: '/repos/mozilla/browserid/issues?per_page=100&assignee=none'
}, function(res) {
  var body = "";
  res.on('data', function(chunk) {
    body += chunk;
  }); 
  res.on('end', function() {
    processIssues(body);
  }); 
}).on('error', function(e) {
  console.log("Got error: " + e.message);
  process.exit(1);
});

function processIssues(json) {
  var issues = JSON.parse(json);
  var num = 0;
  issues.forEach(function(i) {
    if (!i.assignee) assignIssueTo(i.number, people[num++ % people.length]);
  });
}

function assignIssueTo(number, person) {
  var options = {
    host: 'api.github.com',
    port: 443,
    path: '/repos/mozilla/browserid/issues/' + number,
    method: 'POST'
  };

  var req = https.request(options, function(res) {
    console.log("assign issue", number, "to", person, "-", res.statusCode);
    res.setEncoding('utf8');
  });
  var content = JSON.stringify({assignee:person});
  req.setHeader('content-length', content.length);
  req.setHeader('Authorization', "Basic " + new Buffer(auth, 'utf8').toString('base64'));
  req.write(content);
  req.end();
}
