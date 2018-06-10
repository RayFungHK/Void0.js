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

			container = doc.createElement('div'),
			iframe = doc.createElement('iframe'),

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
			fn.ready(object);
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
			// Object.getPrototypeOf support IE9
			var prototype = (object.__proto__ || Object.getPrototypeOf(object));
			return (object && (toString.call(object) === '[object Array]' || fn.isNative(prototype.forEach) || fn.isNative(prototype.item)));
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
			// Object.getPrototypeOf support IE9
			var prototype = (object.__proto__ || Object.getPrototypeOf(object));
  		if (prototype && prototype.forEach && fn.isNative(prototype.forEach)) {
				var skip = false;
				object.forEach(function(element, index, object) {
					if (!skip) {
						result = callback.call(element, index, element, object);
						if (fn.isDefined(result) && !result) {
							skip = true;
						}
					}
				});
  		} else if (prototype && prototype.item && fn.isNative(prototype.item)) {
  			fn.each(slice.call(object), callback);
  		} else if (fn.isObject(object)) {
  			for (var index in object) {
  				var result = callback.call(object[index], index, object[index], object);
  				if (fn.isDefined(result) && !result) {
  					break;
  				}
  			}
  		}
			return this;
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
					object[key] = fn.clone(val);
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
			if (!object) {
				return object;
			}

			var result;
			fn.each([Number, String, Boolean], function() {
				if (object instanceof this) {
					result = this(object);
					return false;
				}
			});

			if (fn.isDefined(result)) {
				return result;
			}

			if (fn.isIterable(object)) {
				result = [];
				fn.each(object, function(key, value) {
					result[key] = fn.clone(value);
				});
			} else if (fn.isObject(object)) {
				if (fn.isDOMElement(object)) {
					result = object.cloneNode(true);
				} else if (!object.prototype) {
          if (object instanceof Date) {
            result = new Date(object);
          } else {
            result = {};
            for (var property in object) {
              result[property] = fn.clone(object[property]);
            }
          }
        } else {
          if (object.constructor) {
            result = new object.constructor();
          } else {
            result = object;
          }
        }
			} else {
				return object;
			}

			return result;
		},

		/**
		 * [description]
		 * @param  {[type]} text [description]
		 * @return {[type]}      [description]
		 */
		parseJSON: function(text) {
			if (!text || !fn.isString(text)) {
				return null;
			}

			try {
				return JSON.parse(text);
			} catch (e) {
				return null;
			}
		},

		/**
		 * [description]
		 * @param  {[type]} text [description]
		 * @return {[type]}      [description]
		 */
		parseXML: function(text) {
			var parser;
			if (!text || !fn.isString(text)) {
				return null;
			}

			try {
				parser = new DOMParser();
			} catch ( e ) {
				parser = undefined;
			}

			return (!parser || (parser = parser.parseFromString(text, 'text/xml')).getElementsByTagName('parsererror').length) ? null : parser;
		},

		/**
		 * [description]
		 * @param  {[type]} text [description]
		 * @return {[type]}      [description]
		 */
		camelCase: function(text) {
			return (text) ? text.toLowerCase().replace(/[\-_\s]([\da-z])/gi, function(str, match) {
				return match.toUpperCase();
			}) : '';
		},

		/**
		 * [description]
		 * @param  {[type]} a [description]
		 * @param  {[type]} b [description]
		 * @return {[type]}   [description]
		 */
		comparePosition: function(a, b) {
			return a.compareDocumentPosition ? a.compareDocumentPosition(b) : a.contains ? (a != b && a.contains(b) && 16) + (a != b && b.contains(a) && 8) + (a.sourceIndex >= 0 && b.sourceIndex >= 0 ? (a.sourceIndex < b.sourceIndex && 4) + (a.sourceIndex > b.sourceIndex && 2) : 1) : 0;
		},

		/**
		 * [description]
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		param: function(data, encode) {
			var params = [];

			function buildQueryString(key, value) {
				value = (fn.isCallable(value)) ? value() : value;
				params.push(key + '=' + (value || ''));
			}

			(function deeprun(data, prefix) {
				fn.each(data, function(key, val) {
					key = (!fn.isArray(data)) ? key : '';
					var param = (prefix) ? prefix + '[' + key + ']' : key;

					if (fn.isArray(val) || fn.isPlainObject(val)) {
						deeprun(val, param);
					} else {
						buildQueryString(param, val);
					}
				});
			})(data, '');

			return params.join('&');
		}
  };

	(function() {
		function extract(keyset, value, result) {
			var matches,
					regex = /(?:\[([^\]]*)\])/gm,
					typeArray,
					nextset;

			if ((matches = regex.exec(keyset)) !== null) {
				if (!fn.isDefined(typeArray)) {
					if (fn.isDefined(result)) {
						typeArray = fn.isArray(result);
					} else {
						typeArray = !matches[1];
						result = (typeArray) ? [] : {};
					}
				}

				nextset = keyset.substring(matches[0].length);
				if (!fn.isDefined(result[matches[1]])) {
					result[matches[1]] = undefined;
				}

				if (nextset) {
					if (typeArray) {
						result.push(extract(nextset, value, result[matches[1]]));
					} else {
						result[matches[1]] = extract(nextset, value, result[matches[1]]);
					}
				} else {
					if (typeArray) {
						result.push(value);
					} else {
						result[matches[1]] = value;
					}
				}
			}

			return result;
		}

		/**
		 * [description]
		 * @param  {[type]} query [description]
		 * @return {[type]}       [description]
		 */
		fn.parseQuery = function(query) {
			var params = {};
			if (!query || !fn.isString(query)) {
				return params;
			}

			var pairs = query.split(/[;&]/);
			fn.each(pairs, function(k) {
				var keyValuePair = this.split('='),
						property,
						value,
						matches;

				if (keyValuePair) {
					property = unescape(keyValuePair[0]);
					value = (keyValuePair.length === 1) ? undefined : unescape(keyValuePair[1]).replace(/\+/g, ' ');
					if ((matches = /([^\[]+)((?:\[[^\]]*\])*)/.exec(property)) !== null) {
						property = unescape(matches[1]);
						if (matches[2]) {
							params[property] = extract(matches[2], value, params[property]);
						}
					} else {
						params[unescape(keyValuePair[0])] = value;
					}
				}
			});

			return params;
		}
	})();

	(function() {
		var onHold = false,
				onLoadEvent = [],
				domReady = false;

		function triggerOnLoad() {
			if (!onHold) {
				var pending = onLoadEvent;
				onLoadEvent = [];

				fn.each(pending, function() {
					this.call(win);
				});

				if (onLoadEvent.length) {
					triggerOnLoad();
				}
			}
		}

		// DOM Ready on post load
		if (doc.readyState === 'complete') {
			setTimeout(triggerOnLoad);
		} else {
			// Setup DOM Ready Event
			if (win.addEventListener) {
				doc.addEventListener('DOMContentLoaded',
					function() {
						triggerOnLoad();
						domReady = true;
					},
					false
				);
			} else {
				var top = !win.frameElement && doc.documentElement;
				// If the top view can be scrolled, trigger onLoadEvent
				if (top && top.doScroll) {
					(function tryScroll() {
						if (onLoadEvent.length) {
							try {
								top.doScroll('left');
							} catch (e) {
								// Re-call until doScroll is work
								return setTimeout(tryScroll, 50);
							}
							domReady = true;
							triggerOnLoad();
						}
					})();
				}

				doc.onreadystatechange = function() {
					if (doc.readyState === 'complete') {
						doc.onreadystatechange = null;
						domReady = true;
						triggerOnLoad();
					}
				};
			}

			win.onload = function() {
				win.onload = null;
				domReady = true;
				triggerOnLoad();
			};
		}

		fn.ready = function(callback) {
			if (fn.isCallable(callback)) {
				if (domReady) {
					callback();
				} else {
					onLoadEvent.push(callback);
				}
			}
			return this;
		};

		fn.holdReady = function(enable) {
			if (enable) {
				onHold = true;
			} else if (onHold) {
				onHold = false;
				triggerOnLoad();
			}
			return this;
		};
	})();

  fn.extend(Moduler, fn);

	// ElementCollection
	var ElementCollection = (function() {
		/**
		 * [ElementCollection description]
		 * @param       {[type]} elements [description]
		 * @constructor
		 */
		function ElementCollection(elements) {
			var self = this;

			if (fn.isDefined(elements)) {
				if (fn.isIterable(elements)) {
					fn.each(elements, function() {
						if (fn.isDOMElement(this)) {
							ary.push.call(self, this);
						}
					});
				} else if (fn.isDOMElement(elements)) {
					ary.push.call(self, elements);
				}
			}
		}

		var defaultPrototype,
				reservedFunc = {};

	  defaultPrototype = {
			push: ary.push,
			indexOf: ary.indexOf,
			forEach: ary.forEach,
			some: ary.some,
			length: 0,

			// Add ElementCollection function here, assume chainable
			// Usage: Moduler(selector).function([...args]);

			/**
			 * [description]
			 * @param  {Function} callback [description]
			 * @return {[type]}            [description]
			 */
			each: function(callback) {
				fn.each(this, callback);
				return this;
			},

			/**
			 * [description]
			 * @param  {[type]} css   [description]
			 * @param  {[type]} value [description]
			 * @return {[type]}       [description]
			 */
			css: function(css, value) {
				var elem,
						styleName,
						owner,
						self = this,
						cssObj = {};

				if (fn.isPlainObject(css)) {
					// If the css is An array of CSS properties, iterate and execute one by one
					fn.each(css, function(style, value) {
						self.css(style, value);
					});
				} else if (fn.isString(css)) {
					// Cover to camcel case
					styleName = fn.camelCase(css);

					// If the value is defined
					if (fn.isDefined(value)) {
						fn.each(this, function(i) {
							if (fn.isDefined(this.style[styleName])) {
								this.style[styleName] = (fn.isCallable(value)) ? value.call(this, i, this.style[styleName]) : value;
							}
						});
					} else {
						if (this.length > 0) {
							elem = this[0];
							owner = fn.owner(elem).document;

							if (owner.defaultView && owner.defaultView.getComputedStyle) {
								return owner.defaultView.getComputedStyle(elem, '').getPropertyValue(css);
							} else if (elem.currentStyle) {
								return elem.currentStyle[styleName];
							}

							return elem.style[styleName];
						}
						return null;
					}
				}
				return this;
			},

			/**
			 * [description]
			 * @param  {[type]} css [description]
			 * @return {[type]}     [description]
			 */
			removeCss: function(css) {
				if (fn.isString(css)) {
					fn.each(this, function() {
						var elem = this,
								csslist = css.split(' ');

						fn.each(csslist, function() {
							var cc = fn.camelCase(this);
							if (fn.isDefined(elem.style[cc])) {
								elem.style[cc] = '';
							}
						});
					});
				}

				return this;
			},

			/**
			 * [description]
			 * @param  {[type]} classname [description]
			 * @return {[type]}           [description]
			 */
			hasClass: function(classname) {
				if (this.length) {
					var elem = this[0];
					if ((' ' + elem.className + ' ').indexOf(' ' + classname + ' ') >= 0) {
						return true;
					}
				}
				return false;
			},

			/**
			 * [description]
			 * @param  {[type]} classname   [description]
			 * @param  {[type]} addorremove [description]
			 * @return {[type]}             [description]
			 */
			toggleClass: function(classname, addorremove) {
				fn.each(this, function(i, elem) {
					classname = (fn.isCallable(classname)) ? classname.call(this.className, i, this.className) : classname;
					if ((fn.isDefined(addorremove) && addorremove) || (!fn.isDefined(addorremove) && !Moduler(elem).hasClass(classname))) {
						Moduler(elem).addClass(classname);
					} else {
						Moduler(elem).removeClass(classname);
					}
					if (!elem.className) {
						elem.removeAttribute('class');
					}
				});
				return this;
			},

			/**
			 * [description]
			 * @param  {[type]} html [description]
			 * @return {[type]}      [description]
			 */
			html: function(html) {
				if (fn.isDefined(html)) {
					fn.each(this, function(i) {
						this.innerHTML = (fn.isCallable(html)) ? html.call(this.innerHTML, i, this.innerHTML) : html;
					});
					return this;
				} else {
					return (this.length) ? this[0].innerHTML : '';
				}
			},

			/**
			 * [description]
			 * @return {[type]} [description]
			 */
			shift: function(callback) {
				if (!this.length) {
					return this;
				}

				if (fn.isDefined(callback) && fn.isCallable(callback)) {
					var elem = ary.shift.call(this);
					callback.call(Moduler(elem));
					return this;
				} else {
					return Moduler(this[0]);
				}
			},

			/**
			 * [description]
			 * @return {[type]} [description]
			 */
			pop: function(callback) {
				if (!this.length) {
					return this;
				}

				if (fn.isDefined(callback) && fn.isCallable(callback)) {
					var elem = ary.pop.call(this);
					callback.call(Moduler(elem));
					return this;
				} else {
					return Moduler(this[this.length - 1]);
				}
			},

			/**
			 * [description]
			 * @param  {[type]}   start    [description]
			 * @param  {[type]}   end      [description]
			 * @param  {Function} callback [description]
			 * @return {[type]}            [description]
			 */
			slice: function(start, end, callback) {
				if (!this.length) {
					return this;
				}

				if (fn.isDefined(callback) && fn.isCallable(callback)) {
					var elem = ary.slice.call(this, start, end);
					callback.call(Moduler(elem));
					return this;
				} else {
					return Moduler(ary.slice.call(this, start, end));
				}
			},

			/**
			 * [description]
			 * @param  {[type]} selector [description]
			 * @return {[type]}          [description]
			 */
			is: function(selector) {
				var found = false,
						elem;
				if (!this.length) {
					return false;
				}

				elem = this[0];
				if (fn.isString(selector) || fn.isIterable(selector)) {
					if (fn.isString(selector)) {
						selector = Moduler(selector);
					}

					fn.each(selector, function() {
						if (this === elem) {
							found = true;
							return false;
						}
					});
					return found;
				} else if (fn.isCallable(selector)) {
					return selector.call(elem);
				}
			},

			/**
			 * [description]
			 * @param  {[type]} selector [description]
			 * @return {[type]}          [description]
			 */
			find: function(selector) {
				var collection = new ElementCollection(),
						elems = this;
				if (fn.isString(selector)) {
					fn.each(elems, function() {
						fn.each(this.querySelectorAll(selector), function() {
							if (!this._added) {
								this._added = true;
								collection.push(this);
							}
						});
					});
				} else {
					(function deepsearch(element) {
						if (fn.isIterable(element)) {
							fn.each(element, function() {
								deepsearch(this);
							});
						} else if (fn.isDOMElement(element)) {
							fn.each(elems, function() {
								if (!this._added && fn.comparePosition(this, element) === 20) {
									this.added = true;
									collection.push(element);
								}
							});
						}
					})(selector);
				}

				fn.each(collection, function() {
					delete this._added;
				});
				return collection;
			},

			/**
			 * [description]
			 * @param  {[type]} selector [description]
			 * @return {[type]}          [description]
			 */
			children: function(selector) {
				if (!this.length) {
					return new ElementCollection();
				}

				return Moduler(this[0].children);
			},
		};

		(function() {
			/**
			 * [description]
			 * @return {[type]} [description]
			 */
			fn.each(['', 'Array'], function() {
				var name = this;
				defaultPrototype['serialize' + name] = function() {
					var result = [],
							elem,
							formData;

					if (this.length) {
						elem = this[0];
						if (elem && elem.tagName.toLowerCase() === 'form') {
							formData = new FormData(elem);
							fn.each(formData, function(key, value) {
								if (name) {
									result.push({
										name: encodeURIComponent(key),
										value: encodeURIComponent(value)
									});
								} else {
									result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
								}
							});
						}
					}
					return (name) ? result : result.join('&');
				}
			})
		})();

		/**
		 * [description]
		 * @param  {[type]} key  [description]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		/**
		 * [description]
		 * @param  {[type]} key  [description]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		fn.each(['add', 'remove'], function(key, name) {
			defaultPrototype[name + 'Class'] = function(classname) {
				if (classname) {
					fn.each(this, function(i) {
						var classList = {};

						classname = (fn.isCallable(classname)) ? classname.call(this.className, i, this.className) : classname;
						fn.each(this.className.split(' '), function() {
							classList[this] = true;
						});

						if (fn.isString(classname)) {
							classname = classname.split(' ');
						}

						if (fn.isIterable(classname)) {
							fn.each(classname, function() {
								if (name == 'add') {
									classList[this] = true;
								} else {
									delete classList[this];
								}
							});
							this.className = Object.keys(classList).join(' ').trim();
						}
					});
				}
				return this;
			};
		});

		fn.extend(ElementCollection.prototype, defaultPrototype);

		ElementCollection.hook = function(name, func) {
			if (fn.isCallable(func)) {
				if (fn.isDefined(defaultPrototype[name])) {
					reservedFunc[name] = true;
				}
				ElementCollection.prototype[name] = func;
			}
			return this;
		};

		ElementCollection.reset = function() {
			ElementCollection.prototype = defaultPrototype;
			return this;
		};

		return ElementCollection;
	})();

	function buildHTML(html, source) {
		container.innerHTML = selector;
		if (fn.isIterable(source)) {
			fn.each(container.children, function() {
				source.push(this);
			});
			container.innerHTML = '';
			return source;
		} else {
			var elements = ary.slice.call(container.children);
			container.innerHTML = '';
			return elements;
		}
	}

	function collectElements(selector, context, source) {
		context = (context && context.nodeType && context.querySelectorAll) ? context : doc;
		if (fn.isString(selector)) {
			selector = selector.trim();
			if (selector) {
				// If selector is a DOM string
				if (/^<.+>$/.test(selector)) {
					buildHTML(selector, source);
				} else {
					fn.each(context.querySelectorAll(selector), function() {
						if (!this._added) {
							this._added = true;
							source.push(this);
						}
					});
				}
			}
		} else if (fn.isDOMElement(selector) || selector === win || selector === doc) {
			if (!selector._added) {
				selector._added = true;
				source.push(selector);
			}
		} else if (selector instanceof ElementCollection || fn.isIterable(selector)) {
			fn.each(selector, function() {
				collectElements(this, context, source);
			});
		}

		return source;
	}

	// [ Moduler.Promise ]
  // 		Abide by Promises/A+ Rule
  // 		https://promisesaplus.com/

  Moduler.Promise = (function() {
		/**
		 * [Promise description]
		 * @param       {[type]} executor [description]
		 * @constructor
		 */
    function Promise(executor) {
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
    Promise.prototype.then = function(onFulfilled, onRejected) {
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
      task.promise = new Promise(function (onFulfilled, onRejected) {
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
		Promise.resolve = function(mixed) {
			if (mixed instanceof Promise) {
				return mixed;
			}

			return new Promise(function(onFulfilled, reject) {
        onFulfilled(mixed)
			});
		};

		/**
		 * [description]
		 * @param  {[type]} reason [description]
		 * @return {[type]}        [description]
		 */
		Promise.reject = function(reason) {
			if (reason instanceof Promise) {
				return reason;
			}

			return new Promise(function(resolve, reject) {
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
			if (mixed instanceof Promise) {
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
			} else {
				// If x is not thenable, fulfill promise with x.
				// https://promisesaplus.com/#point-64
				promiseContext.fulFilled(promise, mixed);
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

		return Promise;
	})();

	Moduler.ajax = (function() {
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
					if (settings.dataType === 'script') {
						// settings.jsonp
						var jsonpFunc,
								jsonpCallback;

						if (settings.jsonp && fn.isString(settings.jsonp)) {
							jsonpFunc = settings.jsonp;
						} else {
							if (!fn.isDefined(win._ajaxCallback)) {
								win._ajaxCallback = {};
							}
							jsonpFunc = Math.random().toString(36).replace(/\d/g, '').slice(2, 7);

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
					doc.getElementsByTagName('head')[0].appendChild(script);
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

	global.Moduler = Moduler;

  Moduler.exports = null;
})(window);
