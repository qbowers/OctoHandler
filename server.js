const express = require('express'),
      app = express(),
      http = require('http'),
      server = http.Server(app),
      upload = require('multer')(),

      io = require('socket.io')(server),

      scss = require('node-sass-middleware'),

      yaml = require('yamljs'),

      template = require('./utils/template.js')('public', app),
      serial = require('./utils/serial.js'),
      ip = require('./utils/ip.js'),
      system = require('./utils/system.js');




if (process.argv[2] && process.argv[2] == 'testweb') {
  console.log('testweb mode');
  system.testweb(true);
}


//load config file
config = yaml.load('config.yaml');

for (var i = 0; i < config.OctoPrints.length; i++) new system.OctoPrint(config.OctoPrints[i]);
for (var i = 0; i < config.Profiles.length; i++) new system.Profile(config.Profiles[i]);
for (var i = 0; i < config.Printers.length; i++) new system.Printer(config.Printers[i]);

//GODDAMN ASYNCHRONOUS FUNCTIONS
serial.refresh(system.testweb())
.then(() => {
  //if there are more ports than servers, throw an error
  //if (serial.length > system.OctoPrints.length) console.log('too many serial devices');

  //connect each server to a port
  for (var i = 0; i < serial.length; i++) {
    system.OctoPrints[i].disconnect();
    system.OctoPrints[i].connect( serial[i] );
  }
});







app.use(scss({
    src: __dirname + '/public/style/scss',
    dest: __dirname + '/public/style',
    prefix: '/style',
    outputStyle: 'compressed'
}));
app.use(upload.any());






//set up
app.get('/setup', (req, res) => {
  res.render('setup.html', {
    ready: system.ready(),
    local: true,

    Printers: system.Printers,
    OctoPrints: system.OctoPrints
  });
});

app.get('/setup/options/:server', (req, res) => {
  var octoprint = system.OctoPrints[req.params.server];
  var options = [];
  for (var i = 0; i < system.Printers.length; i++) {
    var printer = system.Printers[i];
    if (printer.match(octoprint)) options.push(printer.name)
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(options);
});


app.post('/setup/set', (req, res) => {
  //determine printer from printername

  var printer,
      octoprint = system.OctoPrints[parseInt(req.body.octoprint)];
  for (var i = 0; i < system.Printers.length; i++) if(system.Printers[i].name == req.body.printer) printer = system.Printers[i];


  octoprint.wiggle.stop();
  printer.attach(octoprint);



  var ready = true;
  for (var i = 0; i < serial.length && i < system.OctoPrints.length; i++) {
    if (!system.OctoPrints[i].Printer) {
      ready = false;
      break;
    }
  }

  if (ready) {
    system.ready(true);
    res.status(200);
  } else res.status(204);

  res.end();
});

app.post('/setup/wiggle', (req, res) => {
  console.log('octoprint wiggled!');
  var octoprint = system.OctoPrints[req.body.octoprint];
  octoprint.wiggle.setTime(5);



  res.status(204);
  res.end();
});




//redirect to setup
app.use((req, res, next) => {
  if ( system.ready() || req.path.includes('.js') || req.path.includes('.css') ) next();
  else {
    res.writeHead((req.method === 'GET') ? 302 : 310, {'Location': '/setup'});
    res.end();
  }
});








//index
app.get('/', (req, res) => {
  res.render('index.html', {
    Printers: system.Printers,
    OctoPrints: system.OctoPrints
  });
});


app.use(express.static(__dirname + '/public'));




server.listen((system.testweb()) ? 8000:80, '0.0.0.0', () => {
  console.log('----Server Created----');
  console.log('IP-host: ' + ip.address);
  console.log('server-port: ' + ((system.testweb()) ? 8000:80));
});
