var Ruut = require("./lib/ruut");

function emitRoute(route, data) {
    var self = this;
    var str = self._streams[route] || (self._streams[route] = self.flow(route));
    data = Object(data);
    Object.keys(self._config.customData).forEach(function (c) {
        data[c] = data[c] || self._config.customData[c];
    });
    str.write(null, data);
}

exports.init = function () {

    var self = this;
    var config = this._config;
    var streams = this._streams = {};

    this._originalRoutes = JSON.parse(JSON.stringify(config.routes));
    this._originalRouter = Ruut(this._originalRoutes);

    function handler(obj, key) {
        var res = obj[key];
        if (typeof res === "string") {
            obj[key] = function (params) {
                emitRoute.call(self, res, {
                    params: params
                });
                return true;
            };
        }
    }

    // Normalize the routes
    function normalize(parentObj, parentKey) {
        var route = parentObj[parentKey];
        if (route === null) { return; }

        if (Array.isArray(route)) {
            handler(route, 0);
            normalize(route, 1);
            handler(route, 2);
        } else {
            Object.keys(route).forEach(function (key) {
                if (typeof route[key] === "object") {
                    return normalize(route, key);
                }
                handler(route, key);
            });
        }
    }

    normalize(config, "routes");

    this.router = Ruut(config.routes);

    if (config.autocheck) {
        this.check();
    }

    global.addEventListener("popstate", self.check.bind(self, null));
};

exports.check = function (str) {
    if (!this.router(str || location.pathname)) {
        emitRoute.call(this, this._config.notFound || "__404", {});
    }
};

// TODO make a data handler out of it, then configs like this are possible:
/*
  [
      "event",
      "instance/method",
      ["!route", "error/route"],
      [":route", "success/route"]
  ]
*/
exports.route = function (str) {
    var self = this;
    str.data(function (data) {
        global.history.pushState(0, 0, data.url);
        self.check();
    });
};
