(function(global) {
	"use strict";
  var fn = {},
      configuration = {
        plugin: './plugin/'
      },
      allType = '*/'.concat('*'),

      // Shortern Function
		  ary = Array.prototype,
      toString = Object.prototype.toString,
      win = window,
      doc = document,
      head = doc.getElementsByTagName('head')[0],
      context = {},
  		slice = ary.slice,
  		some = ary.some,

			container = doc.createElement('div'),

      // Regex
      regexConstructor = /^\[object .+?Constructor\]$/,
      regexNative = new RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&').replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

	/**
	 * Moduler
	 * @constructor
	 * return ElementCollection
	 */
  function Moduler(object) {
		if (fn.isCallable(object)) {
			return this;
		} else {
			var collection = new ElementCollection();
			collectElements(object, doc, collection);

			// Clear _added flag
			fn.each(collection, function() {
				delete this._added;
			});

			return collection;
		}
  };

  // Moduler Function
  fn = {
		/**
		 * [description]
		 * @param  {object} object [description]
		 * @return {boolean}        [description]
		 */
		isDefined: function(object) {
			return (typeof object != 'undefined');
		},

		/**
		 * [description]
		 * @param  {[type]} object [description]
		 * @return {[type]}        [description]
		 */
		isNative: function(object) {
			var type = typeof object;
			return (type === 'function') ? regexNative.test(Function.prototype.toString.call(object)) : (object && type === 'object' && regexConstructor.test(toString.call(object))) || false;
		},

		/**
		 * [description]
		 * @param  {[type]} object [description]
		 * @return {[type]}        [description]
		 */
		isCallable: function(object) {
			return (typeof object == 'function');
		},

		/**
		 * [description]
		 * @param  {[type]} object [description]
		 * @return {[type]}        [description]
		 */
		isObject: function(object) {
			return typeof object === 'object';
		},

		/**
		 * [description]
		 * @param  {[type]} object [description]
		 * @return {[type]}        [description]
		 */
		isPlainObject: function(object) {
			if (object !== null && fn.isObject(object)) {
				if (fn.isCallable(Object.getPrototypeOf)) {
					var proto = Object.getPrototypeOf(object);
					return proto === Object.prototype || proto === null;
				}
				return toString.call(object) === '[object Object]';
			}
			return false;
		},

		/**
		 * [description]
		 * @param  {[type]} object [description]
		 * @return {[type]}        [description]
		 */
		isIterable: function(object) {
			return (object && (fn.isNative(object.some) || fn.isNative(object.forEach)));
		},

		/**
		 * [description]
		 * @param  {[type]} object [description]
		 * @return {[type]}        [description]
		 */
		isString: function(object) {
			return (typeof object === 'string');
		},

		/**
		 * [description]
		 * @param  {[type]} object [description]
		 * @return {[type]}        [description]
		 */
		isArray: function(object) {
			return (object && Array.isArray(object));
		},

		/**
		 * [description]
		 * @param  {[type]} object [description]
		 * @return {[type]}        [description]
		 */
		isDOMElement: function(object) {
			return object && (object.nodeType == 1 || object.nodeType == 9 || object.nodeType == 11);
		},

		/**
		 * [description]
		 * @param  {[type]}   object   [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
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

		/**
		 * [description]
		 * @param  {[type]} object       [description]
		 * @param  {[type]} extendObject [description]
		 * @return {[type]}              [description]
		 */
    extend: function(object, extendObject) {
  		fn.each(extendObject, function(key, val) {
				if (!fn.isDefined(object[key])) {
					object[key] = val;
				}
  		});
  		return this;
  	},

		/**
		 * [description]
		 * @param  {[type]} object [description]
		 * @return {[type]}        [description]
		 */
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

  fn.extend(Moduler, fn);

	// ElementCollection
	// Store all elements and provides ton of function
	var ElementCollection = (function() {
		/**
		 * [ElementCollectionClass description]
		 * @param       {[type]} elements [description]
		 * @constructor
		 */
		function ElementCollectionClass(elements) {
			var self = this;
			if (fn.isDefined(elements)) {
				if (fn.isIterable(elements)) {
					fn.each(elements, function() {
						if (fn.isDOMElement(this)) {
							self.push(this);
						}
					});
				} else if (fn.isDOMElement(elements)) {
					self.push(elements);
				}
			}
		}

	  ElementCollectionClass.prototype = {
			constructor: ElementCollectionClass,
			push: function(element) {
				if (!fn.isDOMElement(element)) {
					throw new TypeError('Object ' + element + ' is not an element.');
				}
				ary.push.call(this, element);
			},
			indexOf: ary.indexOf,
			forEach: ary.forEach,
			some: ary.some,
			length: 0
		};

		return ElementCollectionClass;
	})();

	function collectElements(selector, context, source) {
		context = (context && context.nodeType && context.querySelectorAll) ? context : doc;
		if (fn.isString(selector)) {
			selector = selector.trim();
			if (selector) {
				// If selector is a DOM string
				if (/^<.+>$/.test(selector)) {
					container.innerHTML = selector;
					fn.each(container.children, function() {
						source.push(this);
					});
					container.innerHTML = '';
				} else {
					fn.each(context.querySelectorAll(selector), function() {
						if (!this._added) {
							this._added = true;
							source.push(this);
						}
					});
				}
			}
		} else if (selector instanceof ElementCollection || fn.isIterable(selector)) {
			fn.each(selector, function() {
				collectElements(this, context, source);
			});
		} else if (fn.isDOMElement(selector) || selector === win || selector === doc) {
			if (!this._added) {
				selector._added = true;
				source.push(selector);
			}
		}

		return source;
	}

  function select(needle, object) {
    var packer = {};

    packer.each = function(callback) {
      if (fn.isCallable(callback)) {
        for (var key in object) {
          callback.apply(object, [key, object[key]]);
        }
      }
      return this;
    };

    return packer;
  }

	// [ Moduler.Promise ]
  // 		Abide by Promises/A+ Rule
  // 		https://promisesaplus.com/
  Moduler.Promise = (function() {
		/**
		 * [PromiseClass description]
		 * @param       {[type]} executor [description]
		 * @constructor
		 */
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
							resolvePromise(promise, value);
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

		/**
		 * [description]
		 * @param  {[type]} onFulfilled [description]
		 * @param  {[type]} onRejected  [description]
		 * @return {[type]}             [description]
		 */
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

		/**
		 * [description]
		 * @param  {[type]} mixed [description]
		 * @return {[type]}       [description]
		 */
		PromiseClass.resolve = function(mixed) {
			if (mixed instanceof PromiseClass) {
				return mixed;
			}

			return new PromiseClass(function(onFulfilled, reject) {
        onFulfilled(mixed)
			});
		};

		/**
		 * [description]
		 * @param  {[type]} reason [description]
		 * @return {[type]}        [description]
		 */
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
		function resolvePromise(promise, mixed) {
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
						// Call this as x, we assume it is a promise
            then.call(
              mixed,
              function(value) {
    						if (!called) {
    							called = true;
                  // If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
                  // https://promisesaplus.com/#point-57
    							resolvePromise(promise, value);
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
          var microtask;
          while (microtask = mircotaskList.shift()) {
  					var forkPromise = microtask.promise;

						if (!promise.state in microtask.events) {
							microtask.transition(promise.state, promise.value);
						} else {
              var object = microtask.events[promise.state];
              if (fn.isCallable(object)) {
                try {
                  // If either onFulfilled or onRejected returns a value x,
                  // run the Promise Resolution Procedure [[Resolve]](promise2, x).
                  // https://promisesaplus.com/#point-41
									var result = object(promise.value);
                  resolvePromise(forkPromise, result);
                }
                catch(e) {
                  // If either onFulfilled or onRejected throws an exception e,
                  // promise2 must be rejected with e as the reason.
                  // https://promisesaplus.com/#point-42
                  promiseContext.rejected(forkPromise, e);
                }
              } else {
                // If onFulfilled is not a function and promise1 is fulFilled,
                // promise2 must be fulFilled with the same value as promise1.
                // https://promisesaplus.com/#point-43
                // If onRejected is not a function and promise1 is rejected,
                // promise2 must be rejected with the same reason as promise1.
                // https://promisesaplus.com/#point-44
                promiseContext[promise.state](forkPromise, promise.value);
              }
						}
  				}
        });
      }
		}

		return PromiseClass;
	})();

	Moduler.Ajax = (function() {
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

		function AjaxClass(url, settings) {
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
			url = (fn.isString(url)) ? url : ajaxSettings.default.url;

			var promise = new Moduler.Promise(function(resolve, reject) {
				var xmlHttp = null,
						action = this,
						converters = {};

				// settings.beforeSend
				if (fn.isCallable(settings.beforeSend)) {
					settings.beforeSend.call(xmlHttp, xmlHttp);
				}

				// settings.crossDomain
				if (settings.crossDomain || settings.dataType === 'script') {
					if (settings.dataType !== 'script') {
						// settings.jsonp
						var jsonpFunc = '';
						if (settings.jsonp && fn.isString(settings.jsonp)) {
							jsonpFunc = settings.jsonp;
						} else {
							jsonpFunc = Math.random().toString(36).replace(/\d/g, '').slice(2, 7);
							if (!fn.isDefined(win._ajaxCallback)) {
								win._ajaxCallback = {};
							}

							win._ajaxCallback[jsonpFunc] = function(data) {
								if (fn.isCallable(settings.jsonpCallback)) {
									settings.jsonpCallback(data);
								}
								resolve(data);
							};

							jsonpFunc = 'window._ajaxCallback.' + jsonpFunc;
						}
						url = url + ((/\?/).test(url) ? '&' : '?') + 'callback=' + jsonpFunc;
					}

					var script = doc.createElement('script');
					// settings.data
					if (settings.data) {
						settings.data = fn.param(settings.data);
						url += '&' + settings.data;
					}

					// settings.scriptCharset
					if (settings.scriptCharset) {
						script.charset = settings.scriptCharset;
					}

					script.src = url;
					doc.getElementsByTagName('head')[0].appendChild(tag);
					script.onload = function() {
						onCompleted();
					};

					script.onerror = function(e) {
						reject(e);
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
							reject('timeout');
						}, parseInt(settings.timeout));
					}

					// settings.accepts
					if (!fn.isPlainObject(settings.accepts)) {
						settings.accepts = {};
					}
						console.log(xmlHttp);
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
										reject({
											status: 304,
											text: 'Not modified'
										});
										onCompleted();
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

							resolve(response);
							onCompleted();
						} else {
							reject({
								status: xmlHttp.status,
								text: xmlHttp.statusText
							});
							onCompleted();
						}
					};

					xmlHttp.send(settings.data);
				}
			});

			function onCompleted() {
				// settings.complete
				if (!fn.isIterable(settings.complete)) {
					settings.complete = [settings.complete];
				}

				fn.each(settings.complete, function() {
					if (fn.isCallable(this)) {
						this.call(this, xmlHttp, xmlHttp.statusText);
					}
				});
			}

			return promise;
		}

		AjaxClass.config = function(param, value) {
			if (fn.isPlainObject(param)) {
				fn.each(param, this);
			} else {
				if (fn.isDefined(ajaxSettings.default[param])) {
					ajaxSettings.default[param] = value;
				}
			}
			return this;
		};

		AjaxClass.reset = function() {
			ajaxSettings.default = fn.clone(ajaxSettings._default);
			return this;
		};

		return AjaxClass;
	})();

  Moduler.config = function(config) {
    if (typeof config !== undefined) {
      select('plugin'.split(' '), config).each(function(parameter, value) {
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

      script.src = configuration.plugin + scriptName;

      head.appendChild(script);
    }
    return this.exports;
  };

	global.Moduler = Moduler;

  Moduler.exports = null;
})(window);
