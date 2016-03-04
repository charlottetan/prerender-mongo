prerender-node-mongo
=======================

Express [npm plugin](https://www.npmjs.com/package/prerender-node-mongo) for MongoDB caching, to be used with the [prerender-node](https://github.com/prerender/prerender-node) middleware for [prerender](https://github.com/prerender/prerender)

This was inspired by [prerender-mongo](https://github.com/dottodot/prerender-mongo) and modified to work with Express apps. This also works with [Meteor](https://www.meteor.com).

How it works
------------

This plugin will store prerendered pages into a MongoDB database.

Default values:

    mongoUri: mongodb://localhost/prerender // prerender being the database name
    ttl: 86400 // pages will be cached for 1 day
    collection: pages

How to use
----------

In your local Express app run:

    $ npm install prerender-node-mongo --save

Then in your app's `server.js`:

    // set up prerender-node
    let PrerenderNode = require('prerender-node');

    // set up prerender-node-mongo
    let PrerenderNodeMongo = require('prerender-node-mongo');

    // hook up the cache
    PrerenderNode.set('beforeRender', PrerenderNodeMongo.beforeRender);
    PrerenderNode.set('afterRender', PrerenderNodeMongo.afterRender);

    app.use(PrerenderNodeMongo);
    app.use(PrerenderNode);

A custom mongo url can be set using env variables `MONGOLAB_URI` or `MONGOHQ_URL`.

To change the page expiration use env variable `PAGE_TTL`.

How to update stored cache
--------------------------

Change the HTTP `GET` method to `POST` or `PUT` and prerender will re-cache it.
