const http = require('http'); //importation du package http natif de node
const app = require('./app'); //importation de l'application express

// normalizePort renvoie un port valide, qu'il soit sous la forme d'un numéro ou d'une chaîne
const normalizePort = val => {
    const port = parseInt(val, 10);
  
    if (isNaN(port)) {
      return val;
    }
    if (port >= 0) {
      return port;
    }
    return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port); //on dit à l'application express sur quel port elle doit tourner

//errorHandler recherche les différentes erreurs et les gère de manière appropriée. 
//elle est ensuite enregistrée dans le serveur
const errorHandler = error => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges.');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use.');
        process.exit(1);
        break;
      default:
        throw error;
    }
};

//création du serveur http qui prend pour argument la fonction qui sera appelée à chaque requête reçue par le serveur
const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

//écoute du serveur des requêtes envoyées
server.listen(port);