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

  // Moduler Function
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
  var promiseContext = {},
      internalParam = {
        state: 'pending',
        value: undefined,
        reason: undefined,
      };

  /*
  fn.each([
    ['resolve', 'value', 'onFulfilled'],
    ['reject', 'reason', 'onRejected']
  ], function() {
    promiseContext[this[0]] = function(promise, returns, callback) {
      if (fn.isCallable(callback)) {
        var promiseReturn = callback(returns);
        if (Moduler.Promise.isThenable(promiseReturn)) {
          promiseReturn.then(function(value) {
            promiseContext.resolve(promise, value, callback);
          });
        }
      } else {
        promise[this[1]] = returns;
        promise.state = this[2];
      }
    };
  });
  */
  promiseContext.resolve = function(promise, value) {
    promise.state = 'onFulfilled';
    promise.value = value;
  };

  promiseContext.reject = function(promise, reason) {
    promise.state = 'onRejected';
    promise.reason = reason;
  };

  Moduler.Promise = function(callback) {
    var promise = {
          constructor: this,
          then: function(/* onFulfilled, onRejected */) {
            var onFulfilled = arguments[0],
                onRejected = arguments[1];

            if (fn.isCallable(callback)) {
              callback(function(value) {
                promiseContext.resolve(promise, value);

                if (promise.state === 'pending') {
                  if (fn.isDefined(onFulfilled)) {
                    promise.value = onFulfilled(value);
                  }
                }
              }, function(reason) {
                promiseContext.reject(promise, reason);
              });
            }

            return new Moduler.Promise(function(resolve, reject) {
              resolve(promise.value);
            });
          },
          promise: function(obj) {
            return (obj != null) ? fn.extend(obj, promise) : promise;
          }
        };

    fn.extend(promise, internalParam);

    return promise;
  };

  Moduler.Promise.isThenable = function(object) {
    return fn.isDefined(object) && fn.isDefined(object.then) && fn.isCallable(object.then);
  };

  Moduler.Promise.resolve = function(value) {
    return new Moduler.Promise(function(resolve) {
      return resolve(value);
    });
  };
  /*
  fn.each('resolve reject'.split(' '), function() {
    var rsj = this;
    Moduler.Promise[rsj] = function(value) {
      var promise;
      if (fn.isDefined(value) && fn.isDefined(value.then) && fn.isCallable(value.then)) {
        // Chaining
        new Moduler.Promise(value.then);
        return value;
      } else {
        promise = new Moduler.Promise(function(rs, rj) {
          return ({resolve: rs, reject: rj})[rsj](value);
        });
      }
      return promise;
    };
  });
  */
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
