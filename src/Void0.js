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
			supportstyles = container.style,
			supportsTransitions = 'transition' in supportstyles || 'WebkitTransition' in supportstyles || 'MozTransition' in supportstyles || 'msTransition' in supportstyles || 'OTransition' in supportstyles,
			iframe = doc.createElement('iframe'),

			// Mapping List
			propMapping = {
				'for': 'htmlFor',
				'class': 'className'
			},
			attrMapping = {
				'accesskey': 'accessKey',
				'class': 'className',
				'colspan': 'colSpan',
				'for': 'htmlFor',
				'maxlength': 'maxLength',
				'readonly': 'readOnly',
				'rowspan': 'rowSpan',
				'tabindex': 'tabIndex',
				'valign': 'vAlign',
				'cellspacing': 'cellSpacing',
				'cellpadding': 'cellPadding'
			},
			wrapMap = {
				'thead': [1, '<table>', '</table>'],
				'col': [2, '<table><colgroup>', '</colgroup></table>'],
				'tr': [2, '<table><tbody>', '</tbody></table>'],
				'td': [3, '<table><tbody><tr>', '</tr></tbody></table>']
			},

			// Regex
			regexConstructor = /^\[object .+?Constructor\]$/,
			regexNative = new RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&').replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'),
			regexUnit = /^\s*(?:(\d+(?:\.\d+)?)\s*(em|%|px|cm|mm|in|pt|pc|rem|vh|vw|vmin|vmax)|(auto))\s*$/,
			regexCheckable = /^(checkbox|radio)$/i,
			regexSubmitType = /^(submit|button|image|reset|file)$/i,
			regexSubmitName = /^(input|select|textarea|keygen)$/i,
			regexConstructor = /^\[object .+?Constructor\]$/,
			regexSideUnit = /(\d+(?:\.\d+)?\w*)(?:\s+(\d+(?:\.\d+)?\w*))?(?:\s+(\d+(?:\.\d+)?\w*))?(?:\s+(\d+(?:\.\d+)?\w*))?/,
			regexHasValueSet = /(margin|padding)(?:-?(left|top|right|bottom))/i;

	/**
	 * Void0
	 * @constructor
	 * return ElementCollection
	 */
	function Void0(object, context) {
		if (fn.isCallable(object)) {
			fn.ready(object);
			return this;
		} else {
			var collection = new ElementCollection();
			collectElements(object, context, collection);

			// Clear _added flag
			fn.each(collection, function() {
				delete this._added;
			});

			return collection;
		}
	};

	// Void0 Function
	fn = {
		/**
		 * Check to see if an object is defined
		 * @param	{object} object The object that will be checked to see if it's defined.
		 * @return {boolean}
		 */
		isDefined: function(object) {
			return (typeof object != 'undefined');
		},

		/**
		 * Check to see if an object is a native function
		 * @param	{object} object The object that will be checked to see if it's a native function.
		 * @return {boolean}
		 */
		isNative: function(object) {
			var type = typeof object;
			return (type === 'function') ? regexNative.test(Function.prototype.toString.call(object)) : (object && type === 'object' && regexConstructor.test(toString.call(object))) || false;
		},

		/**
		 * Check to see if an object is a callable function
		 * @param	{object} object The object that will be checked to see if it's a callable function.
		 * @return {boolean}
		 */
		isCallable: function(object) {
			return (typeof object == 'function');
		},

		/**
		 * Check to see if an object is an object
		 * @param	{object} object The object that will be checked to see if it's an object.
		 * @return {boolean}
		 */
		isObject: function(object) {
			return typeof object === 'object';
		},

		/**
		 * Check to see if an object is empty
		 * @param	{object} object The object that will be checked to see if it's empty.
		 * @return {boolean}
		 */
		isEmpty: function(object) {
			if (fn.isObject(object)) {
				return Object.keys(object).length === 0;
			} else if (fn.isString(object) && !object) {
				return true;
			} else if (fn.isIterable(object)) {
				return object.length === 0;
			}

			return false;
		},

		/**
		 * Check to see if an object is a boolean
		 * @param	{object} object The object that will be checked to see if it's a boolean.
		 * @return {boolean}
		 */
		isBoolean: function(object) {
			return (typeof object === 'boolean');
		},

		/**
		 * Check to see if an object is a plain object (created using "{}" or "new Object")
		 * @param	{object} object The object that will be checked to see if it's a plain object.
		 * @return {boolean}
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
		 * Check to see if an object is iterable (Array, NodeList or the object has native forEach or native item)
		 * @param	{object} object The object that will be checked to see if it's iterable.
		 * @return {boolean}
		 */
		isIterable: function(object) {
			if (fn.isObject(object)) {
				// Object.getPrototypeOf support IE9
				var prototype = (fn.isDefined(object.__proto__)) ? object.__proto__ : Object.getPrototypeOf(object);
				return (toString.call(object) === '[object Array]' || fn.isNative(prototype.forEach) || fn.isNative(prototype.item));
			}
			return false;
		},

		/**
		 * Check to see if an object is a string
		 * @param	{object} object The object that will be checked to see if it's a string.
		 * @return {boolean}
		 */
		isString: function(object) {
			return (typeof object === 'string');
		},

		/**
		 * Check to see if an object is a numberic
		 * @param	{object} object The object that will be checked to see if it's a numberic.
		 * @return {boolean}
		 */
		isNumber: function(object) {
			return (typeof object === 'number' && isFinite(object));
		},

		/**
		 * Check to see if an object is an array
		 * @param	{object} object The object that will be checked to see if it's an array.
		 * @return {boolean}
		 */
		isArray: function(object) {
			return (object && Array.isArray(object));
		},

		/**
		 * Check to see if an object is a DOM element
		 * @param	{object} object The object that will be checked to see if it's a DOM element.
		 * @return {boolean}
		 */
		isDOMElement: function(object) {
			return object && (object.nodeType == 1 || object.nodeType == 9 || object.nodeType == 11);
		},

		/**
		 * Check to see if an object is a window
		 * @param	{object} object The object that will be checked to see if it's a window.
		 * @return {boolean}
		 */
		isWindow: function(object) {
			return object !== null && object === object.window;
		},

		/**
		 * Check to see if an object is a document element
		 * @param	{object} object The object that will be checked to see if it's a document element.
		 * @return {boolean}
		 */
		isDocument: function(object) {
			return object !== null && object.nodeType && object.nodeType === 9;
		},

		/**
		 * Iterate over an object, executing a function for each item.
		 * @param	{object}	 object	 An object will be iterated.
		 * @param	{Function} callback A function to execute for each item.
		 * @return {Void0}
		 */
		each: function(object, callback) {
			if (!object) {
				return this;
			}

			// Object.getPrototypeOf support IE9
			var prototype = (object.__proto__ || Object.getPrototypeOf(object)),
					index;

			if (fn.isArray(object)) {
				for (index = 0; index < object.length; index++) {
					result = callback.call(object[index], index, object[index], object);
					if (fn.isDefined(result) && !result) {
						break;
					}
				}
			} else if (prototype && prototype.forEach && fn.isNative(prototype.forEach)) {
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
				for (index in object) {
					var result = callback.call(object[index], index, object[index], object);
					if (fn.isDefined(result) && !result) {
						break;
					}
				}
			}
			return this;
		},

		/**
		 * Merge the contents of two or more objects together into the first object.
		 * @param	{object} object			 An object that will receive the new properties if additional objects are passed in
		 * @param	{object} extendObject An object containing additional properties to merge in.
		 * @param	{object} objectN 			Additional objects containing properties to merge in.
		 * @return {object}
		 */
		extend: function(object, extendObject) {
			var args = ary.slice.call(arguments),
					reserved = {},
					deep = args.shift();

			if (fn.isBoolean(deep)) {
				object = args.shift();
			} else {
				object = deep;
				deep = false;
			}

			if (args.length > 0) {
				fn.each(args, function() {
					fn.each(this, function(key, val) {
						if (deep || reserved[key] || !fn.isDefined(object[key])) {
							if (!reserved[key]) {
								reserved[key] = true;
							}
							object[key] = fn.clone(val);
						}
					});
				});
			} else if (fn.isObject(object) && !args.length) {
				extendObject = object;
				object = ElementCollection.prototype;
				fn.each(extendObject, function(key, val) {
					if (!fn.isDefined(object[key])) {
						object[key] = fn.clone(val);
					}
				});
				object = this;
			}

			return object;
		},

		/**
		 * Create a deep copy of the set of object
		 * @param	{object} object An object that will be cloned
		 * @return {object}
		 */
		clone: function(object, shallow) {
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
							result[property] = (shallow) ? object[property] : fn.clone(object[property]);
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
		 * Takes a well-formed JSON string and returns the resulting JavaScript value.
		 * @param	{string} text The JSON string to parse.
		 * @return {object}
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
		 * Takes a well-formed XML string and returns the resulting JavaScript value.
		 * @param	{string} text The XML string to parse.
		 * @return {object}
		 */
		parseXML: function(text) {
			var parser;
			if (!text || !fn.isString(text)) {
				return null;
			}

			try {
				parser = new DOMParser();
			} catch (e) {
				parser = undefined;
			}

			return (!parser || (parser = parser.parseFromString(text, 'text/xml')).getElementsByTagName('parsererror').length) ? null : parser;
		},

		/**
		 * Convert a text to camel case (space, hyphen and underscore will be removed)
		 * @param	{string} text A test to convert to camel case
		 * @return {string}
		 */
		camelCase: function(text) {
			return (text) ? text.toLowerCase().replace(/[\-_\s]([\da-z])/gi, function(str, match) {
				return match.toUpperCase();
			}) : '';
		},

		/**
		 * Compares the position of the current node against another node in any other document.
		 * @param	{DOMElement} a A compare DOMElement
		 * @param	{DOMElement} b Another DOMElement
		 * @return {object}
		 */
		comparePosition: function(a, b) {
			return a.compareDocumentPosition ? a.compareDocumentPosition(b) : a.contains ? (a != b && a.contains(b) && 16) + (a != b && b.contains(a) && 8) + (a.sourceIndex >= 0 && b.sourceIndex >= 0 ? (a.sourceIndex < b.sourceIndex && 4) + (a.sourceIndex > b.sourceIndex && 2) : 1) : 0;
		},

		/**
		 * Create a serialized representation of an array, a plain object,
		 * or a ElementCollection object suitable for use in a URL query
		 * string or Ajax request. In case a ElementCollection object is
		 * passed, it should contain input elements with name/value properties.
		 * @param	{object} data An array, a plain object, or a ElementCollection object to serialize.
		 * @return {string}
		 */
		param: function(data) {
			var params = [],
					datagroup = {};

			function buildQueryString(key, value) {
				value = (fn.isCallable(value)) ? value() : value;
				params.push(key + '=' + encodeURIComponent(value || ''));
			}

			if (data instanceof ElementCollection) {
				data.each(function() {
					if (this.tagName.toLowerCase() === 'select' || regexCheckable.test(this.type) || (regexSubmitName.test(this.tagName) && !regexSubmitType.test(this.type))) {
						datagroup[this.name] = Void0(this).val();
					}
				});
				data = datagroup;
			}

			(function deeprun(data, prefix) {
				fn.each(data, function(key, val) {
					key = (!fn.isArray(data) || fn.isPlainObject(val)) ? encodeURIComponent(key) : '';
					var param = (prefix) ? prefix + '[' + key + ']' : key;

					if (fn.isArray(val) || fn.isPlainObject(val)) {
						deeprun(val, param);
					} else {
						buildQueryString(param, val);
					}
				});
			})(data, '');

			return params.join('&');
		},

		/**
		 * Return the DOMElement's owner
		 * @param	{DOMElement} element A DOMElement to find its owner
		 * @return {object}
		 */
		owner: function(element) {
			var ownerDoc = element.ownerDocument || doc;
			return {
				document: ownerDoc,
				window: ownerDoc.defaultView || ownerDoc.parentWindow
			};
		},


		/**
		 * Convert any common css unit in pixel
		 * @param  {number} base  A base value
		 * @param  {string} value A value with unit to calculate with the base value
		 * @return {number}
		 */
		pxConvert: function(value, base) {
			var base = parseFloat(base) || 0,
					matches = regexUnit.exec(value),
					relativeValue = parseFloat(matches[1]) || 0;

			if (relativeValue === 0) {
				return 0;
			}

			// em|%|px|cm|mm|in|pt|pc|rem|vh|vw|vmin|vmax
			switch (matches[2]) {
				case 'px':
					return matches[2];
					break;
				case 'rem':
				case 'em':
					return base * relativeValue;
					break;
				case '%':
					return base * (relativeValue / 100);
					break;
				case 'cm':
					return relativeValue * 37.8;
					break;
				case 'mm':
					return relativeValue * 3.78;
					break;
				case 'in':
					return relativeValue * 96;
					break;
				case 'pt':
					return relativeValue * 96 / 72;
					break;
				case 'pc':
					return relativeValue * 96 / 12;
					break;
				case 'vw':
				case 'vh':
				case 'vmin':
				case 'vmax':
					return base * (relativeValue / 100);
					break;
				default:
					return base;
			}
		},

		/**
		 * [description]
		 * @param  {[type]} path    [description]
		 * @param  {[type]} noCache [description]
		 * @return {[type]}         [description]
		 */
		template: function(path, noCache) {
			var promise;

			if (fn.isString(path)) {
				path = path.trim();

				// If the path do not contain file extension, default .html
				if (!/(\.[\w\d]+)$/.test(path)) {
					path += '.html';
				}

				promise = Void0.ajax({
					url: path,
					dataType: 'html',
					cache: !noCache
				}).then(function(data) {
					var elem = Void0(data);
					if (elem.length) {
						// If browser supports DocumentFragment
						if ('content' in elem[0]) {
							return Void0(elem[0].content.childNodes);
						} else {
							if (elem[0].tagName.toLowerCase() === 'template') {
								return Void0(elem[0].childNodes);
							}
						}
					}
					return Void0();
				});
			} else {
				promise = new Void0.Promise(function() {});
			}

			return promise;
		},

		/**
		 * [description]
		 * @param  {[type]} path [description]
		 * @return {[type]}      [description]
		 */
		load: function(path) {
			if (!fn.isString(path)) {
				path = '';
			}
			path = path.trim();

			if (!path) {
				return new Void0.Promise(function() {});
			}

			return Void0.ajax({
				url: path,
				dataType: 'text',
				cache: true
			});
		},

		/**
		 * Relinquish Void0's control of the __ variable.
		 * @return {[type]} [description]
		 */
		noConflict: function() {
			global.__ = noConflict;
			return Void0;
		}
	};

	(function() {
		var canvas = doc.createElement('canvas'),
				ctx = canvas.getContext('2d'),
				callbackList = [],
				URLObj = win.URL || win.webkitURL;

		function ClipboardData(object) {
			var self = this;

			this.promise = null;

			if (object.type) {
				if (/text/.test(object.type)) {
					this.type = 'string';
					object.getAsString(function(s) {
						self.data = s;
					});
					this.promise = Void0.Promise.resolve(this);
				} else if (/image/.test(object.type)) {
					this.type = 'image';
					this.data = new Image();

					this.promise = new Void0.Promise(function(resolve, reject) {
						self.data.onload = function() {
	            canvas.width = this.width;
	            canvas.height = this.height;
	            ctx.drawImage(this, 0, 0);
							resolve(self);
		        };

						self.data.src = URLObj.createObjectURL(object.getAsFile());
					});
				}
			}
		}

		ClipboardData.prototype.trigger = function(callback) {
			if (this.promise instanceof Void0.Promise) {
				this.promise.then(callback);
			}
			return this;
		};

		fn.clipboard = function(selector, callback) {
			if (fn.isCallable(selector)) {
				callback = selector;
				selector = '';
			}

			if (!win.eventEmitters || !win.eventEmitters['paste']) {
				Void0(win).on('paste', function(e) {
					if (e.clipboardData) {
						var items = e.clipboardData.items,
								index = 0,
								item,
								data;

						while (item = items[index++]) {
							data = new ClipboardData(item);
							fn.each(callbackList, function() {
								if (!this.selector || (this.selector && Void0(e.target).is(this.selector))) {
									data.trigger(this.callback);
								}
							});
						}
					}
				});
			}

			if (fn.isCallable(callback)) {
				callbackList.push({
					callback: callback,
					selector: selector
				});
			}

			return this;
		};
	})();

	fn.SVG = (function() {
		function SVG(width, height) {
			this.element = Void0(doc.createElement('svg'));
			this.element.attr('width', parseFloat(width) || 0);
			this.element.attr('height', parseFloat(height) || 0);
		}

		SVG.prototype.viewbox = function(x, y, width, height) {
			var viewbox = [parseFloat(x) || 0, parseFloat(y) || 0, parseFloat(width) || 0, parseFloat(height) || 0];
			this.element.attr('viewbox', viewbox.join(' '));
			return this;
		};

		SVG.prototype.append = function(object) {
			if (object instanceof SVG.Path) {
				this.element.append(object);
			}
			return this;
		};

		SVG.Path = function(command) {
			var self = this;

			this.commands = [];

			if (fn.isString(command)) {
				command = command.replace(/\s*([mlvhqczst])\s*/ig, '\n$1 ').replace(/(?:,|(-)| +)/g, ' $1').replace(/ +/g, ' ').trim().split('\n');

				fn.each(command, function() {
					var fragment = this.split(' '),
							commandkey = fragment.shift(),
							setlength;

					if (self.commands.length === 0 && commandkey !== 'M') {
						throw new Error('SVG Path should be started from M');
					} else {
						if (/z/i.test(commandkey)) {
							// No parameters
							return true;
						} else if (/[vh]/i.test(commandkey)) {
							fn.each(fragment, function(i) {
								var dimen = (/v/i.test(commandkey)) ? 'y' : 'x',
										lineToCommand = {
											command: commandkey,
											points: {}
										};

								lineToCommand.points['p3' + dimen] = parseFloat(this) || 0;
								self.commands.push(lineToCommand);
							});
						} else if (/[qclts]/i.test(commandkey)) {
							var slice;
							while ((slice = fragment.splice(0, (/[lt]/i.test(commandkey)) ? 2 : (/[qs]/i.test(commandkey) ? 4 : 6))).length) {
								if (slice.length !== ((/[lt]/i.test(commandkey)) ? 2 : (/[qs]/i.test(commandkey) ? 4 : 6))) {
									throw new Error('Invalid ' + commandkey + ' command');
								}
								var commandset = {
									command: commandkey,
									points: {}
								};
								fn.each(slice, function(i) {
									var pointer = 6 - slice.length + i;
									if (/q/i.test(commandset.command) && pointer < 4) {
										pointer -= 2;
									}
									commandset.points['p' + (Math.floor(pointer / 2) + 1) + 'xy'[pointer % 2]] = parseFloat(this) || 0;
								});
								self.commands.push(commandset);
							}
						} else if (/m/i.test(commandkey)) {
							fragment = fragment.splice(-2, 2);
							if (fragment.length != 2) {
								throw new Error('Invalid ' + commandkey + ' command');
							}
							self.commands.push({
								command: commandkey,
								points: {
									p3x: parseFloat(fragment[0]) || 0,
									p3y: parseFloat(fragment[1]) || 0
								}
							});
						}
					}
				});
			}
		};

		function walkPath(svgpath, callback) {
			var currentPoint,
					previousCommand;

			fn.each(svgpath.commands, function() {
				if (!currentPoint && this.command === 'M') {
					currentPoint = fn.clone(this.points);
					previousCommand = 'M';
				} else if (/[lvhqtzsca]/i.test(this.command) && currentPoint) {
					previousCommand = callback.call(this, this.command === this.command.toUpperCase(), currentPoint, previousCommand);

					// command maybe changed, so we need to check the command is uppercase again
					if (this.command === this.command.toUpperCase()) {
						fn.each(this.points, function(i) {
							currentPoint[i] = this;
						});
					} else {
						currentPoint = {
							p1x: currentPoint.p3x + (this.points.p1x || 0),
							p1y: currentPoint.p3y + (this.points.p1y || 0),
							p2x: currentPoint.p3x + (this.points.p2x || 0),
							p2y: currentPoint.p3y + (this.points.p2y || 0),
							p3x: currentPoint.p3x + (this.points.p3x || 0),
							p3y: currentPoint.p3y + (this.points.p3y || 0)
						};
					}
				} else {
					throw new Error('Missing command M, no start point exists');
				}
			});
		}

		SVG.Path.prototype.moveTo = function(x, y) {
			var adjust,
					movetoPoint = this.commands[0];

			x = parseFloat(x) || 0;
			y = parseFloat(y) || 0;

			if (movetoPoint.command === 'M') {
				adjust = {
					x: x - movetoPoint.points.p3x,
					y: y - movetoPoint.points.p3y
				};
				movetoPoint.points.p3x = x;
				movetoPoint.points.p3y = y;

				walkPath(this, function(isAbsolute, currentPoint, previousCommand) {
					if (isAbsolute) {
						var index = 0,
								point,
								dimen;

						for (; index < 6; index++) {
							dimen = 'xy'[index % 2];
							point = 'p' + (Math.floor(index / 2) + 1) + dimen;

							if (fn.isDefined(this.points[point])) {
								this.points[point] = this.points[point] + adjust[dimen];
							}
						}
					}

					return this.command;
				});
			}

			return this;
		};

		SVG.Path.prototype.exportAsString = function(shortern) {
			var commandString = '';
			fn.each(this.commands, function() {
				var index = 0,
						point,
						first = true;

				commandString += (shortern ? '' : ' ') + this.command;
				for (; index < 6; index++) {
					point = 'p' + (Math.floor(index / 2) + 1) + 'xy'[index % 2];
					if (fn.isDefined(this.points[point])) {
						commandString += ((shortern) ? (this.points[point] < 0 || first ? '' : ',') : (first ? '' : ' ')) + this.points[point].toFixed(2).replace(/(0+|\.0+)$/, '');
						first = false;
					}
				}
			});
			return commandString.trim();
		};

		SVG.Path.prototype.convertToCurve = function() {
			walkPath(this, function(isAbsolute, currentPoint, previousCommand) {
				var returnCommand = this.command,
						converted = false,
						self = this;

				if (/[vhl]/i.test(this.command)) {
					this.points.p1x = (!isAbsolute) ? 0 : currentPoint.p3x;
					this.points.p1y = (!isAbsolute) ? 0 : currentPoint.p3y;
					this.points.p2x = this.points.p3x;
					this.points.p2y = this.points.p3y;
					if (this.command === 'v' || this.command === 'V') {
						this.points.p3x = (!isAbsolute) ? 0 : currentPoint.p3x;
						this.points.p3y = (!isAbsolute) ? this.points.p3y : this.points.p3y + currentPoint.p3y;
					} else if (this.command === 'h' || this.command === 'H') {
						this.points.p3x = (!isAbsolute) ? this.points.p3x : this.points.p3x + currentPoint.p3x;
						this.points.p3y = (!isAbsolute) ? 0 : previous.p3y;
					}
					converted = true;
				} else if (/[st]/i.test(this.command)) {
					if (!/[cs]/i.test(previousCommand) && /s/i.test(this.command)) {
						throw new Error('Cannot convert s command beacuse there is no c command for reference.');
					}
					if (!/[qt]/i.test(previousCommand) && /t/i.test(this.command)) {
						throw new Error('Cannot convert t command beacuse there is no q command for reference.');
					}

					for (var i = 0; i < ((/s/i.test(this.command)) ? 2 : 4); i++) {
						var point = 'p' + (Math.floor(i / 2) + 1) + 'xy'[i % 2],
								refer = 'p' + (Math.floor((3 - i) / 2) + 1) + 'xy'[i % 2],
								base = 'p3' + 'xy'[i % 2];

						self.points[point] = (!isAbsolute) ? currentPoint[base] - currentPoint[refer] : currentPoint[base] + (currentPoint[base] - currentPoint[refer]);
					}
					converted = true;
				} else if (this.command === 'q' || this.command === 'Q') {
					// Convert quadratic bezier to a cubic bezier
					var quad = {
						x: this.points.p1x,
						y: this.points.p1y
					};

					fn.each({
						'p1x p1y': currentPoint,
						'p2x p2y': this.points
					}, function(pos, refer) {
						fn.each(pos.split(' '), function(i) {
							var dimen = 'xy'[i % 2],
									point = refer['p3' + dimen];

							self.points[this] = point + (quad[dimen] - point) * (2 / 3);
						});
					});
					converted = true;
				}

				if (converted) {
					this.command = (isAbsolute) ? 'C' : 'c';
				}

				return returnCommand;
			});

			return this;
		};

		SVG.Path.prototype.convertToAbsolute = function() {
			walkPath(this, function(isAbsolute, currentPoint, previousCommand) {
				var converted = false;

				if (/[lvhqtzsca]/i.test(this.command) && currentPoint) {
					if (/[vlstqc]/.test(this.command)) {
						this.points.p3y += currentPoint.p3y || 0;
					}
					if (/[hlstqc]/.test(this.command)) {
						this.points.p3x += currentPoint.p3x || 0;
					}
					if (/[stc]/.test(this.command)) {
						this.points.p2x += currentPoint.p3x || 0;
						this.points.p2y += currentPoint.p3y || 0;
					}
					if (/[qc]/.test(this.command)) {
						this.points.p1x += currentPoint.p3x || 0;
						this.points.p1y += currentPoint.p3y || 0;
					}
					this.command = this.command.toUpperCase();
				}

				return this.command;
			});

			return this;
		};

		SVG.Path.prototype.convertToRelative = function() {
			walkPath(this, function(isAbsolute, currentPoint, previousCommand) {
				var converted = false;

				if (/[lvhqtzsca]/i.test(this.command) && currentPoint) {
					if (/[VLSTQC]/.test(this.command)) {
						this.points.p3y -= currentPoint.p3y || 0;
					}
					if (/[HLSTQC]/.test(this.command)) {
						this.points.p3x -= currentPoint.p3x || 0;
					}
					if (/[STC]/.test(this.command)) {
						this.points.p2x -= currentPoint.p3x || 0;
						this.points.p2y -= currentPoint.p3y || 0;
					}
					if (/[QC]/.test(this.command)) {
						this.points.p1x -= currentPoint.p3x || 0;
						this.points.p1y -= currentPoint.p3y || 0;
					}
					this.command = this.command.toLowerCase();
				}

				return this.command;
			});

			return this;
		};

		return SVG;
	})();

	fn.CubicBezier = (function() {
		var pathCache = {};

		/**
		 * CubicBezier Object uses to calculate the easing effect
		 * @param			 {float} p1x Point0 (Start Point) or a string of SVG path command
		 * @param			 {float} p1y Point1 (Control of p0)
		 * @param			 {float} p2x Point2 (Control of p3)
		 * @param			 {float} p2y Point3 (End Point)
		 * @constructor
		 */
		function CubicBezier(p1x, p1y, p2x, p2y) {
			var self = this,
					path,
					initX,
					ratioX,
					ratioY,
					xLength,
					startpoint;

			this.lastStep = 0;
			this.controls = [];
			this.path = null;

			if (fn.isString(p1x) && (p1x = p1x.trim())) {
				if (!pathCache[p1x]) {
					path = new fn.SVG.Path(p1x);
					if (path.commands.length < 2 || path.commands[0].command !== 'M') {
						throw new Error('Invalid SVG path');
					}
					path.convertToCurve().convertToRelative();

					fn.each(path.commands, function() {
						var xLength,
								pointset;

						if (this.command === 'M') {
							startpoint = {x: this.points.p3x, y: 0};
							ratioX = startpoint.x;
							initX = ratioX;
						} else {
							if (this.command !== 'c') {
								throw new Error('Invalid SVG path for Cubic Bezier');
							}

							xLength = this.points.p3x;
							pointset = {
								p0: startpoint,
								p1: {
									x: this.points.p1x / xLength,
									y: startpoint.y - this.points.p1y
								},
								p2: {
									x: this.points.p2x / xLength,
									y: startpoint.y - this.points.p2y
								},
								p3: {
									x: startpoint.x + xLength,
									y: startpoint.y - this.points.p3y
								},
								samples: null
							};

							// if p1x < p0x or p2x > p3x, it may cause the overlayed t
							if (pointset.p1.x < 0 || pointset.p2.x > 1) {
								throw new Error('Invalid cubic bezier curve');
							}

							if (pointset.p3.x <= ratioX) {
								throw new Error('Current start point x less than previous point x.');
							} else {
								ratioX = pointset.p3.x;
							}
							startpoint = fn.clone(pointset.p3);
							self.controls.push(pointset);
						}
					});

					ratioX -= initX;
					ratioY = startpoint.y;

					// Scale all x, y by 1:1
					fn.each(self.controls, function(i) {
						self.controls[i].p0.x = (self.controls[i].p0.x - initX) / ratioX;
						self.controls[i].p3.x = (self.controls[i].p3.x - initX) / ratioX;

						self.controls[i].p1.x = self.controls[i].p0.x + (self.controls[i].p1.x * (self.controls[i].p3.x - self.controls[i].p0.x));
						self.controls[i].p2.x = self.controls[i].p0.x + (self.controls[i].p2.x * (self.controls[i].p3.x - self.controls[i].p0.x));

						self.controls[i].p0.y /= ratioY;
						self.controls[i].p1.y /= ratioY;
						self.controls[i].p2.y /= ratioY;
						self.controls[i].p3.y /= ratioY;
					});

					this.controls[self.controls.length - 1].p3 = {x: 1, y: 1};
					pathCache[p1x] = {
						path: path,
						controls: self.controls
					};
					this.path = path;
				} else {
					this.controls = pathCache[p1x].controls;
					this.path = pathCache[p1x].path;
				}
			} else {
				p1x = parseFloat(p1x) || 0;
				p1y = parseFloat(p1y) || 0;
				p2x = parseFloat(p2x) || 0;
				p2y = parseFloat(p2y) || 0;
				var command = 'M0 0 c' + p1x + ' ' + p1y + ' ' + p2x + ' ' + p2y + ' 1 1';

				if (!pathCache[command]) {
					this.isCustom = false;
					this.path = new fn.SVG.Path(command);
					self.controls.push({
						p0: {x: 0, y: 0},
						p1: {x: p1x, y: p1y},
						p2: {x: p2x, y: p2y},
						p3: {x: 1, y: 1},
						samples: null
					});

					pathCache[command] = {
						path: path,
						controls: self.controls
					};
				} else {
					this.controls = pathCache[command].controls;
					this.path = pathCache[command].path;
				}
			}
		}

		// {p0, p1, p2, p3}	 *		[ 1	0	0	0] = D
		// 												[-3	 3	0	 0] = C
		//												[ 3 -6	3	 0] = B
		//												[-1	 3 -3	1] = A
		function a(point1, control1, control2, point2) {
			return point2 - 3 * control2 + 3 * control1 - point1;
		}

		function b(point1, control1, control2) {
			return 3 * control2 - 6 * control1 + 3 * point1;
		}

		function c(point1, control1) {
			return 3 * control1 - 3 * point1;
		}

		function calcBezier(t, p, axis) {
			return ((a(p.p0[axis], p.p1[axis], p.p2[axis], p.p3[axis]) * t + b(p.p0[axis], p.p1[axis], p.p2[axis])) * t + c(p.p0[axis], p.p1[axis])) * t + p.p0[axis];
		}

		function getSlope(t, p, axis) {
			return 3.0 * a(p.p0[axis], p.p1[axis], p.p2[axis], p.p3[axis]) * t * t + 2.0 * b(p.p0[axis], p.p1[axis], p.p2[axis]) * t + c(p.p0[axis], p.p1[axis]);
		}

		function getTForX(x, p) {
			var intervalStart = 0,
					currentValue = 0,
					lastSample = 10,
					dist,
					t = x;

			if (!p.samples) {
				p.samples = (typeof Float32Array !== 'undefined' && fn.isCallable(Float32Array)) ? new Float32Array(11) : new Array(11);
				for (i = 0; i < 11; ++i) {
					p.samples[i] = calcBezier(i * 0.1, p, 'x');
				}
			}

			fn.each(p.samples, function(i, value) {
				if (i && i != p.samples.length - 1) {
					if (value <= x) {
						currentValue = value;
						intervalStart = i * .1;
					} else {
						dist = (x - currentValue) / (value - currentValue);
						return false;
					}
				}
			});

			if (!dist) {
				dist = (x - currentValue) / (p.samples[p.samples.length - 1] - currentValue);
			}

			t = intervalStart + dist * .1;

			// Newton raphson iteration
			for (var i = 0; i < 4; ++i) {
				var currentSlope = getSlope(t, p, 'x'),
						currentX;

				if (currentSlope == 0.0) {
					return t;
				}

				currentX = calcBezier(t, p, 'x') - x;
				t -= currentX / currentSlope;
			}

			return t;
		}

		/**
		 * Calculate the value on the specified timeline.
		 * @param	{float} value A value will be calculated
		 * @param	{float} t		 A timeline to calculate with the value
		 * @return {float}
		 */
		CubicBezier.prototype.progress = function(value, t) {
			if (t <= 0) {
				return 0;
			} else if (t >= 1) {
				if (this.controls.length) {
					return this.controls[this.controls.length - 1].p3.y * value;
				} else {
					return 0;
				}
			}

			var ctls = this.controls;
			if (ctls.length) {
				var step = this.lastStep;

				while (ctls[step]) {
					if (ctls[step].p0.x <= t && ctls[step].p3.x >= t) {
						break;
					} else if (ctls[step].p0.x > t) {
						step--;
					} else if (ctls[step].p3.x < t) {
						step++;
					}
				}

				this.lastStep = step;

				return calcBezier(getTForX(t, ctls[step], this), ctls[step], 'y', this) * value;
			}
			return 0;
		};

		CubicBezier.prototype.rescale = function() {
			var steps = (arguments.length) ? ary.slice.call(arguments) : null,
					total = 0,
					p0x = 0,
					previous = {
						p1x: 0,
						p2x: 0
					},
					self = this;

			if (steps && this.controls.length !== steps.length) {
				throw new Error('You should provide ' + this.controls.length + ' steps to rescale the cubic bezier timeline.');
			} else if (this.controls.length > 2) {
				fn.each(steps, function() {
					total += (parseFloat(this) || 0);
					if (total > 1) {
						return false;
					}
				});

				if (steps && total !== 1) {
					throw new Error('The sum of all timelines must equal 1.');
				} else {
					fn.each(this.controls, function(i) {
						var orgDiff = this.p3.x - this.p0.x,
								newDiff,
								ratio;

						previous.p1x = (this.p1.x - this.p0.x) / orgDiff;
						previous.p2x = (this.p2.x - this.p0.x) / orgDiff;

						this.p0.x = p0x;
						p0x += (i === self.controls.length - 1) ? 1 - p0x : ((steps) ? steps[i] : 1 / self.controls.length);
						this.p3.x = p0x;

						newDiff = this.p3.x - this.p0.x;
						this.p1.x = this.p0.x + newDiff * previous.p1x;
						this.p2.x = this.p0.x + newDiff * previous.p2x;
						ratio = newDiff / orgDiff;

						// Rescale the original path
						self.path.commands[i + 1].points.p1x *= ratio;
						self.path.commands[i + 1].points.p2x *= ratio;
						self.path.commands[i + 1].points.p3x *= ratio;
					});
					// Reset the sample table
					this.samples = null;
				}
			}
			return this;
		};

		fn.each({
			easeInSine: [0.47, 0, 0.745, 0.715],
			easeOutSine: [0.39, 0.575, 0.565, 1],
			easeInOutSine: [0.445, 0.05, 0.55, 0.95],
			easeInQuad: [0.55, 0.085, 0.68, 0.53],
			easeOutQuad: [0.25, 0.46, 0.45, 0.94],
			easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
			easeInCubic: [0.55, 0.055, 0.675, 0.19],
			easeOutCubic: [0.215, 0.61, 0.355, 1],
			easeInOutCubic: [0.645, 0.045, 0.355, 1],
			easeInQuart: [0.895, 0.03, 0.685, 0.22],
			easeOutQuart: [0.165, 0.84, 0.44, 1],
			easeInOutQuart: [0.77, 0, 0.175, 1],
			easeInQuint: [0.755, 0.05, 0.855, 0.06],
			easeOutQuint: [0.23, 1, 0.32, 1],
			easeInOutQuint: [0.86, 0, 0.07, 1],
			easeInExpo: [0.95, 0.05, 0.795, 0.035],
			easeOutExpo: [0.19, 1, 0.22, 1],
			easeInOutExpo: [1, 0, 0, 1],
			easeInCirc: [0.6, 0.04, 0.98, 0.335],
			easeOutCirc: [0.075, 0.82, 0.165, 1],
			easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
			easeInBack: [0.6, -0.28, 0.735, 0.045],
			easeOutBack: [0.175, 0.885, 0.32, 1.275],
			easeInOutBack: [0.68, -0.55, 0.265, 1.55]
		}, function(easing, bezier) {
			CubicBezier[easing] = function() {
				return new CubicBezier(bezier[0], bezier[1], bezier[2], bezier[3]);
			};
		});

		// Convert SVG path to multple points Cubic Bezier
		fn.each({
			easeInElastic: 'M0,0c0,0,11.9-1,20,0c7.7,0.9,12.7,0.9,20,0c7.2-0.9,14-3,20,0c5.7,2.8,8,5,14,0s13-15,19,0c10,25,13,32,17,0s6-50,9-60',
			easeOutElastic: 'M0,0c3-10,5-28,9-60s7-25,17,0c6,15,13,5,19,0s8.3-2.8,14,0c6,3,12.8,0.9,20,0c7.3-0.9,12.3-0.9,20,0c8.1,1,20,0,20,0',
			easeInOutElastic: 'M0,91.5c0,0,11.9-1,20,0c7.7,0.9,12.7,0.9,20,0c7.2-0.9,14-3,20,0c5.7,2.8,8,5,14,0s13-15,19,0c10,25,13,32,17,0S124,54,128,22c4-32,7-25,17,0c6,15,13,5,19,0s8.3-2.8,14,0c6,3,12.8,0.9,20,0c7.3-0.9,12.3-0.9,20,0c8.1,1,20,0,20,0',
			easeInBounce: 'M0,0c5-2,6-2,11,0c7-5,13-5,21,0c14-20,30-20,44,0c7-20,23-57,44-57',
			easeOutBounce: 'M0,0c21,0,37-37,44-57c14,20,30,20,44,0c8,5,14,5,21,0c5,2,6,2,11,0',
			easeInOutBounce: 'M0,0c3.2-2,3.9-2,7.1,0c3.2-3.6,5.6-3.8,9.5,0c4.2-9.3,16.1-9.3,20.3,0c4.5-20,12.3-22,19.7-28s19.1-10,23.6-30c4.2,9.3,16.1,9.3,20.3,0c3.9,3.8,6.3,3.6,9.5,0c3.2,2,3.9,2,7.1,0'
		}, function(easing, bezier) {
			CubicBezier[easing] = function() {
				return new CubicBezier(bezier);
			};
		});

		return CubicBezier;
	})();

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
		 * Takes a well-formed URL Query string and returns the resulting JavaScript value.
		 * @param	{string} query [description]
		 * @return {object}			 [description]
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

		/**
		 * Specify a function to execute when the DOM is fully loaded.
		 * @param  {Function} callback A function to exceute when the DOM is fully loaded
		 * @return {Void0}
		 */
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

		/**
		 * Holds or releases the execution of Void0's ready event.
		 * @param  {boolean} enable Indicates whether the ready hold is being requested or released
		 * @return {Void0}
		 */
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

	fn.extend(Void0, fn);

	// ElementCollection
	var ElementCollection = (function() {
		/**
		 * A set of matched elements with a number of function
		 * @param			 {object} elements A string of selector, iterable object, DOMElement or callable function
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

		var defaultPrototype;

		defaultPrototype = {
			push: ary.push,
			indexOf: ary.indexOf,
			forEach: ary.forEach,
			some: ary.some,
			length: 0,

			// Add ElementCollection function here, assume chainable
			// Usage: Void0(selector).function([...args]);

			/**
			 * Iterate over a ElementCollection object, executing a function
			 * for each matched element.
			 * @param	{Function} callback A function to execute for each matched element.
			 * @return {ElementCollection}
			 */
			each: function(callback) {
				fn.each(this, callback);
				return this;
			},

			/**
			 * Get the value of a computed style property for the first element
			 * in the set of matched elements or set one or more CSS properties
			 * for every matched element.
			 * @param	{string} css	 A CSS property or An array of one or more CSS properties.
			 * @param	{object} value A value to set for the property.
			 * @return {ElementCollection}
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
			 * Reset the specified style for every matched element
			 * @param	{string} css A CSS property
			 * @return {ElementCollection}
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
			 * Determine whether any of the matched elements are assigned the given class.
			 * @param	{string} classname The class name to search for.
			 * @return {ElementCollection}					 [description]
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
			 * Add or remove one or more classes from each element in the
			 * set of matched elements, depending on either the class’s
			 * presence or the value of the state argument.
			 * @param	{string} classname	 One or more class names (separated by spaces) to be toggled for each element in the matched set.
			 * @param	{boolean} addorremove A Boolean (not just truthy/falsy) value to determine whether the class should be added or removed.
			 * @return {ElementCollection}
			 */
			toggleClass: function(classname, addorremove) {
				fn.each(this, function(i, elem) {
					classname = (fn.isCallable(classname)) ? classname.call(this.className, i, this.className) : classname;
					fn.each(classname.split(' '), function() {
						if ((fn.isDefined(addorremove) && addorremove) || (!fn.isDefined(addorremove) && !Void0(elem).hasClass(this))) {
							Void0(elem).addClass(this);
						} else {
							Void0(elem).removeClass(this);
						}
						if (!elem.className) {
							elem.removeAttribute('class');
						}
					});
				});
				return this;
			},

			/**
			 * Get the HTML contents of the first element in the set of
			 * matched elements or set the HTML contents of every matched element.
			 * @param	{string} html A string of HTML to set as the content of each matched element.
			 * @return {ElementCollection}
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
			 * Shift a DOMElement (first element) and return as an ElementCollection
			 * @return {ElementCollection}
			 */
			shift: function(callback) {
				if (!this.length) {
					return this;
				}

				if (fn.isDefined(callback) && fn.isCallable(callback)) {
					var elem = ary.shift.call(this);
					callback.call(Void0(elem));
					return this;
				} else {
					return Void0(this[0]);
				}
			},

			/**
			 * Pop a DOMElement (last element) and return as an ElementCollection
			 * @return {ElementCollection}
			 */
			pop: function(callback) {
				if (!this.length) {
					return this;
				}

				if (fn.isDefined(callback) && fn.isCallable(callback)) {
					var elem = ary.pop.call(this);
					callback.call(Void0(elem));
					return this;
				} else {
					return Void0(this[this.length - 1]);
				}
			},

			/**
			 * Slice the ElementCollection and return as an ElementCollection
			 * @param	{int}	 start		Zero-based index at which to begin extraction.
			 * @param	{int}	 end			Zero-based index before which to end extraction.
			 * @param	{Function} callback A function to execute the sliced a set of matched element, and return the rest as an ElementCollection
			 * @return {ElementCollection}
			 */
			slice: function(start, end, callback) {
				if (!this.length) {
					return this;
				}

				if (fn.isDefined(callback) && fn.isCallable(callback)) {
					var elem = ary.slice.call(this, start, end);
					callback.call(Void0(elem));
					return this;
				} else {
					return Void0(ary.slice.call(this, start, end));
				}
			},

			/**
			 * Check the current matched set of elements against a selector,
			 * element, or Void0 object and return true if at least one of
			 * these elements matches the given arguments.
			 * @param	{object} selector A string containing a selector expression to match elements against.
			 * @return {boolean}
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
						selector = Void0(selector);
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
			 * Get the descendants of each element in the current set of
			 * matched elements, filtered by a selector, Void0 object, or element.
			 * @param	{string} selector A string containing a selector expression to match elements against.
			 * @return {ElementCollection}
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
			 * Get the children of each element in the set of
			 * matched elements, optionally filtered by a selector.
			 * @param	{string} selector [description]
			 * @return {ElementCollection}					[description]
			 */
			children: function(selector) {
				var collection = new ElementCollection();

				if (this.length) {
					fn.each(this, function() {
						fn.each(this.children, function() {
							if (!this._added) {
								this._added = true;
								collection.push(this);
							}
						});
					});

					// Clear _added flag
					fn.each(collection, function() {
						delete this._added;
					});
				}

				return collection;
			},

			/**
			 * Get the value of an attribute for the first element
			 * in the set of matched elements or set one or more
			 * attributes for every matched element.
			 * @param  {string} attr  The name of the attribute to get.
			 * @param  {object} value A value to set for the attribute. If null, the specified attribute will be removed (as in .removeAttr()).
			 * @return {ElementCollection}
			 */
			attr: function(attr, value) {
				var self = this;
				if (fn.isPlainObject(attr)) {
					fn.each(attr, function(attribute, val) {
						self.attr(attribute, val);
					});
				} else {
					if (fn.isDefined(value)) {
						if (value === null) {
							this.removeAttr(attr);
						} else {
							fn.each(this, function() {
								var newValue = (fn.isCallable(value)) ? value.call(Void0(this).attr(attr)) : value;
								if (this.setAttribute) {
									this.setAttribute(attr, newValue);
								} else {
									this[attrMapping[attr.toLowerCase()] || attr] = newValue;
								}
							});
						}
					} else {
						if (this.length) {
							return (fn.isIE || !this[0].getAttribute) ? this[0][attrMapping[attr.toLowerCase()] || attr] : this[0].getAttribute(attr, 2);
						}
						return null;
					}
				}
				return this;
			},

			/**
			 * Remove an attribute from each element in the set of matched elements.
			 * @param  {string} attr An attribute to remove, it can be a space-separated list of attributes.
			 * @return {ElementCollection}
			 */
			removeAttr: function(attr) {
				if (fn.isString(attr)) {
					fn.each(this, function(i, elem) {
						fn.each(attr.split(' '), function() {
							if (elem.removeAttribute) {
								elem.removeAttribute(this);
							}
						});
					});
				}
				return this;
			},

			/**
			 * Get the value of a property for the first element
			 * in the set of matched elements or set one or more
			 * properties for every matched element.
			 * @param  {string} prop  The name of the property to get.
			 * @param  {object} value A value to set for the property. If null, the specified property will be removed (as in .removeProp()).
			 * @return {ElementCollection}
			 */
			prop: function(prop, value) {
				var elem, self = this;
				if (fn.isPlainObject(prop)) {
					fn.each(prop, function(pp, val) {
						self.prop(pp, val);
					});
				} else {
					if (fn.isDefined(value)) {
						fn.each(this, function(i) {
							var pp = propMapping[prop] || prop;
							this[pp] = (fn.isCallable(value)) ? value.call(this, i, Void0(this).prop(prop)) : value;
						});
					} else {
						if (this.length) {
							return this[0][propMapping[prop] || prop];
						}
						return null;
					}
				}
				return this;
			},

			/**
			 * Remove a property from each element in the set of matched elements.
			 * @param  {string} prop A property to remove, it can be a space-separated list of properties.
			 * @return {ElementCollection}      [description]
			 */
			removeProp: function(prop) {
				if (fn.isString(prop)) {
					fn.each(this, function(i, elem) {
						fn.each(prop.split(' '), function() {
							delete elem[this];
						});
					});
				}
				return this;
			},

			/**
			 * Get the combined text contents of each element in
			 * the set of matched elements, including their descendants,
			 * or set the text contents of the matched elements.
			 * @param	{string} value The text to set as the content of each matched element. When Number or Boolean is supplied, it will be converted to a String representation.
			 * @return {ElementCollection}
			 */
			text: function(value) {
				if (fn.isDefined(value)) {
					fn.each(this, function(i) {
						this.innerText = (fn.isCallable(value)) ? value.call(this.innerText, i, Void0(this).text()) : value;
					});
					return this;
				} else {
					if (this.length) {
						if (fn.isDefined(this[0].type) && this[0].type.indexOf('select') !== -1) {
							return this[0].options[this[0].selectedIndex].innerText;
						}
						return this[0].innerText;
					}
					return '';
				}
			},

			/**
			 * Get the current value of the first element in the
			 * set of matched elements or set the value of every
			 * matched element.
			 * @param	{string} value A string of text, a number, or an array of strings corresponding to the value of each matched element to set as selected/checked.
			 * @return {ElementCollection}
			 */
			val: function(value) {
				if (fn.isDefined(value)) {
					fn.each(this, function() {
						var parent;
						if (regexCheckable.test(this.type)) {
							parent = Void0(fn.owner(this).document.body);
							parent.find('input[type=' + this.type + '][name="' + this.name + '"]').checked(false).filter(function() {
								return value.indexOf(this.value) !== -1;
							}).checked(true);
						} else if (this.tagName.toLowerCase() == 'select') {
							value = (this.type === 'select-multiple' && !fn.isIterable(value)) ? [value] : ((fn.isIterable(value)) ? value.slice(0, 1) : value);
							Void0(this).find('option').prop('selected', false).filter(function() {
								return value.indexOf(this.value) !== -1;
							}).prop('selected', true);
						} else {
							this.value = (fn.isCallable(value)) ? value.call(this, i, Void0(this).val()) : value;
							Void0(this).attr('value', value);
						}
						// Trigger onChange event
						Void0(this).change();
					});
					return this;
				} else {
					if (this.length) {
						var elem = this[0],
								parent,
								selector = 'input[type=' + elem.type + '][name="' + elem.name + '"]:checked',
								result;

						if (regexCheckable.test(elem.type)) {
							parent = Void0(fn.owner(this).document.body);
							return parent.find(selector).prop('value');
						} else if (elem.tagName.toLowerCase() === 'select') {
							if (elem.type === 'select-multiple') {
								result = [];
								Void0(elem).find('option:checked').each(function() {
									result.push(this.value);
								});
								return result;
							} else {
								return Void0(elem).find('option:checked').prop('value');
							}
						} else if (regexSubmitName.test(elem.tagName) && !regexSubmitType.test(elem.type)) {
							return elem.value;
						} else {
							return Void0(elem).prop('value');
						}
					}
					return null;
				}
			},

			/**
			 * Reduce the set of matched elements to those that
			 * match the selector or pass the function’s test.
			 * @param  {string} callback A string containing a selector expression to match the current set of elements against.
			 * @return {ElementCollection}
			 */
			filter: function(callback) {
				var collection = new ElementCollection();
				if (this.length && fn.isCallable(callback)) {
					fn.each(this, function() {
						if (callback.call(this)) {
							collection.push(this);
						}
					});
					return collection;
				}
				return this;
			},

			/**
			 * [description]
			 * @param  {[type]} value [description]
			 * @return {[type]}       [description]
			 */
			checked: function(value) {
				if (fn.isDefined(value)) {
					fn.each(this.filter(function() {
						return regexCheckable.test(this.type);
					}), function(i) {
						this.checked = ((fn.isCallable(value)) ? value.call(this, i, this.checked) : value) ? true : false;
					});
					return this;
				} else {
					return (this.length) ? !!this[0].checked : false;
				}
			},

			/**
			 * [description]
			 * @return {[type]} [description]
			 */
			detach: function() {
				fn.each(this, function() {
					if (this.parentNode) {
						this.parentNode.removeChild(this);
					}
				});
				return this;
			},

			/**
			 * [description]
			 * @return {[type]} [description]
			 */
			hide: function() {
				fn.each(this, function(i, elem) {
					elem = Void0(elem);
					elem.css('display', function(i, value) {
						if (value !== 'none') {
							this._defaultdisplay = elem.css('display');
							return 'none';
						}
						return this;
					});
				});
				return this;
			},

			/**
			 * [description]
			 * @return {[type]} [description]
			 */
			show: function() {
				fn.each(this, function(i, elem) {
					elem = Void0(elem);
					elem.css('display', function(i, value) {
						if (value === 'none') {
							return (this.defaultDisplay || 'block');
						}
						return this;
					});
				});

				return this;
			},

			/**
			 * [description]
			 * @return {[type]} [description]
			 */
			rectbox: function() {
				var rect,
						rectbox = {},
						winElem = Void0(win),
						zone = {
							width: winElem.width(),
							height: winElem.height()
						};

				if (this.length) {
					rect = this[0].getBoundingClientRect();

					rectbox = {
						x: rect.x || rect.left,
						y: rect.y || rect.top,
						width: rect.width || rect.right - rect.left,
						height: rect.height || rect.height - rect.bottom,
						left: rect.left,
						right: rect.right,
						top: rect.top,
						bottom: rect.bottom,
						appearOnScreen: false
					};

					rectbox.pageX = rectbox.x + win.pageXOffset;
					rectbox.pageY = rectbox.y + win.pageYOffset;

					rectbox.exposeXRatio = Math.max(0, Math.min(1, (zone.width - rectbox.x) / (zone.width + rectbox.width)));

					rectbox.exposeYRatio = Math.max(0, Math.min(1, (zone.height - rectbox.y) / (zone.height + rectbox.height)));


					if (rectbox.y < zone.height && rectbox.y + rectbox.height > 0 && rectbox.x < zone.width && rectbox.x + rectbox.width > 0) {
						rectbox.appearOnScreen = true;
					}

					return rectbox;
				}
				return null;
			},

			/**
			 * [description]
			 * @param	{[type]} selector [description]
			 * @return {[type]}					[description]
			 */
			parent: function(selector) {
				if (this.length) {
					var elem = this[0];
					while (!!(elem = elem.parentNode)) {
						if (!selector || Void0(elem).is(selector)) {
							return Void0(elem);
						}
					}
				}
				return Void0();
			},

			/**
			 * [description]
			 * @return {[type]} [description]
			 */
			isActive: function() {
				if (this.length) {
					if (doc.activeElement === this[0]) {
						return true;
					}
				}
				return false;
			},

			/**
			 * [description]
			 * @param  {[type]} x [description]
			 * @param  {[type]} y [description]
			 * @return {[type]}   [description]
			 */
			scrollTo: function(x, y) {
				if (fn.isDefined(x)) {
					if (x instanceof ElementCollection || fn.isDOMElement(x)) {
						this.scrollTop(x).scrollLeft(x);
					} else {
						if (fn.isDefined(y)) {
							this.scrollTop(parseInt(y) || 0);
						}
						this.scrollLeft(parseInt(x) || 0);
					}
					return this;
				} else {
					return {
						x: this.scrollLeft(),
						y: this.scrollTop()
					};
				}
			},

			/**
			 * [description]
			 * @return {[type]} [description]
			 */
			formdata: function() {
				var elem,
						formset,
						formdata = (FormData) ? new FormData() : {};

				if (this.length) {
					elem = this[0]
					formset = (elem.nodeName.toLowerCase() === 'form' && elem.elements) ? elem.elements : Void0(elem).find('*');

					Void0(formset).filter(function() {
						return (regexSubmitName.test(this.tagName) && !regexSubmitType.test(this.type) && !this.disabled && (!regexCheckable.test(this.type)) || this.checked);
					}).each(function(i, elem) {
						if (FormData) {
							formdata.set(elem.name, elem.value);
						} else {
							formdata[elem.name] = elem.value;
						}
					});
				}

				return formdata;
			}
		};

		fn.each({
			scrollTop: 'height',
			scrollLeft: 'width'
		}, function(name, prop) {
				var direction = name.substring(-2).toLowerCase(),
						xyOffset = (direction == 'top') ? 'pageYOffset' : 'pageXOffset';

			/**
			 * [description]
			 * @param  {[type]} value [description]
			 * @return {[type]}       [description]
			 */
			defaultPrototype[name] = function(value) {
				var position = 0,
						elem;
				if (fn.isDefined(value)) {
					if (value instanceof ElementCollection) {
						value = value[0];
					}

					if (fn.isDOMElement(value)) {
						value = Void0(value).rectbox()[direction] + this[name]() - this.rectbox()[direction];
						if (value < 0) {
							value = 0;
						}
					} else if (fn.isString(value) || fn.isString(value)) {
						value = parseInt(value) || 0;
					}

					fn.each(this, function(i, elem) {
						var newValue = (fn.isCallable(value)) ? value.call(elem, i, Void0(this)[name]()) : value;

						if (fn.isWindow(elem)) {
							elem[xyOffset] = newValue;
						} else if (fn.isDocument(elem)) {
							elem.body[name] = newValue;
						} else if (fn.isDOMElement(elem)) {
							elem[name] = newValue;
						}
					});
					return this;
				} else {
					if (!this.length) {
						return 0;
					}
					elem = this[0];
					if (fn.isWindow(elem)) {
						position = elem[xyOffset];
					} else if (fn.isDocument(elem)) {
						position = elem.documentElement[name] || elem.body[name] || 0;
					} else if (fn.isDOMElement(elem)) {
						position = elem[name] || 0;
					}
					return position || 0;
				}
			};
		});

		(function() {
			var itemOnHand = null;

			defaultPrototype.dragable = function(settings) {
				if (!fn.isPlainObject(settings)) {
					settings = {};
				}

				fn.each(this, function(i, element) {
					var elem = Void0(element),
							i = 0;

					elem.attr('draggable', true);

					fn.each({
						start: 'dragstart',
						drag: 'drag',
						end: 'dragend',
						drop: 'drop'
					}, function(name, eventName) {
						elem.on(eventName, function(e) {
							if (name === 'start') {
								itemOnHand = element;
							} else if (name === 'end') {
								itemOnHand = null;
							}

							if (fn.isCallable(settings[name])) {
								settings[name].call(this, e);
							}
						});
					});
				});
				return this;
			};

			defaultPrototype.dropable = function(settings) {
				if (!fn.isPlainObject(settings)) {
					settings = {};
				}

				fn.each(this, function() {
					var elem = Void0(this),
							i = 0;

					fn.each({
						enter: 'dragenter',
						over: 'dragover',
						leave: 'dragleave',
						drop: 'drop'
					}, function(name, eventName) {
						elem.on(eventName, function(e, target) {
							var fireEvent = true;
							e.draggedItem = itemOnHand;
							if ('drop enter over'.indexOf(name) >= 0) {
								e.preventDefault();
							}

							if (fireEvent && fn.isCallable(settings[name])) {
								settings[name].call(this, e, target);
							}
						});
					});
				});
			};
		})();

		(function() {
			var requestFrame = (fn.isDefined(win.requestAnimationFrame)) ? requestAnimationFrame : function(callback) {
				setTimeout(function() {
					callback.call(this, Date.now());
				}, 1000 / 60);
			};

			function animationChain(collection, executor) {
				if (!collection.animatequeue) {
					collection.animatequeue = new Void0.Promise(executor);
				} else {
					collection.animatequeue = collection.animatequeue.then(function() {
						return new Void0.Promise(executor);
					});
				}
			}

			defaultPrototype.animatequeue = null;

			/**
			 * [description]
			 * @return {[type]} [description]
			 */
			defaultPrototype.delay = function(duration) {
				var self = this,
						duration = Math.max(0, parseInt(duration) || 0);

				animationChain(this, function(resolve, reject) {
					setTimeout(function() {
						resolve(true);
					}, duration)
				});

				return this;
			};

			/**
			 * [description]
			 * @param	{[type]} cssObj	 [description]
			 * @param	{[type]} value		[description]
			 * @param	{[type]} easing	 [description]
			 * @param	{[type]} duration [description]
			 * @return {[type]}					[description]
			 */
			defaultPrototype.animate = function(css, duration, easing, onCompleted) {
				var self = this,
						cubicBezier;

				if (this.length) {
					if (fn.isPlainObject(css)) {
						duration = parseInt(duration) || 0;
						if (duration <= 100) {
							duration = 1000;
						}

						var csschanges = {};

						fn.each(css, function(style, value) {
							var styleName = fn.camelCase(style);
							if (styleName in supportstyles) {
								csschanges[style] = value;
							}
						});

						if (!fn.isEmpty(csschanges)) {
							var diff = [];
							cubicBezier = new Void0.CubicBezier(0, 0, 1, 1);

							if (fn.isString(easing)) {
								if (easing.substring(0, 4) === 'ease' && Void0.CubicBezier[easing]) {
									cubicBezier = Void0.CubicBezier[easing]();
								}
							} else if (easing instanceof Void0.CubicBezier) {
								cubicBezier = easing;
							}

							animationChain(this, function(resolve, reject) {
								var start;

								// Calculate the diff
								fn.each(self, function(i, elem) {
									fn.each(csschanges, function(style, value) {
										var matches,
												previousValue,
												mElem = Void0(elem),
												org,
												valueset,
												hasUnit = false;

										if ((matches = regexHasValueSet.exec(style)) !== null) {
											valueset = getValueset(mElem.css(matches[1]));
											org = valueset[matches[2].toLowerCase()];
										} else {
											org = mElem.css(style);
										}

										// Length value
										if ((matches = regexUnit.exec(org)) !== null) {
											org = parseFloat(matches[1]) || 0;

											if ((matches = regexUnit.exec(value)) !== null && !matches[3]) {
												if (matches[2] === 'em') {
													value = fn.pxConvert(value, (style === 'font-size') ? mElem.parent().css('font-size') : mElem.css('font-size'));
												} else if (matches[2] === 'rem') {
													value = fn.pxConvert(value, mElem.parent('html').css('font-size'));
												} else if (matches[2] === 'vh') {
													value = fn.pxConvert(value, Void0(window).height());
												} else if (matches[2] === 'vw') {
													value = fn.pxConvert(value, Void0(window).width());
												} else if (matches[2] === 'vmin') {
													value = fn.pxConvert(value, Math.min(Void0(window).width(), Void0(window).height()));
												} else if (matches[2] === 'vmax') {
													value = fn.pxConvert(value, Math.max(Void0(window).width(), Void0(window).height()));
												} else if (matches[2] === '%') {
													// Get Computed Style value
													previousValue = mElem.css(style);
													value = mElem.css(style, value).css(style);
													mElem.css(style, previousValue);
												} else {
													value = fn.pxConvert(value);
												}
											} else {
												value = parseFloat(value) || 0;
											}
											hasUnit = true;
										} else {
											value = parseInt(value) || 0;
											org = parseInt(org) || 0;
										}

										diff.push({
											elem: elem,
											style: style,
											org: org,
											value: value - org,
											hasUnit: hasUnit
										});
									});
								});

								function raf(timestamp) {
									if (!start) {
										start = timestamp;
									}

									var t = Math.min((timestamp - start) / duration, 1);
									fn.each(diff, function(i, object) {
										Void0(object.elem).css(object.style, (object.org + cubicBezier.progress(object.value, t)) + (object.hasUnit ? 'px' : ''));
									});

									if (t === 1) {
										if (fn.isCallable(onCompleted)) {
											onCompleted.call(self);
										}
										resolve(true);
									} else {
										requestFrame(raf);
									}
								}

								requestFrame(raf);
							});
						}
					}
				}

				return this;
			};
		})();

		(function() {
			function siblingElement(object, type) {
				var direction = type + 'Sibling',
						elementDirection = type + 'ElementSibling';

				if (!object) {
					return null;
				}

				if (object[elementDirection]) {
					return object[elementDirection];
				} else if (object[direction]) {
					while (!!(object = object[direction])) {
						if (fn.isDOMElement(object)) {
							return object;
						}
					}
				}

				return null;
			}

			fn.each('next previous'.split(' '), function() {
				var name = this;
				defaultPrototype[name.substring(0, 4)] = function(selector) {
					var element = this[0];
					if (element) {
						while (!!(element = siblingElement(element, name))) {
							if (!fn.isDefined(selector) || Void0(element).is(selector)) {
								return Void0(element);
							}
						}
					}
					return Void0();
				};

				defaultPrototype[name.substring(0, 4) + 'All'] = function(selector, until) {
					var element = this[0], domList = [];
					if (element) {
						while (!!(element = siblingElement(element, name))) {
							if (fn.isDefined(until) && Void0(element).is(until)) {
								break;
							}
							if (!fn.isDefined(selector) || Void0(element).is(selector)) {
								domList.push(element);
							}
						}
					}
					return Void0(domList);
				};
			});
		})();

		fn.each(['', 'Array'], function() {
			var name = this;
			/**
			 * [description]
			 * @return {[type]} [description]
			 */
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
		});

		fn.each(['add', 'remove'], function(key, name) {
			/**
			 * [description]
			 * @param  {[type]} classname [description]
			 * @return {[type]}           [description]
			 */
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

		(function() {
			function createDataSet(element) {
				element.dataset = {};
				fn.each(element.attributes, function(name, value) {
					if (fn.isObject(this)) {
						name = this.name;
						value = this.value;
					}

					if (name.indexOf('data-') === 0) {
						element.dataset[name.substr(5)] = value;
					}
				});
			}

			/**
			 * [description]
			 * @param	{[type]} name	 [description]
			 * @param	{[type]} object [description]
			 * @param	{[type]} clone	[description]
			 * @return {[type]}				[description]
			 */
			defaultPrototype.data = function(name, object, clone) {
				if (!fn.isDefined(name)) {
					return (this.length) ? this[0].dataset : null;
				} else {
					if (fn.isDefined(object)) {
						fn.each(this, function() {
							if (!fn.isDefined(this.dataset)) {
								createDataSet(this);
							}
							if (object === null) {
								delete this.dataset[name];
							} else {
								this.dataset[name] = (clone) ? fn.clone(object) : object;
							}
						});
						return this;
					} else {
						var value,
								dataset;
						if (fn.isString(name) && this.length) {
							name = name.trim();
							if (name) {
								if (!fn.isDefined(this[0].dataset)) {
									createDataSet(this[0]);
								}
								value = this[0].dataset[name];

								try {
									return JSON.parse(value);
								} catch (e) {
									return value;
								}
							}
						}
						return null;
					}
				}
			};
		})();

		(function() {
			function createList(object) {
				var contents = [];

				if (fn.isIterable(object) && object.length) {
					return object;
				} else if (fn.isString(object)) {
					return Void0(object);
				} else if (fn.isDOMElement(object)) {
					contents.push(object);
					return contents;
				}

				return contents;
			}

			function insertElement(pair, prependElement, sibling) {
				var target = pair[0],
						source = pair[1],
						contents = [],
						length = (target.length) ? target.length - 1 : 0;

				target = createList(target);
				source = createList(source);

				if (source.length) {
					fn.each(target, function(i, el) {
						if (!fn.isDefined(el.nodeType)) {
							return;
						}

						el = (el.nodeType === 1) ? el : fn.owner(el).document.body;

						// If append(), appendTo() and after(), reverse the source lise
						if (!prependElement) {
							source = ary.reverse.call(source);
						}

						fn.each(source, function(j, element) {
							var elementNode = (length === i) ? element : element.cloneNode(true),
									targetNode = (!sibling) ? el : ((el.nodeType === 1) ? el.parentNode : null);

							if (targetNode) {
								if ((targetNode.lastchild === el && prependElement && sibling) || (prependElement && !sibling)) {
									targetNode.appendChild(elementNode);
								} else {
									targetNode.insertBefore(elementNode, (sibling) ? (!prependElement ? el.nextSibling : el) : el.childNodes[0]);
								}
							}
						});
					});
				}
			}

			fn.each(['after', 'before', 'append', 'prepend', 'appendTo', 'prependTo'], function(i, method) {
				var reverse = (method.indexOf('To') !== -1);

				/**
				 * [description]
				 * @param	{[type]} element [description]
				 * @return {[type]}				 [description]
				 */
				defaultPrototype[method] = function(element) {
					insertElement((reverse) ? [element, this] : [this, element], i % 2 === 1, (i < 2));
					return this;
				};
			});
		})();

		(function() {
			function EventEmitter(element, event) {
				this.element = element;
				this.event = event;
				this.default = element[event];
				this.callback = [];
			}

			fn.extend(EventEmitter.prototype, {
				register: function(namespaces, selector, callback) {
					this.callback.push({
						namespaces: namespaces,
						selector: selector,
						callback: callback
					});

					return this;
				},

				trigger: function(e) {
					var namespaces = [],
							self = this;
					if (e.namespaces && fn.isString(e.namespaces)) {
						namespaces = selector.split('.');
					} else if (fn.isIterable(e.namespaces)) {
						namespaces = e.namespaces;
					}

					fn.each(this.callback, function(i, object) {
						var fireEvent = true;
						if (!namespaces.length) {
							if (object.selector) {
								fireEvent = false;
								if (fn.isCallable(object.selector)) {
									fireEvent = object.selector.call(e.target);
								} else if (fn.isString(object.selector)) {
									fireEvent = Void0(e.target).is(object.selector);
								}
							}

							if (fireEvent) {
								object.callback.call(self.element, e);
							}
						} else {
							if (namespaces.every(function(value) {
								return object.namespaces.includes(value);
							})) {
								object.callback.call(self.element, e);
							}
						}
					});

					return this;
				},

				remove: function(namespaces) {
					var self = this;
					fn.each(this.callback, function(i) {
						if (!namespaces.length) {
							self.callback.splice(i, 1);
						} else {
							if (namespaces.every(function(value) {
								return self.callback[i].namespaces.includes(value);
							})) {
								self.callback.splice(i, 1);
							}
						}
					});

					return this;
				}
			});

			function setupEvent(element, events, selector, callback) {
				events = events.split('.');

				var eventName = events.shift(),
						namespaces = events;

				if (!element.eventEmitters) {
					element.eventEmitters = {};
				}

				if (!element.eventEmitters[eventName]) {
					element.eventEmitters[eventName] = new EventEmitter(element, eventName);
					if (/^(DOMContentLoaded|(on)?load)$/i.test(eventName) && (fn.isDocument(element) || fn.isWindow(element))) {
						fn.ready(callback);
					} else {
						var eventCallback = function(e) {
							element.eventEmitters[eventName].trigger(e);
						}

						if (element.addEventListener) {
							element.addEventListener(eventName, eventCallback, false);
						} else {
							if (eventName == 'DOMContentLoaded') {
								eventName = 'load';
							}

							if (this.attachEvent) {
								element.attachEvent('on' + eventName, eventCallback);
							} else {
								element['on' + eventName] = eventCallback;
							}
						}
					}
				}

				element.eventEmitters[eventName].register(events, selector, callback);

				return this;
			}

			function createEvent(element, event) {
				var eventObj;
				if (CustomEvent) {
					if (fn.isObject(win.CustomEvent)) {
						function CustomEvent (event, params) {
							params = params || {bubbles: false, cancelable: false, detail: undefined};
							var evt = doc.createEvent('CustomEvent');
							evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
							return evt;
						}

						CustomEvent.prototype = win.Event.prototype;
						win.CustomEvent = CustomEvent;
					}

					eventObj = new CustomEvent(event, {
						bubbles: true,
						cancelable: true
					});
				} else if (doc.createEvent) {
					eventObj = doc.createEvent( (/(mouse.+)|(((un)?click)|over|down|up)/i.test(event)) ? 'MouseEvents' : 'HTMLEvents');
					eventObj.initEvent(event, false, true);
				} else if (element.createEventObject) {
					eventObj = element.createEventObject();
				}

				return eventObj;
			}
			/**
			 * [description]
			 * @param	{[type]}	 events	 [description]
			 * @param	{[type]}	 selector [description]
			 * @param	{Function} callback [description]
			 * @return {[type]}						[description]
			 */
			defaultPrototype.on = function(events, selector, callback) {
				if (fn.isString(events)) {
					events = events.trim();
					if (events) {
						if (selector) {
							events = events.split(' ');
							if (fn.isCallable(selector)) {
								callback = selector;
								selector = null;
							}

							if (fn.isCallable(callback)) {
								fn.each(this, function(i, elem) {
									fn.each(events, function() {
										setupEvent(elem, this, selector, callback);
									});
								});
							}
						}
					}
				}
				return this;
			};

			/**
			 * [description]
			 * @param	{[type]} events [description]
			 * @return {[type]}				[description]
			 */
			defaultPrototype.off = function(events) {
				if (fn.isString(events)) {
					if (events = events.trim()) {
						fn.each(this, function(i, elem) {
							if (elem.eventEmitters) {
								fn.each(events.split(' '), function() {
									var delimiter = this.split('.'),
											eventName = delimiter.shift(),
											namespaces = delimiter;

									if (elem.eventEmitters[eventName]) {
										elem.eventEmitters[eventName].remove(namespaces);
									}
								});
							}
						});
					}
				}

				return this;
			};

			defaultPrototype.trigger = function(events) {
				if (events = events.trim()) {
					events = events.split('.');
					var eventName = events.shift(),
							namespaces = events;

					fn.each(this, function(i, elem) {
						var eventObj = createEvent(this, eventName);
						eventObj.namespaces = namespaces;

						if (document.createEvent) {
							elem.dispatchEvent(eventObj);
						} else {
							elem.fireEvent('on' + eventName, eventObj);

							if (eventName === 'submit') {
								elem.submit();
							}
						}
					});
				}
				return this;
			};

			fn.each('click dblClick focus blur change select mouseEnter mouseLeave mouseOver mouseOut submit mouseDown mouseUp mouseMove scroll wheel resize'.split(' '), function(i, event) {
				defaultPrototype[event] = function(callback) {
					if (fn.isDefined(callback)) {
						if (fn.isCallable(callback)) {
							this.on(this)
						}
						this.on(event, callback);
					} else {
						this.trigger(event);
					}
					return this;
				};
			});
		})();

		function getValueset(value) {
			value = value.split(' ');
			return {
				top: value[0],
				right: value[1] || value[0],
				bottom: value[2] || value[0],
				left: value[3] || value[1] || value[0]
			};
		}

		(function() {
			function getExtra(type, value) {
				var extra = 0,
						valueset;

				valueset = getValueset(value);
				if (type === 'height') {
					extra += (parseFloat(valueset.top) || 0) + (parseFloat(valueset.bottom) || 0);
				} else {
					extra += (parseFloat(valueset.left) || 0) + (parseFloat(valueset.right) || 0);
				}

				return extra;
			}

			fn.each({width: 'Width', height: 'Height'}, function(name, property) {
				fn.each(['', 'inner', 'outer'], function(i, type) {
					defaultPrototype[(type) ? type + property : name] = function(value, margin) {
						var elem,
								doc,
								extra = 0,
								original;

						if (type === 'outer') {
							if (fn.isBoolean(value)) {
								margin = value;
								value = undefined;
							}
						}

						if (!fn.isDefined(value)) {
							if (this.length) {
								elem = this[0];
								if (fn.isWindow(elem)) {
									return (type === 'outer') ? elem['inner' + property] : elem.document.documentElement['client' + property];
								} else if (fn.isDocument(elem)) {
									doc = elem.documentElement;
									return Math.max(
										elem.body['scroll' + property],
										doc['scroll' + property],
										elem.body['offset' + property],
										doc['offset' + property],
										doc['client' + property]
									);
								} else {
									if (type === 'outer') {
										extra += getExtra(name, Void0(elem).css('border-width'));
										if (margin) {
											extra += getExtra(name, Void0(elem).css('margin'));
										}
									}
									return (parseFloat((!type) ? Void0(elem).css(name) : elem[type + property] || elem['client' + property]) || 0) + extra;
								}
							}

							return 0;
						} else {
							if (!type) {
								this.css(name, value);
							} else {
								fn.each(this, function(i) {
									var elem = Void0(this),
											boxsizing = elem.css('box-sizing').toLowerCase(),
											original,
											newValue;

									if (boxsizing === 'content-box') {
										extra += getExtra(name, Void0(elem).css('padding'));
									}

									if (type === 'outer') {
										extra += getExtra(name, Void0(elem).css('border-width'));
										if (margin) {
											extra += getExtra(name, Void0(elem).css('margin'));
										}
									}

									newValue = (fn.isCallable(value)) ? value.call(this, i, elem.css(name)) : value;
									elem.css(name, newValue);
									if (extra) {
										elem.css(name, function(i, value) {
											return ((parseFloat(value) || 0) - extra) + 'px';
										});
									}
								});
							}
							return this;
						}
					};
				});
			});
		})();

		fn.extend(ElementCollection.prototype, defaultPrototype);

		ElementCollection.reset = function() {
			ElementCollection.prototype = defaultPrototype;
			return this;
		};

		return ElementCollection;
	})();

	function buildHTML(html, source) {
		container.innerHTML = html;
		if (fn.isIterable(source)) {
			fn.each(container.children, function() {
				if (this instanceof HTMLUnknownElement) {
					// Let IE can identify the unknown HTML tag
					var element = doc.createElement(this.tagName);
					element.innerHTML = this.innerHTML;
					source.push(element);
				} else {
					source.push(this);
				}
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
				if (/^<.+>$/m.test(selector)) {
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

	// [ Void0.Promise ]
	// 		Abide by Promises/A+ Rule
	// 		https://promisesaplus.com/

	Void0.Promise = (function() {
		/**
		 * [Promise description]
		 * @param			 {[type]} executor [description]
		 * @constructor
		 */
		function Promise(executor) {
			var promise = this;

			this.state = 'pending';
			this.value = undefined;
			this.tasks = [];
			this.oncatch = null;
			this.pendingCatch = [];

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
				} catch (e) {
					// Throw Error
					promiseContext.rejected(promise, e);
					catchError(promise, e);
				}
			} else {
				throw new TypeError('Promise resolver ' + executor + ' is not a function');
			}
		}

		/**
		 * [description]
		 * @param	{[type]} onFulfilled [description]
		 * @param	{[type]} onRejected	[description]
		 * @return {[type]}						 [description]
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
			task.promise = new Promise(function(onFulfilled, onRejected) {
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
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		Promise.prototype.catch = function(callback) {
			if (callback && fn.isCallable(callback)) {
				this.oncatch = callback;
				catchError(this);
			}
			return this;
		};

		/**
		 * [description]
		 * @param	{[type]} mixed [description]
		 * @return {[type]}			 [description]
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
		 * @param	{[type]} reason [description]
		 * @return {[type]}				[description]
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
			fulFilled: function(promise, value) {
				if (promise.state === 'pending') {
					promise.state = 'fulFilled';
					promise.value = value;
					notify(promise);
				}
				return this;
			},
			rejected: function(promise, reason) {
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
				mixed.then(function(value) {
					promiseContext.fulFilled(promise, value);
				}, function(reason) {
					promiseContext.rejected(promise, reason);
				});

				return;
			}

			// If x is an object or function
			// https://promisesaplus.com/#point-53
			if (mixed && fn.isObject(mixed) && 'then' in mixed) {
				var then,
						called = false;

				try {
					// Let then be x.then
					// https://promisesaplus.com/#point-54
					then = mixed.then;
				} catch (e) {
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
							},
							function(reason) {
								if (called) {
									called = true;
									// If/when rejectPromise is called with a reason r, reject promise with r.
									// https://promisesaplus.com/#point-58
									promiseContext.rejected(promise, reason);
								}
							}
						);
					} catch (e) {
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

						if (!(promise.state in microtask.events)) {
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
								} catch (e) {
									// If either onFulfilled or onRejected throws an exception e,
									// promise2 must be rejected with e as the reason.
									// https://promisesaplus.com/#point-42
									promiseContext.rejected(forkPromise, e);
									catchError(forkPromise, e);
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

		function catchError(promise, errorText) {
			if (fn.isCallable(promise.oncatch)) {
				while (promise.pendingCatch.length) {
					var error = promise.pendingCatch.shift();
					promise.oncatch(error);
				}
				if (errorText) {
					promise.oncatch(errorText);
				}
			} else {
				promise.pendingCatch.push(errorText);
			}
		}

		return Promise;
	})();

	Void0.ajax = (function() {
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
				statusCode: {},
				headers: {},
				scriptCharset: 'UTF-8',

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

			var promise = new Void0.Promise(function(resolve, reject) {
				var xmlHttp = null,
						action = this,
						converters = {};

				// settings.beforeSend
				if (!fn.isPlainObject(settings.headers)) {
					settings.headers = {};
				}

				if (fn.isCallable(settings.beforeSend)) {
					settings.beforeSend.call(xmlHttp, xmlHttp);
				}

				if (!settings.headers['X-Requested-With']) {
					settings.headers['X-Requested-With'] = 'XMLHttpRequest';
				}

				// settings.crossDomain
				if (settings.crossDomain || settings.dataType === 'script' || settings.dataType === 'jsonp') {
					if (settings.dataType === 'jsonp') {
						// settings.jsonp
						var jsonpFunc,
								jsonString;

						if (settings.jsonp) {
							jsonpFunc = Math.random().toString(36).replace(/\d/g, '').slice(2, 7);

							if (!fn.isDefined(win._ajaxCallback)) {
								win._ajaxCallback = {};
							}

							if (fn.isString(settings.jsonp)) {
								jsonString = settings.jsonp.trim();
								if (fn.isCallable(win[jsonString])) {
									win._ajaxCallback[jsonpFunc] = function(data) {
										win[jsonString](data);
									};
								} else {
									reject(jsonString + ' is not a function or not exists');
									return;
								}
							} else if (fn.isCallable(settings.jsonp)) {
								win._ajaxCallback[jsonpFunc] = function(data) {
									settings.jsonp(data);
								};
							}

							jsonpFunc = 'window._ajaxCallback.' + jsonpFunc;
						}
						url = url + ((/\?/).test(url) ? '&' : '?') + 'callback=' + jsonpFunc;
					}

					var script = doc.createElement('script');

					// settings.scriptCharset
					script.charset = settings.scriptCharset;

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
						resolve(script);
						onCompleted(settings);
					};

					script.onerror = function(e) {
						reject(e);
					};
				} else {
					// settings.withCredentials
					xmlHttp = new XMLHttpRequest();
					if (settings.withCredentials) {
						xmlHttp.withCredentials = true;
					}

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
					if (!settings.cache) {
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

					if (settings.datatype) {
						xmlHttp.responseType = settings.datatype;
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
									response = xmlHttp.response || xmlHttp.responseText,
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
										var xmlStatus = {
											status: 304,
											statusText: 'Not modified'
										};
										reject(xmlStatus);
										onCompleted(xmlStatus);
										return;
									}
								}
							}

							// settings.afterDataReceive
							if (fn.isCallable(settings.afterDataReceive)) {
								response = settings.afterDataReceive.call(response, response);
							}

							if (fn.isString(response) && converters[convertName]) {
								if (converters[convertName] !== true) {
									try {
										response = converters[convertName](response);
									}
									catch(e) {
										reject(e);
										return;
									}
								}
							}

							resolve(response);
							onCompleted(settings, xmlHttp);
						} else {
							reject({
								status: xmlHttp.status,
								text: xmlHttp.statusText
							});
							onCompleted(settings, xmlHttp);
						}
					};

					xmlHttp.send(settings.data);
				}
			});

			return promise;
		}

		function onCompleted(settings, xmlHttp) {
			// settings.complete
			if (!fn.isIterable(settings.complete)) {
				settings.complete = [settings.complete];
			}

			if (xmlHttp) {
				// settings.statusCode
				if (fn.isPlainObject(settings.statusCode) && fn.isCallable(settings.statusCode[xmlHttp.status])) {
					settings.statusCode[xmlHttp.status](xmlHttp);
				}
			}

			fn.each(settings.complete, function() {
				if (fn.isCallable(this)) {
					this.call(this, xmlHttp, xmlHttp.statusText);
				}
			});
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

	var noConflict = (global.__) ? global.__ : null;
	global.Void0 = Void0;

	if (typeof define === 'function' && define.amd) {
		// AMD loader
		define('Void0', [], function() {
	    return Void0;
	  });
	} else if (typeof module === 'object' && module.exports) {
		// CommonJS
	  module.exports = Void0;
	} else {
		global.__ = Void0;
	}
})((typeof window !== 'undefined') ? window : this);
