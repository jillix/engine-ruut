var Ruut = require('ruut');
var libob = require('libobject');

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
