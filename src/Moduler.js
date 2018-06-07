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
    function PromiseClass(executor) {
			var promise = this;

      this.state = 'pending';
      this.value = undefined;
      this.tasks = [];

      if (fn.isCallable(executor)) {
				try {
					// Executor
					executor(
						// onFulfilled
						function(value) {
							promiseContext.fulFilled(promise, value);
						},
						// onRejected
						function(reason) {
							promiseContext.rejected(promise, reason);
						}
					);
				}
				catch (e) {
					// Throw Error
					promiseContext.rejected(promise, e);
				}
      } else {
        throw new TypeError('Promise resolver ' + executor + ' is not a function');
      }
		}

    PromiseClass.prototype.then = function(onFulfilled, onRejected) {
      var promise = this,
					task = {
						events: {},
						promise: undefined,
						transition: function(state, value) {
							this.promise.state = state;
							this.promise.value = value;
						}
					};

			task.events.fulFilled = onFulfilled;
			task.events.rejected = onRejected;

      // then must return a promise
      // https://promisesaplus.com/#point-40
      task.promise = new PromiseClass(function (onFulfilled, onRejected) {
        // Nothing here
			});

      // Put current task to Marcotask list
      this.tasks.push(task);

      // Send notify to current promise
      notify(this);

      return task.promise;
    };

		PromiseClass.resolve = function(mixed) {
			if (mixed instanceof PromiseClass) {
				return mixed;
			}

			return new PromiseClass(function(resolve, reject) {
        // Resolve
        resolve(mixed);
			});
		};

		PromiseClass.reject = function(reason) {
			if (reason instanceof PromiseClass) {
				return reason;
			}

			return new PromiseClass(function(resolve, reject) {
				reject(reason);
			});
		};

		var promiseContext = {
			fulFilled: function (promise, value) {
				if (promise.state === 'pending') {
					promise.state = 'fulFilled';
					promise.value = value;
	        notify(promise);
				}
				return this;
			},
			rejected: function (promise, reason) {
				if (promise.state === 'pending') {
					promise.state = 'rejected';
					promise.value = reason;
	        notify(promise);
				}
				return this;
			}
		};

    // To run [[Resolve]](promise, x)
    // https://promisesaplus.com/#point-47
		function resolve(promise, mixed) {
      // If promise and x refer to the same object, reject promise with a TypeError as the reason.
      // https://promisesaplus.com/#point-48
      if (promise === mixed) {
        throw new TypeError('Promise and value not allow refer to the same object');
      }

      // If x is not an object or function, fulfill promise with x.
      // https://promisesaplus.com/#point-64
			if (!fn.isObject(mixed) && !fn.isCallable(mixed)) {
				promiseContext.fulFilled(promise, mixed);
				return;
			}

      // If x is a promise, adopt its state
      // So we put the onFulfilled and onRejected callback to adopt its state, value and reason
      // https://promisesaplus.com/#point-49
			if (mixed instanceof PromiseClass) {
				mixed.then(function (value) {
					promiseContext.fulFilled(promise, value);
				}, function (reason) {
					promiseContext.rejected(promise, reason);
				});

				return;
			}

      // If x is an object or function
      // https://promisesaplus.com/#point-53
			if (fn.isObject(mixed) && 'then' in mixed) {
				var then,
            called = false;

        try {
          // Let then be x.then
          // https://promisesaplus.com/#point-54
          then = mixed.then;
        }
        catch(e) {
          // If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
          // https://promisesaplus.com/#point-55
          promiseContext.rejected(promise, e);
        }

        if (fn.isCallable(then)) {
  				try {
            then.call(
              mixed,
              function(value) {
    						if (!called) {
    							called = true;
                  // If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
                  // https://promisesaplus.com/#point-57
    							resolve(promise, value);
    						}
    					}, function(reason) {
    						if (called) {
    							called = true;
                  // If/when rejectPromise is called with a reason r, reject promise with r.
                  // https://promisesaplus.com/#point-58
    							promiseContext.rejected(promise, reason);
    						}
    					}
            );
  				}
  				catch (e) {
            // If resolvePromise or rejectPromise have been called, ignore it.
            // https://promisesaplus.com/#point-61
  					if (!called) {
  						promiseContext.rejected(promise, e);
  					}
  				}
        } else {
          // If then is not a function, fulfill promise with x.
          // https://promisesaplus.com/#point-63
  				promiseContext.fulFilled(promise, mixed);
  			}
			}
		}

		function notify(promise) {
      if (promise.state !== 'pending' && promise.tasks.length) {
        // Marcotask
        setTimeout(function() {
          var mircotaskList = promise.tasks;
          promise.tasks = [];

          // Mircotask
          var microtask = undefined;
          while (microtask = mircotaskList.shift()) {
  					var promised = microtask.promise;

						if (!promise.state in microtask.events) {
							microtask.transition(promise.state, promise.value);
						} else {
              var object = microtask.events[promise.state];
              if (fn.isCallable(object)) {
                try {
                  // If either onFulfilled or onRejected returns a value x,
                  // run the Promise Resolution Procedure [[Resolve]](promise2, x).
                  // https://promisesaplus.com/#point-41
                  resolve(promised, object(promise.value));
                }
                catch(e) {
                  // If either onFulfilled or onRejected throws an exception e,
                  // promise2 must be rejected with e as the reason.
                  // https://promisesaplus.com/#point-42
                  promiseContext.rejected(promised, e);
                }
              } else {
                // If onFulfilled is not a function and promise1 is fulFilled,
                // promise2 must be fulFilled with the same value as promise1.
                // https://promisesaplus.com/#point-43
                // If onRejected is not a function and promise1 is rejected,
                // promise2 must be rejected with the same reason as promise1.
                // https://promisesaplus.com/#point-44
                promiseContext[promise.state](promised, promise.value);
              }
						}
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
