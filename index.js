var Ruut = require('ruut');

exports.init = function (config, ready) {

    if (!config.home) {
        return ready(new Error('Flow-router.init: No default event event.'));
    }

    if (!config.routes) {
        return ready(new Error('Flow-router.init: No routes in config.'));
    }

    this.router = Ruut([config.home, config.routes]);

    ready();
};

exports.route = function (chain, options, onError) {

    var route = this.router(options.req.url); 

    if (route === null) {
        route = {data: options.notFound || this._config.notFound || 'notFound'};
    }

    if (!route.data) {
        return chain.o.emit('error', new Error('Engine-ruut.route: No event found.'));
    }

    options.params = route.params || {};

    // create event stream and pipe it to the flow chain
    route = this.flow(route.data, options);
    route.o.on('error', onError);
    chain.i.pipe(route.i);
    route.o.pipe(chain.o);
};
