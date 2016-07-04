var Ruut = require('ruut');
var libob = require('libobject');

/**
 *  Initilizes module
 *
 *  @name init
 *  @private
 */
exports.init = function (config, ready) {
    var self = this;

    if (!config.routers || !libob.isObject(config.routers) || !Object.keys(config.routers).length) {
        return ready(new Error('Flow-router.init: No routes in config.'));
    }

    // init the routers
    self._routers = {};
    Object.keys(config.routers).forEach(function (router) {
        self._routers[router] = Ruut(config.routers[router]);
    });

    ready();
};

/**
 * Check if url path exist and emit flow event configured
 *
 * @name route
 * @function
 * @param {Object} options Object containig route options (can also be added in the data object)
 *
 *  - `url` (String):  The url that will be checked (required).
 *  - `router` (String):  The name of the configured router that will be used to check the url. Default value can be configured (optional).
 *  - `notDefined` (String):  What event to emit if route is not configured. Default value can be configured. (optional).
 *  - `end` (Boolean):  End stream after event is emited (optional).
 * @param {Object} data Object containig the route data
 * @param {Function} next The next function.
 */
exports.route = function (_options, data, next) {
    var self = this;

    // define options
    var options = {
        url: data.url || _options._.url || _options.url || (data.req ? data.req.url : '/'),
        router: data.router || _options._.router || self._config.defaultRouter || 'main',
        notDefined: data.notDefined || _options._.notDefined || self._config.notDefined || 'notFound',
        end: data.end || _options._.end || false
    };

    // remove querystring from url
    options.url = options.url.split(/[?#]/)[0];

    // specified router must exist;
    if (!self._routers[options.router]) {
        return next(new Error('Flow-router.route: Router "' + options.router + '" does not exist.'));
    }

    var route = self._routers[options.router](typeof options.url === 'string' ? options.url : '/');

    // 404
    if (route === null) {
        route = { data: options.notDefined };
    }

    if (!route.data) {
        return next(new Error('Engine-ruut.route: No event found.'));
    }

    if (typeof data !== 'object') {
        data = {};
    }
    data.params = route.params || {};

    // create stream
    var stream = self.flow(route.data, _options);

    // write data chunk or end with data chunk
    if (options.end) {
        stream.end(data);
    } else {
        stream.write(data);
    }

    next(null, data);
};
