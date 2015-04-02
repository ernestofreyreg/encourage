/*jslint node: true, unparam: true, nomen: true */

"use strict";

module.exports = function () {
    var
        findDocuments,
        insertDocument,
        removeDocument;

    findDocuments = function (db, name, condition, callback) {
        var
            collection;

        collection = db.collection(name);
        collection.find(condition).toArray(callback);
    };

    insertDocument = function (db, name, doc, callback) {
        var
            collection;

        collection = db.collection(name);
        collection.insertOne(doc, callback);
    };

    removeDocument = function (db, name, doc, callback) {
        var
            collection;

        collection = db.collection(name);
        collection.removeOne(doc, callback);
    };

    return {
        'findDocuments': findDocuments,
        'insertDocument': insertDocument,
        'removeDocument': removeDocument
    };
};

