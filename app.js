
/**
 * Module dependencies.
 */

var express = require('express')
, Resource = require('express-resource')
  , routes = require('./routes')

var app = module.exports = express.createServer()
	, io = require('socket.io').listen(app);
	

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

app.get('/html', function (req, res) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i=0; i<string_length; i++) {
	var rnum = Math.floor(Math.random() * chars.length);
	randomstring += chars.substring(rnum,rnum+1);
    }
    res.writeHead(302, {
	'Location': randomstring
    });
    res.end();
});

app.resource({
    show: function(req, res){
      	res.sendfile(__dirname + '/index.html');
    }
});

app.listen(8000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

io.sockets.on('connection', function (socket) {
//    console.log("====================");
//    console.log(socket);
//    console.log("====================");
    socket.emit('eventConnect',{message:'welcome'});
    socket.on("setUrl",function(location,data){
//	console.log("++++++++------------");
//	console.log(location);
//	console.log("++++++++-----------");
	var url = location.pathname.replace("/", "");
//	console.log("++++++++++++++++++++");
//	console.log(url);
//	console.log("++++++++++++++++++++");
//	console.log("----------------------");
//	console.log(data);
//	console.log("----------------------");

	socket.join(url);
    });

    socket.on('eventDraw',function(location,data){
//	console.log("@@@@@@@@@@@@@@@@@@@@@");
//	console.log(location);
	var url = location.pathname.replace("/", "");
//	console.log(url);
//	console.log("@@@@@@@@@@@@@@@@@@@@@");
//	console.log("%%%%%%%%%%%%%%%%%%%%%");
//	console.log(data);
//	console.log("%%%%%%%%%%%%%%%%%%%%%");
	io.sockets.in(url).emit("eventDraw",data);
    });
});

//io.sockets.on('connection', function (socket) {
//  socket.emit('eventConnect',{message:'welcome'});
  //socket.on('eventDraw',function(data){
//      socket.join();
//        socket.broadcast.emit("eventDraw",data);
//  });
//});

