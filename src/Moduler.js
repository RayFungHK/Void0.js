(function(global) {
	"use strict";
  var fn = {},
      ary = Array.prototype,
      Package = {},
      configuration = {
        plugin: './plugin/'
      },
      allType = '*/'.concat('*'),

      // Shortern Function
      toString = Object.prototype.toString,
      win = window,
      doc = document,
      head = doc.getElementsByTagName('head')[0],
      context = {},
  		slice = ary.slice,
  		some = ary.some,

      // Regex
      regexConstructor = /^\[object .+?Constructor\]$/,
      regexNative = new RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&').replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

  Package.prototype = {
		constructor: Package,
		push: ary.push,
		indexOf: ary.indexOf,
		forEach: ary.forEach,
		some: ary.some,
		length: 0
	};

  var Moduler = function(selector) {

  };

  fn = {
		isDefined: function(object) {
			return (typeof object != 'undefined');
		},

		isNative: function(object) {
			var type = typeof object;
			return (type === 'function') ? regexNative.test(Function.prototype.toString.call(object)) : (object && type === 'object' && regexConstructor.test(toString.call(object))) || false;
		},

		isCallable: function(object) {
			return (typeof object == 'function');
		},

		isObject: function(object) {
			return typeof object === 'object';
		},

		isPlainObject: function(object) {
			if (object !== null && fn.isObject(object)) {
				if (fn.IsCallable(Object.getPrototypeOf)) {
					var proto = Object.getPrototypeOf(object);
					return proto === Object.prototype || proto === null;
				}
				return toString.call(object) === '[object Object]';
			}
			return false;
		},

		isArray: function(object) {
			return (object && Array.isArray(object));
		},

    each: function(object, callback) {
  		if (fn.isNative(object.some)) {
  			object.some(function(element, index, object) {
  				var result = callback.call(element, index, element, object);
  				return (!fn.isDefined(result)) ? false : !result;
  			});
  		} else if (fn.isNative(object.forEach)) {
  			var skip = false;
  			object.forEach(function(element, index, object) {
  				if (!skip) {
  					var result = callback.call(element, index, element, object);
  					if (fn.isDefined(result) && !result) {
  						skip = true;
  					}
  				}
  			});
  		} else if (fn.isNative(object.item)) {
  			fn.each(slice.call(object), callback);
  		} else if (fn.isObject(object)) {
  			for (var index in object) {
  				var result = callback.call(object[index], index, object[index], object);
  				if (fn.isDefined(result) && !result) {
  					break;
  				}
  			}
  		}
    },

    extend: function(object, extendObject) {
  		var args = slice.call(arguments);
  		args.shift();

  		fn.each(args, function() {
  			if (typeof this == 'object' && this !== null) {
  				fn.each(this, function(key, val) {
  					if (typeof object[key] == 'undefined') {
  						object[key] = val;
  					}
  				});
  			}
  		});
  		return this;
  	},

		clone: function(object) {
			var newObject;

			if (!fn.isDefined(object) || !object) {
        return object;
      }

			if (object instanceof Date) {
				return new Date(object.getTime());
			} else if (fn.isDefined(object.cloneNode)) {
				return object.cloneNode(true);
			} else if (fn.isArray(object)) {
				return slice.call(object);
			} else if (fn.isObject(object)) {
				if (object.constructor) {
					newObject = object.constructor();
				} else {
					newObject = {};
				}
				fn.each(object, function(key, val) {
					newObject[key] = fn.clone(val);
				});
				return newObject;
			} else {
				return object;
			}
		}
  };

  // Ajax
  var ajaxSettings = {
		cached: {},
		default: {
			url: location.href,
			type: 'GET',
			processData: true,
			async: true,
			contentType: 'application/x-www-form-urlencoded; charset=UTF-8',

			/* Default Null */
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			headers: {},

			accepts: {
				'*': allType,
				text: 'text/plain',
				html: 'text/html',
				xml: 'application/xml, text/xml',
				json: 'application/json, text/javascript'
			},
			converters: {
				'* text': win.String,
				'text html': true,
				'text json': fn.parseJSON,
				'text xml': fn.parseXML
			}
		}
	};
	ajaxSettings._default = fn.clone(ajaxSettings.default);
  fn.ajax = function(url, settings) {
		if (fn.isPlainObject(url)) {
			settings = url;
			url = settings.url;
		}
		if (!fn.isPlainObject(settings)) {
			settings = ajaxSettings.default;
		} else {
			fn.each(ajaxSettings.default, function(key, val) {
				if (key != 'headers' && key != 'accepts' && key != 'converters') {
					if (!fn.isDefined(settings[key])) {
						settings[key] = val;
					}
				}
			});
		}
		url = url || ajaxSettings.default.url;

		var thread = fn.Thread(function() {
			var xmlHttp = null,
				action = this,
				converters = {};

			action.wait();

			// settings.beforeSend
			if (fn.isCallable(settings.beforeSend)) {
				if (!settings.beforeSend.call(xmlHttp, xmlHttp)) {
					action.reject();
				}
			}

			function callComplete() {
				// settings.complete
				if (!fn.isIterator(settings.complete)) {
					settings.complete = [settings.complete];
				}
				fn.each(settings.complete, function() {
					if (fn.isCallable(this)) {
						this.call(this, xmlHttp, xmlHttp.statusText);
					}
				});
			}

			// settings.crossDomain
			if (settings.crossDomain || settings.dataType == 'script') {
				if (settings.dataType != 'script') {
					// settings.jsonp
					var jsonpFunc = '';
					if (settings.jsonp && fn.isString(settings.jsonp)) {
						jsonpFunc = settings.jsonp;
					} else {
						jsonpFunc = Math.random().toString(36).replace(/\d/g, '').slice(2, 7);
						if (!win._ajaxCallback) {
							win._ajaxCallback = {};
						}
						win._ajaxCallback[jsonpFunc] = (fn.isCallable(settings.jsonpCallback)) ? settings.jsonpCallback : action.resume;
						jsonpFunc = 'window._ajaxCallback.' + jsonpFunc;
					}
					url = url + ((/\?/).test(url) ? '&' : '?') + 'callback=' + jsonpFunc;
				}

				var tag = doc.createElement('script');
				// settings.data
				if (settings.data) {
					settings.data = fn.param(settings.data);
					url += '&' + settings.data;
				}

				// settings.scriptCharset
				if (settings.scriptCharset) {
					tag.charset = settings.scriptCharset;
				}

				tag.src = url;
				doc.getElementsByTagName('head')[0].appendChild(tag);
				tag.onload = function() {
					callComplete();
				};
			} else {
				xmlHttp = new XMLHttpRequest();
				// settings.method
				if (!settings.method) {
					settings.method = settings.method || settings.type || 'GET';
				}
				settings.method = settings.method.toUpperCase();

				// settings.data
				if (settings.data) {
					if (settings.processData && !fn.isString(settings.data) && (settings.method == 'GET' || settings.data.constructor != FormData)) {
						settings.data = fn.param(settings.data);
					}
					if (settings.method == 'GET') {
						url += ((/\?/).test(url) ? '&' : '?') + settings.data;
					}
				}

				// settings.cache
				if (!settings.cache && (!settings.dataType || settings.dataType == 'jsonp' || settings.dataType == 'script')) {
					url = url + ((/\?/).test(url) ? '&' : '?') + (new Date()).getTime();
				}

				if (!fn.isDefined(settings.async)) {
					settings.async = true;
				}
				xmlHttp.open(settings.method, url, settings.async, settings.username, settings.password);

				// settings.timeout
				if (parseInt(settings.timeout) > 0) {
					xmlHttp.timeoutTimer = setTimeout(function() {
						xmlHttp.abort('timeout');
					}, parseInt(settings.timeout));
				}

				// settings.accepts
				if (!fn.isPlainObject(settings.accepts)) {
					settings.accepts = {};
				}
				fn.extend(settings.accepts, ajaxSettings.default.accepts);
				xmlHttp.setRequestHeader('Accept', (settings.dataType && settings.accepts[settings.dataType]) ? settings.accepts[settings.dataType] + ((settings.dataType !== '*') ? ', ' + allType + '; q=0.01' : '') : settings.accepts['*']);

				// settings.contentType
				if (settings.data && settings.data.constructor == FormData) {
					settings.contentType = 'multipart/form-data; charset=UTF-8';
				} else {
					if (!fn.isDefined(settings.contentType)) {
						settings.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
					}
					if (settings.contentType !== false) {
						xmlHttp.setRequestHeader('Content-Type', settings.contentType);
					}
				}

				// settings.converters
				if (fn.isPlainObject(settings.converters)) {
					fn.each(settings.converters, function(name, callback) {
						name = name.trim();
						if (/[\w-]+\s[\w-]/.test(name) && (fn.isCallable(callback) || callback === true)) {
							converters[name] = callback;
						}
					});
				}
				fn.extend(converters, ajaxSettings.default.converters);

				// settings.headers
				if (fn.isPlainObject(settings.headers)) {
					fn.each(settings.headers, function(name, value) {
						xmlHttp.setRequestHeader(name.trim(), value);
					});
				}

				// settings.mimeType
				if (settings.mimeType && fn.isString(settings.mimeType)) {
					xmlHttp.overrideMimeType(settings.mimeType);
				}

				xmlHttp.onreadystatechange = function() {
					if (xmlHttp.readyState != 4) return;

					// settings.statusCallback
					if (fn.isCallable(settings.statusCallback)) {
						if (settings.statusCallback[xmlHttp.status]) {
							settings.statusCallback[xmlHttp.status].call(xmlHttp);
						}
					}
					if (xmlHttp.status == 200) {
						var header = xmlHttp.getResponseHeader('Content-Type'),
							delimited = header.split(';')[0].split('/'),
							contentType = delimited[0],
							outputFormat = delimited[1],
							response = xmlHttp.response,
							convertName = contentType + ' ' + ((settings.dataType) ? settings.dataType : outputFormat),
							modifiedCheck = {};

						// settings.ifModified
						if (settings.ifModified) {
							modifiedCheck.etag = xmlHttp.getResponseHeader('ETag');
							modifiedCheck.lastModified = xmlHttp.getResponseHeader('Last-Modified');
							if (ajaxSettings.cached[url]) {
								if (ajaxSettings.cached[url].lastModified != modifiedCheck.lastModified || (modifiedCheck.etag && ajaxSettings.cached[url].eTag == modifiedCheck.etag)) {
									ajaxSettings.cached[url] = modifiedCheck;
								} else {
									action.reject({
										status: 304,
										text: 'Not modified'
									});
									callComplete();
									return;
								}
							}
						}

						// settings.afterDataReceive
						if (fn.isCallable(settings.afterDataReceive)) {
							response = settings.afterDataReceive.call(response, response);
						}

						if (converters[convertName]) {
							if (converters[convertName] !== true) {
								response = converters[convertName](response);
							}
						}
						action.resume(response);
						callComplete();
					} else {
						action.reject({
							status: xmlHttp.status,
							text: xmlHttp.statusText
						});
						callComplete();
					}
				};

				xmlHttp.send(settings.data);
			}
		});
		return (settings.context) ? thread.resolveWith(settings.context) : thread.resolve();
	};

  Moduler = fn.extend(Moduler, fn);

  function select(needle, object) {
    var packer = {};

    packer.then = function(callback) {
      if (fn.isCallable(callback)) {
        for (var key in object) {
          callback.apply(object, [key, object[key]]);
        }
      }
      return this;
    };

    return packer;
  }

  // Promises/A+
  // An open standard for sound, interoperable JavaScript promises
  // https://promisesaplus.com/
  var context = {},
      internalParam = {
        state: 'pending',
        value: undefined,
        reason: undefined,
      };

  fn.each([
    ['resolve', 'value', 'onFulfilled'],
    ['reject', 'reason', 'onRejected']
  ], function() {
    context[this[0]] = function(promise, returns, callback) {
      if (promise.state === 'pending') {
        promise[this[1]] = returns;
        promise.state = this[2];
      }

      if (fn.isCallable(callback)) {
        callback(promise[this[1]]);
      }
    };
  });

  Moduler.Promise = function(object) {
    var promise = {
          constructor: this,
          then: function(/* onFulfilled, onRejected */) {
            var args = arguments;

            try {
              if (promise.state === 'pending') {
                if (fn.isCallable(object)) {
                  object(function(value) {
                    context.resolve(promise, value, args[0] || undefined);
                  }, function(reason) {
                    context.reject(promise, reason, args[1] || undefined);
                  });
                } else if (fn.isDefined(object)) {

                }
              }
            }
            catch(e) {
              context.reject(promise, e, args[1] || null);
            }

            return promise;
          },
          promise: function(obj) {
            return (obj != null) ? fn.extend(obj, promise) : promise;
          }
        };

    fn.extend(promise, internalParam);

    return promise;
  };

  fn.each('resolve reject'.split(' '), function() {
    var that = this;
    Moduler.Promise[that] = function(value) {
      var promise;
      if (fn.isDefined(value.then) && fn.isCallable(value.then)) {
        var thenable = value,
            promise = new Moduler.Promise(function(rs, rj) {
              thenable.then(function(value) {
                rs(value);
              }, function(reason) {
                rj(reason);
              });
            });
        console.log(promise.then);
        return promise.promise(thenable);
      } else {
        promise = new Moduler.Promise(function(rs, rj) {
          ({resolve: rs, reject: rj})[that](value);
        });
      }
      return promise;
    };
  });
  Moduler.Promise.prototype = Moduler.Promise;

  Moduler.config = function(config) {
    if (typeof config !== undefined) {
      select('plugin'.split(' '), config).then(function(parameter, value) {
        if (parameter === 'plugin') {
          value += '/';
          var matches = /^(?:.{0,2}\/+)?(?:[\w-.]+\/*)+(\/)+?$/.exec(value)
          if (matches) {
            configuration.plugin = value;
          }
        }
      });
    }
  }

  context.onScriptLoad = function(e) {
    if (e.type === 'load') {
      head.removeChild(e.currentTarget || e.srcElement);
    }
  };

  context.onScriptError = function(e) {
    if (e.type === 'error') {
      head.removeChild(e.currentTarget || e.srcElement);
    }
  };

  Moduler.load = function(scriptName) {
    var matches = /^(?:.{0,2}\/+)?(?:[\w-.]+\/*)+(\.js)?$/.exec(scriptName);
    if (matches) {
      if (!matches[1]) {
        scriptName += '.js';
      }
      var script = doc.createElement('script');

      // Remove the script when loaded or failed
      script.addEventListener('load', context.onScriptLoad, false);
      script.addEventListener('readystatechange', context.onScriptLoad, false);
      script.addEventListener('error', context.onScriptError, false);

      script.async = true;
      script.charset = 'utf-8';
      script.type = 'text/javascript';

      console.log(1);

      script.src = configuration.plugin + scriptName;

      head.appendChild(script);
      console.log(3);
    }
    return this.exports;
  };

  Moduler.exports = null;

  global.Moduler = Moduler;
})(window);
