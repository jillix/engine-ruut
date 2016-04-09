var Ruut = require('ruut');
var libob = require('libobject');

exports.init = function (config, ready) {

    if (!config.routes || !config.routes[0]) {
        return ready(new Error('Flow-router.init: No routes in config.'));
    }

    this.router = Ruut(config.routes);

    ready();
};

exports.route = function (options, data, next) {

    var route  = options.url || options._.url || (data ? (data.req ? data.req.url : data.url || data) : '/');

    route = this.router(typeof route !== 'string' ? '/' : route);
    if (route === null) {
        route = {data: options.notDefined || this._config.notDefined || 'notFound'};
    }

    if (!route.data) {
        return next(new Error('Engine-ruut.route: No event found.'));
    }

    if (typeof data !== 'object') {
        data = {};
    }
    data.params = route.params || {};

    // write to event stream
    this.flow(route.data, options).write(data);

    next(null, data);
};
