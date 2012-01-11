# A shared white board

### About

This is a express.js app with socket.io plugin. 

Currently, the server only acts as a message broadcaster, i.e. it receives a message from the client and sends it out to all other clients.

### Client API
The com.js library provides for an abstraction over the internal messaging API. 

It has one method 'sendDrawMsg' to send data from the client. To receive data you must implement matisse.onDrawEvent.

See the views/index.jade for example written in [http://jade-lang.com/](jade) templating engine.

See index.html in this directory for a vanilla html example.

### How to Run this app?
1) To run this application you need to install [http://nodejs.org](node.js) and 
   also install npm. 
   And then - npm install socket.io
   for windows redis exe https://github.com/dmajkic/redis/downloads
1a) sudo apt-get install redis-server
1b) npm install hiredis redis 
1c) npm install nohm

2) Change the "localhost" to your local machine ip in public/javascripts/com.js. 
Code snippet:

var socket = io.connect('http://localhost'); //change it to server ip or local ip for testing from other machines

3) Then you can run 

>
> $ node app.js
>

in the checked folder.

Then go to the browser and open http://localhost:8000/ for the jade template page or http://localhost:8000/html for the HTML page.
