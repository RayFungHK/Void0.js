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
  Moduler.Promise = (function() {
		var PromiseClass = function(executor) {
			var promise = this;

			this.state = 'pending';
			this.value = undefined;
			this.task = [];

      if (fn.isCallable(executor)) {
				try {
					// Executor
					executor(
						// onFulfilled
						function(value) {
							promiseContext.onFulfilled(promise, value);
						},
						// onRejected
						function(reason) {
							promiseContext.onRejected(promise, reason);
						}
					);
				}
				catch (e) {
					// Throw Error
					promiseContext.onRejected(promise, e);
				}
      }
		}

    PromiseClass.prototype = {
			then: function(onFulfilled, onRejected) {
	      var promise = this,
						storage = {
							events: {},
							promise: undefined,
							transition: function(state, value) {
								this.promise.state = state;
								this.promise.value = value;
							}
						};

	      if (fn.isCallable(onFulfilled)) {
					storage.events.fulFilled = onFulfilled;
	      }
	      if (fn.isCallable(onRejected)) {
					storage.events.rejected = onRejected;
	      }

	      storage.promise = new PromiseClass(function (onFulfilled, onRejected) {

				});

	      this.task.push(storage);
	      notify(this);

	      return storage.promise;
	    },

			catch: function(onRejected) {
				return this.then(undefined, onRejected);
			}
		};

		PromiseClass.resolve = function(mixed) {
			if (fn.isCallable(mixed)) {
				mixed = mixed(promise);
			}

			if (mixed instanceof promise) {
				return mixed;
			}

			var result = new this(function(onFulfilled, onRejected) {
        resolvePromise({
          onFulfilled: onFulfilled,
          onRejected: onRejected
        }, mixed);
			});
		};

		PromiseClass.reject = function(reason) {
			if (fn.isCallable(reason)) {
				reason = reason(promise);
			}

			return new this(function(onFulfilled, onRejected) {
				onRejected(reason);
			});
		};

		var promiseContext = {
			onFulfilled: function (promise, value) {
				if (promise.state === 'pending') {
					promise.state = 'fulFilled';
					promise.value = value;
	        notify();
				}
				return this;
			},
			onRejected: function (promise, reason) {
				if (promise.state === 'pending') {
					promise.state = 'rejected';
	        notify();
				}
				return this;
			}
		};

		function resolvePromise(promise, mixed) {
			if (!fn.isCallable(mixed)) {
				promise.onFulfilled(mixed);
				return;
			}

			if (mixed instanceof promise) {
				mixed.then(function (value) {
					promise.onFulfilled(value);
				}, function (reason) {
					promise.onRejected(reason);
				});
				return;
			}

			if ('then' in mixed && fn.isCallable(mixed.then)) {
				// Thenable
				var state = 'pending';
				try {
					mixed.then(function(value) {
						if (state === 'pending') {
							state = 'fulFilled';
							resolvePromise(promise, value);
						}
					}, function(reason) {
						if (state === 'pending') {
							state = 'rejected';
							promise.onRejected(reason);
						}
					});
				}
				catch (e) {
					if (state === 'pending') {
						state = 'onError';
						promise.onRejected(e);
					}
				}
			} else {
				promise.onFulfilled(mixed);
			}
		}

		function notify(promise) {
      if (promise.state !== 'pending') {
        var tasks = promise.task;
        promise.task = [];

				fn.each(tasks, function() {
					var storage = this,
							promised = this.promise;

					try {
						if (!promise.state in storage.events) {
							storage.transition(promise.state, promise.value);
						} else {
							var result = storage.events[promise.state](promise.value);
							resolvePromise(promised, result);
						}
					}
          catch (e) {
            storage.transition('rejected', e);
          }
				});
      }
		}

		return PromiseClass;
	})();

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
