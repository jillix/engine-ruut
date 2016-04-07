var Ruut = require('ruut');
var libob = require('libobject');

exports.init = function (config, ready) {

    if (!config.routes || !config.routes[0]) {
        return ready(new Error('Flow-router.init: No routes in config.'));
    }

    this.router = Ruut(config.routes);

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

    // create event stream and pipe it to the flow chain
    return this.flow(route.data, options);
};
