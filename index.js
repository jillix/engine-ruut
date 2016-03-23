var Ruut = require('ruut');
var libob = require('libobject');

exports.init = function (config, ready) {

    if (!config.routes || !config.routes[0]) {
        return ready(new Error('Flow-router.init: No routes in config.'));
    }

    this.router = Ruut(config.routes);

    if (global.addEventListener) {
        global.addEventListener("popstate", function () {
            console.log(arguments);
            //checkRoute.bind(self, null));
        });
    }

    ready();
};

exports.route = function (options, stream) {
    libob.change(options._, options);

    var route = options.url = options.url || options._.url || (global.location ? global.location.pathname : '/');
    route = this.router(route);

    if (route === null) {
        route = {data: options.notDefined || this._config.notDefined || 'notFound'};
    }

    if (!route.data) {
        return stream.emit('error', new Error('Engine-ruut.route: No event found.'));
    }

    options.params = route.params || {};

    // update history if url is different
    if (global.location && options.url !== global.location.pathname) {
        global.history.pushState(0, 0, options.url);
    }

    // create event stream and pipe it to the flow chain
    route = this.flow(route.data, options);
    route.end();
    //return route;
};
