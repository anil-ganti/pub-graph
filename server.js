// MEAN Stack RESTful API Tutorial - Contact List App

var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var db = mongoose.connect('mongodb://localhost/test');

var sessionSchema = mongoose.Schema({
  id: Number,
  nodes: Array
});
var Session = mongoose.model('Session', sessionSchema)

var documentSchema = mongoose.Schema({
  id: Number,
  citations: Number
})
var Document = mongoose.model('Document', documentSchema)

var referenceSchema = mongoose.Schema({
  target: Number,
  source: Number
});

var Reference = mongoose.model('Reference', referenceSchema)

var bodyParser = require('body-parser');
var axios = require('axios');

var ieee = axios.create({
  baseURL: 'http://ieeexplore.ieee.org/rest/',
  timeout: 3000,
  headers: {'Referer': 'ieeexplore.ieee.org'}
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

//TODO: When to use params vs query?
app.get('/citations', function(req, res) {
  console.log(req.query)
  var doc = req.query.document;
  //var count = req.params.max
  ieee.get('document/' + doc +'/citations?count=10')
  .then(function(response) {
    console.log(response.data.paperCitations.ieee);
  })
});

app.get('/session', function(req, res) {
  var session_id = req.query.id
  console.log(session_id)
  response = {}
  Session.findOne({id: session_id},function(err, session) {
    if (err) return console.error(err);
  })
  .then(function(session) {
    console.log(session);
    return Document.find({id: {$in: session.nodes}});
  })
  .then(function(nodes) {
    response.nodes = nodes
    console.log(nodes)
    node_ids = nodes.map(function(x) { return x.id })
    return Reference.find({source: {$in: node_ids}, target: {$in: node_ids}}, function(err, refs) {
      if (err) return console.error(err);
    })
  })
  .then(function(refs) {
    response.refs = refs;
    res.json(response)  
  });
});

app.post('/contactlist', function (req, res) {
  console.log(req.body);
  db.contactlist.insert(req.body, function(err, doc) {
    res.json(doc);
  });
});

app.delete('/contactlist/:id', function (req, res) {
  var id = req.params.id;
  console.log(id);
  db.contactlist.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
    res.json(doc);
  });
});

app.get('/contactlist/:id', function (req, res) {
  var id = req.params.id;
  console.log(id);
  db.contactlist.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
    res.json(doc);
  });
});

app.put('/contactlist/:id', function (req, res) {
  var id = req.params.id;
  console.log(req.body.name);
  db.contactlist.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: {$set: {name: req.body.name, email: req.body.email, number: req.body.number}},
    new: true}, function (err, doc) {
      res.json(doc);
    }
  );
});

app.listen(3000);
console.log("Server running on port 3000");
