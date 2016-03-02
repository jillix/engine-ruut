var Ruut = require('ruut');
var libob = require('libobject');

exports.init = function (config, ready) {

    if (!config.home) {
        return ready(new Error('Flow-router.init: No default event event.'));
    }

    if (!config.routes) {
        return ready(new Error('Flow-router.init: No routes in config.'));
    }

    this.router = Ruut([config.home, config.routes]);

    if (global.addEventListener) {
        global.addEventListener("popstate", function () {
            console.log(arguments);
            //checkRoute.bind(self, null));
        });
    }

    ready();
};

exports.route = function (chain, options, onError) {
    libob.change(options._, options);

    var route = options.url || options._.url;
    route = this.router(route);

    if (route === null) {
        route = {data: options.notDefined || this._config.notDefined || 'notFound'};
    }

    if (!route.data) {
        return chain.o.emit('error', new Error('Engine-ruut.route: No event found.'));
    }

    options.params = route.params || {};

    // update history if url is different
    if (global.location && options.url !== global.location.pathname) {
        global.history.pushState(0, 0, options.url);
    }

    // create event stream and pipe it to the flow chain
    route = this.flow(route.data, options);
    route.o.on('error', onError);
    chain.i.pipe(route.i);
    route.o.pipe(chain.o);
};
