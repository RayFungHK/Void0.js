(function(global) {
  let fn = {},
      ary = Array.prototype,
      Package = {},
      configuration = {
        plugin: './plugin/'
      },
      doc = document,
      head = doc.getElementsByTagName('head')[0],
      context = {};

  //
  Package.prototype = {
		constructor: Package,
		push: ary.push,
		indexOf: ary.indexOf,
		forEach: ary.forEach,
		some: ary.some,
		length: 0
	};

  function select(needle, object) {
    let packer = {};

    packer.then = function(callback) {
      if (typeof callback === 'function') {
        for (let key in object) {
          callback.apply(object, [key, object[key]]);
        }
      }
      return this;
    };

    return packer;
  }

  Moduler = function(selector) {

  };

  Moduler.config = function(config) {
    if (typeof config !== undefined) {
      select('plugin'.split(' '), config).then(function(parameter, value) {
        if (parameter === 'plugin') {
          value += '/';
          let matches = /^(?:.{0,2}\/+)?(?:[\w-.]+\/*)+(\/)+?$/.exec(value)
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
    let matches = /^(?:.{0,2}\/+)?(?:[\w-.]+\/*)+(\.js)?$/.exec(scriptName);
    if (matches) {
      if (!matches[1]) {
        scriptName += '.js';
      }
      let script = doc.createElement('script');

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
