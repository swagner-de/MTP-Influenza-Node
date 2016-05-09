'use strict';

const restify = require('restify');
const bunyan  = require('bunyan');
const routes  = require('./routes/');
const config  = require('config');

const log = bunyan.createLogger({
    name        : 'logger',
    level       : config.get('log_level'),
    streams: [
        {
            stream: process.stdout,
            level: 'debug'
        },
        {
            path: 'restify.log',
            level: 'trace'
        }
    ],
    serializers : bunyan.stdSerializers
});

const server = restify.createServer({
    name : config.get('Server.name')|| 'MTP',
    log  : log
});



server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser());
server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
});
server.use(restify.gzipResponse());
server.pre(restify.pre.sanitizePath());


server.on('after', restify.auditLogger({ log: log }));

routes(server);

log.info('Server started.');
server.listen(config.get('Server.port'), function () {
    log.info('%s listening at %s', server.name, server.url);
});