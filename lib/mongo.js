var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/prerender',
  ttl = process.env.PAGE_TTL || 86400;

var database;

function getDb() {
  if (database) {
    return database;
  }

  MongoClient.connect(mongoUri, function(err, db) {
    db.collection("pages", function(er, collection) {
      collection.dropIndex({
        "createdAt": 1
      });
      collection.createIndex({
        "createdAt": 1
      }, {
        expireAfterSeconds: ttl
      });
    });

    database = db;
  });

  return database;
}

module.exports = {
  setMongoUri: function(uri) {
    if (database) {
      console.err('setMongoUri needs to be called before the database connection is made');
      return;
    }

    mongoUri = uri;
  },

  beforeRender: function(req, done) {
    console.log('prerender-node-mongo: beforeRender for ' + req.url);
    if (req.method !== 'GET') {
      return done();
    }

    getDb().collection('pages', function(err, collection) {
      collection.findOne({
        key: req.url
      }, function(err, item) {
        if (!err && item) {
          var value = item ? item.value : null;
          console.log('prerender-node-mongo: found item in cache');
          return done(err, value);
        }

        return done(err);
      });
    });
  },

  afterRender: function(err, req, prerender_res) {
    console.log('prerender-node-mongo: afterRender for ' + req.url);

    if (prerender_res.statusCode === 200) {
      console.log('prerender-node-mongo: adding prerender result to cache');
      getDb().collection('pages', function(err, collection) {
        var object = {
          key: req.url,
          value: prerender_res.body,
          createdAt: new Date()
        };
        collection.update({
          key: req.url
        }, object, {
          upsert: true
        }, function(err) {
          if (err) {
            console.warn(err);
          }
        });
      });
    }
  }
};
