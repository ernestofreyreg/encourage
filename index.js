/*jslint node: true, unparam: true, nomen: true */

"use strict";

var
    apiUsersQuery,
    apiUsersCreate,
    apiAuthLogin,
    apiAuthLogout,

    serverApp,
    serverPort = 3000,
    serverIP = '127.0.0.1',
    mongoServerURL = 'mongodb://localhost:27017/encourage',

    express,
    dbf,
    uuid,
    mongoClient,
    bodyParser,
    app,
    server,

    loginUser,
    logoutUser,
    ensureAuthentication;


express = require('express');
bodyParser = require('body-parser');
uuid = require('node-uuid');
mongoClient = require('mongodb').MongoClient;
dbf = require('./mongofuncs')();

mongoClient.connect(mongoServerURL, function(err, db) {
    if (err) {
        console.log("Error conecting to DB server.");
        return;
    }

    console.log("Connected correctly to DB server");
    db.close();
});

app = express();
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));

ensureAuthentication = function (req, res, next) {
    mongoClient.connect(mongoServerURL, function (err, db) {
        if (err) {
            console.log("MONGODB Error: " + err.toString());
            return res.sendStatus(403);
        }

        dbf.findDocuments(db, "sessions", {'authToken': req.body.authToken}, function (err, docs) {
            if (err || docs.length === 0) {
                return res.sendStatus(403);
            }

            req.session = docs[0];
            next();
        });
    });
};

loginUser = function (db, userInfo, callback) {
    var
        authToken,
        sessionDoc;

    authToken = uuid.v4();
    sessionDoc = {
        'authToken': authToken,
        'username': userInfo.username
    };

    dbf.insertDocument(db, "sessions", sessionDoc, function (err, result) {
        if (err) {
            callback(err, null);
        }

        callback(null, sessionDoc);
    });
};

logoutUser = function (db, authToken, callback) {
    dbf.removeDocument(db, "sessions", {'authToken': authToken}, function (err, result) {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

apiUsersQuery = function (req, res) {
    var
        userName;

    userName = req.params.userName;

    mongoClient.connect(mongoServerURL, function (err, db) {
        if (err) {
            console.log("MONGODB Error: "+err.toString());
            return res.sendStatus(500);
        }

        var
            users;

        dbf.findDocuments(db, "users", {"username": userName}, function (err, docs) {
            if (err) {
                return res.sendStatus(500);
            }

            if (docs.length === 0) {
                return res.sendStatus(404);
            }

            delete docs[0].password;
            console.log('User queried: '+docs[0].username);
            res.send({ 'user': docs[0] });

        });
    });
};

apiUsersCreate = function (req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }

    var
        userInfo;

    if (!req.body.hasOwnProperty('username')) {
        return res.sendStatus(400);
    }

    userInfo = req.body;

    mongoClient.connect(mongoServerURL, function (err, db) {
        if (err) {
            console.log("MONGODB Error: " + err.toString());
            return res.sendStatus(500);
        }

        var
            users;

        dbf.findDocuments(db, "users", {"username": userInfo.username}, function (err, docs) {
            if (err) {
                return res.sendStatus(500);
            }

            if (docs.length > 0) {
                return res.sendStatus(409);
            }

            dbf.insertDocument(db, "users", userInfo, function (err, result) {
                if (err) {
                    return res.sendStatus(500);
                }

                loginUser(db, userInfo, function(err, sessionDoc) {
                    if (err) {
                        return res.sendStatus(403);
                    }

                    console.log('User registered: ' + sessionDoc.username);
                    return res.status(200).send(sessionDoc);
                });
            });
        });
    });
};

apiAuthLogin = function (req, res) {
    mongoClient.connect(mongoServerURL, function (err, db) {
        if (err) {
            console.log("MONGODB Error: " + err.toString());
            return res.sendStatus(500);
        }

        dbf.findDocuments(db, "users", {"username": req.body.username}, function (err, docs) {
            if (err) {
                return res.sendStatus(500);
            }

            if (docs.length === 0) {
                return res.sendStatus(404);
            }

            loginUser(db, docs[0], function(err, sessionDoc) {
                if (err) {
                    return res.sendStatus(403);
                }

                console.log('User logged in: ' + sessionDoc.username);
                return res.status(200).send(sessionDoc);
            });
        });
    });
};

apiAuthLogout = function (req, res) {
    mongoClient.connect(mongoServerURL, function (err, db) {
        if (err) {
            console.log("MONGODB Error: " + err.toString());
            return res.sendStatus(500);
        }

        logoutUser(db, req.body.authToken, function(err, result) {
            if (err) {
                return res.sendStatus(403);
            }

            console.log('User logged out');
            return res.sendStatus(200);
        });
    });
};


app.get('/api/users/:userName', apiUsersQuery);
app.post('/api/users', apiUsersCreate);
app.post('/api/auth/login', apiAuthLogin);
app.post('/api/auth/logout', apiAuthLogout);

serverApp = function () {
    var
        host,
        port;

    port = server.address().port;
    host = server.address().address;
    console.log('Encourage server listening at http://%s:%s', host, port);
};

server = app.listen(serverPort, serverIP, serverApp);

module.exports = server;