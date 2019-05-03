/*! ics.js 0.3.0 Thu May 02 2019 23:51:34 */
/*! file-saver 2.0.1 Thu May 02 2019 23:51:34 */
/*! Blob.js 0.0.0 Thu May 02 2019 23:51:34 */

/* global saveAs, Blob, BlobBuilder, console */
/* exported ics */

var ics = function(uidDomain, prodId, timezone) {
  'use strict';

  if (navigator.userAgent.indexOf('MSIE') > -1 && navigator.userAgent.indexOf('MSIE 10') == -1) {
    console.log('Unsupported Browser');
    return;
  }

  if (typeof uidDomain === 'undefined') { uidDomain = 'default'; }
  if (typeof prodId === 'undefined') { prodId = 'Calendar'; }

  var SEPARATOR = (navigator.appVersion.indexOf('Win') !== -1) ? '\r\n' : '\n';
  var calendarEvents = [];
  var calendarStart = [
    'BEGIN:VCALENDAR',
    'PRODID:' + prodId,
    'VERSION:2.0'
  ].join(SEPARATOR);
  if (typeof timezone !== 'undefined') {
      calendarStart += SEPARATOR + 'X-WR-TIMEZONE:' + timezone;
  }
  var calendarEnd = SEPARATOR + 'END:VCALENDAR';
  var BYDAY_VALUES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  return {
    /**
     * Returns events array
     * @return {array} Events
     */
    'events': function() {
      return calendarEvents;
    },

    /**
     * Returns calendar
     * @return {string} Calendar in iCalendar format
     */
    'calendar': function() {
      return calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;
    },

    /**
     * Add event to the calendar
     * @param  {string} subject     Subject/Title of event
     * @param  {string} description Description of event
     * @param  {string} location    Location of event
     * @param  {string} begin       Beginning date of event
     * @param  {string} stop        Ending date of event
     */
    'addEvent': function(subject, description, location, begin, stop, rrule) {
      // I'm not in the mood to make these optional... So they are all required
      if (typeof subject === 'undefined' ||
        typeof description === 'undefined' ||
        typeof location === 'undefined' ||
        typeof begin === 'undefined' ||
        typeof stop === 'undefined'
      ) {
        return false;
      }

      // validate rrule
      if (rrule) {
        if (!rrule.rrule) {
          if (rrule.freq !== 'YEARLY' && rrule.freq !== 'MONTHLY' && rrule.freq !== 'WEEKLY' && rrule.freq !== 'DAILY') {
            throw "Recurrence rrule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'";
          }

          if (rrule.until) {
            if (isNaN(Date.parse(rrule.until))) {
              throw "Recurrence rrule 'until' must be a valid date string";
            }
          }

          if (rrule.interval) {
            if (isNaN(parseInt(rrule.interval))) {
              throw "Recurrence rrule 'interval' must be an integer";
            }
          }

          if (rrule.count) {
            if (isNaN(parseInt(rrule.count))) {
              throw "Recurrence rrule 'count' must be an integer";
            }
          }

          if (typeof rrule.byday !== 'undefined') {
            if ((Object.prototype.toString.call(rrule.byday) !== '[object Array]')) {
              throw "Recurrence rrule 'byday' must be an array";
            }

            if (rrule.byday.length > 7) {
              throw "Recurrence rrule 'byday' array must not be longer than the 7 days in a week";
            }

            // Filter any possible repeats
            rrule.byday = rrule.byday.filter(function(elem, pos) {
              return rrule.byday.indexOf(elem) == pos;
            });

            for (var d in rrule.byday) {
              if (BYDAY_VALUES.indexOf(rrule.byday[d]) < 0) {
                throw "Recurrence rrule 'byday' values must include only the following: 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'";
              }
            }
          }
        }
      }

      //TODO add time and time zone? use moment to format?
      var start_date = new Date(begin);
      var end_date = new Date(stop);
      var now_date = new Date();

      var start_year = ("0000" + (start_date.getFullYear().toString())).slice(-4);
      var start_month = ("00" + ((start_date.getMonth() + 1).toString())).slice(-2);
      var start_day = ("00" + ((start_date.getDate()).toString())).slice(-2);
      var start_hours = ("00" + (start_date.getHours().toString())).slice(-2);
      var start_minutes = ("00" + (start_date.getMinutes().toString())).slice(-2);
      var start_seconds = ("00" + (start_date.getSeconds().toString())).slice(-2);

      var end_year = ("0000" + (end_date.getFullYear().toString())).slice(-4);
      var end_month = ("00" + ((end_date.getMonth() + 1).toString())).slice(-2);
      var end_day = ("00" + ((end_date.getDate()).toString())).slice(-2);
      var end_hours = ("00" + (end_date.getHours().toString())).slice(-2);
      var end_minutes = ("00" + (end_date.getMinutes().toString())).slice(-2);
      var end_seconds = ("00" + (end_date.getSeconds().toString())).slice(-2);

      var now_year = ("0000" + (now_date.getFullYear().toString())).slice(-4);
      var now_month = ("00" + ((now_date.getMonth() + 1).toString())).slice(-2);
      var now_day = ("00" + ((now_date.getDate()).toString())).slice(-2);
      var now_hours = ("00" + (now_date.getHours().toString())).slice(-2);
      var now_minutes = ("00" + (now_date.getMinutes().toString())).slice(-2);
      var now_seconds = ("00" + (now_date.getSeconds().toString())).slice(-2);

      // Since some calendars don't add 0 second events, we need to remove time if there is none...
      var start_time = '';
      if (start_hours !== "00" || start_minutes !== "00" || start_seconds !== "00") {
        start_time = 'T' + start_hours + start_minutes + start_seconds;
      }
      var end_time = '';
      if (end_hours !== "00" || end_minutes !== "00" || end_seconds !== "00") {
        end_time = 'T' + end_hours + end_minutes + end_seconds;
      }
      var now_time = 'T' + now_hours + now_minutes + now_seconds;

      var start = start_year + start_month + start_day + start_time;
      var end = end_year + end_month + end_day + end_time;
      var now = now_year + now_month + now_day + now_time;

      var calendarEvent = [
        'BEGIN:VEVENT',
        'UID:' + calendarEvents.length + "@" + uidDomain,
        'CLASS:PUBLIC',
        'DESCRIPTION:' + description
      ];

      // recurrence rrule vars
      if (rrule) {
        var rruleString;
        if (rrule.rrule) {
          rruleString = rrule.rrule;
        } else {
          rruleString = 'RRULE:FREQ=' + rrule.freq;

          if (rrule.until) {
            var uDate = new Date(Date.parse(rrule.until)).toISOString();
            rruleString += ';UNTIL=' + uDate.substring(0, uDate.length - 13).replace(/[-]/g, '') + '000000Z';
          }

          if (rrule.interval) {
            rruleString += ';INTERVAL=' + rrule.interval;
          }

          if (rrule.count) {
            rruleString += ';COUNT=' + rrule.count;
          }

          if (rrule.byday && rrule.byday.length > 0) {
            rruleString += ';BYDAY=' + rrule.byday.join(',');
          }
        }

        calendarEvent.push(rruleString);
      }

      calendarEvent.push('DTSTAMP;VALUE=DATE-TIME:' + now);

      if (start_time !== '') {
        calendarEvent.push('DTSTART;VALUE=DATE-TIME:' + start);
      } else {
        calendarEvent.push('DTSTART;VALUE=DATE:' + start);
      }

      // If start and end refer to the same day without time,
      // it's a one day event, and no DTEND is needed.
      // https://stackoverflow.com/a/30249034
      if (end_time !== '') {
        calendarEvent.push('DTEND;VALUE=DATE-TIME:' + end);
      } else if (end !== start) {
        calendarEvent.push('DTEND;VALUE=DATE:' + end);
      }

      calendarEvent.push(
        'LOCATION:' + location,
        'SUMMARY;LANGUAGE=en-us:' + subject,
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );

      calendarEvent = calendarEvent.join(SEPARATOR);

      calendarEvents.push(calendarEvent);
      return calendarEvent;
    },

    /**
     * Download calendar using the saveAs function from filesave.js
     * @param  {string} filename Filename
     * @param  {string} ext      Extention
     */
    'download': function(filename, ext) {
      if (calendarEvents.length < 1) {
        return false;
      }

      ext = (typeof ext !== 'undefined') ? ext : '.ics';
      filename = (typeof filename !== 'undefined') ? filename : 'calendar';
      var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;

      var blob;
      if (navigator.userAgent.indexOf('MSIE 10') === -1) { // chrome or firefox
        blob = new Blob([calendar], { type: 'text/calendar;charset=' + document.characterSet });
      } else { // ie
        var bb = new BlobBuilder();
        bb.append(calendar);
        blob = bb.getBlob('text/x-vCalendar;charset=' + document.characterSet);
      }
      saveAs(blob, filename + ext);
      return calendar;
    },

    /**
     * Build and return the ical contents
     */
    'build': function() {
      if (calendarEvents.length < 1) {
        return false;
      }

      var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;

      return calendar;
    }
  };
};
;

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.FileSaver = mod.exports;
  }
})(this, function () {
  "use strict";

  /*
  * FileSaver.js
  * A saveAs() FileSaver implementation.
  *
  * By Eli Grey, http://eligrey.com
  *
  * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
  * source  : http://purl.eligrey.com/github/FileSaver.js
  */
  // The one and only way of getting global scope in all environments
  // https://stackoverflow.com/q/3277182/1008999
  var _global = typeof window === 'object' && window.window === window ? window : typeof self === 'object' && self.self === self ? self : typeof global === 'object' && global.global === global ? global : void 0;

  function bom(blob, opts) {
    if (typeof opts === 'undefined') opts = {
      autoBom: false
    };else if (typeof opts !== 'object') {
      console.warn('Deprecated: Expected third argument to be a object');
      opts = {
        autoBom: !opts
      };
    } // prepend BOM for UTF-8 XML and text/* types (including HTML)
    // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF

    if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(0xFEFF), blob], {
        type: blob.type
      });
    }

    return blob;
  }

  function download(url, name, opts) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';

    xhr.onload = function () {
      saveAs(xhr.response, name, opts);
    };

    xhr.onerror = function () {
      console.error('could not download file');
    };

    xhr.send();
  }

  function corsEnabled(url) {
    var xhr = new XMLHttpRequest(); // use sync to avoid popup blocker

    xhr.open('HEAD', url, false);
    xhr.send();
    return xhr.status >= 200 && xhr.status <= 299;
  } // `a.click()` doesn't work for all browsers (#465)


  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent('click'));
    } catch (e) {
      var evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }

  var saveAs = _global.saveAs || ( // probably in some web worker
  typeof window !== 'object' || window !== _global ? function saveAs() {}
  /* noop */
  // Use download attribute first if possible (#193 Lumia mobile)
  : 'download' in HTMLAnchorElement.prototype ? function saveAs(blob, name, opts) {
    var URL = _global.URL || _global.webkitURL;
    var a = document.createElement('a');
    name = name || blob.name || 'download';
    a.download = name;
    a.rel = 'noopener'; // tabnabbing
    // TODO: detect chrome extensions & packaged apps
    // a.target = '_blank'

    if (typeof blob === 'string') {
      // Support regular links
      a.href = blob;

      if (a.origin !== location.origin) {
        corsEnabled(a.href) ? download(blob, name, opts) : click(a, a.target = '_blank');
      } else {
        click(a);
      }
    } else {
      // Support blobs
      a.href = URL.createObjectURL(blob);
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
      }, 4E4); // 40s

      setTimeout(function () {
        click(a);
      }, 0);
    }
  } // Use msSaveOrOpenBlob as a second approach
  : 'msSaveOrOpenBlob' in navigator ? function saveAs(blob, name, opts) {
    name = name || blob.name || 'download';

    if (typeof blob === 'string') {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        var a = document.createElement('a');
        a.href = blob;
        a.target = '_blank';
        setTimeout(function () {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  } // Fallback to using FileReader and a popup
  : function saveAs(blob, name, opts, popup) {
    // Open a popup immediately do go around popup blocker
    // Mostly only available on user interaction and the fileReader is async so...
    popup = popup || open('', '_blank');

    if (popup) {
      popup.document.title = popup.document.body.innerText = 'downloading...';
    }

    if (typeof blob === 'string') return download(blob, name, opts);
    var force = blob.type === 'application/octet-stream';

    var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;

    var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);

    if ((isChromeIOS || force && isSafari) && typeof FileReader === 'object') {
      // Safari doesn't allow downloading of blob URLs
      var reader = new FileReader();

      reader.onloadend = function () {
        var url = reader.result;
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
        if (popup) popup.location.href = url;else location = url;
        popup = null; // reverse-tabnabbing #460
      };

      reader.readAsDataURL(blob);
    } else {
      var URL = _global.URL || _global.webkitURL;
      var url = URL.createObjectURL(blob);
      if (popup) popup.location = url;else location.href = url;
      popup = null; // reverse-tabnabbing #460

      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 4E4); // 40s
    }
  });
  _global.saveAs = saveAs.saveAs = saveAs;

  if (typeof module !== 'undefined') {
    module.exports = saveAs;
  }
});
;

/* Blob.js
 * A Blob, File, FileReader & URL implementation.
 * 2018-08-09
 *
 * By Eli Grey, http://eligrey.com
 * By Jimmy Wärting, https://github.com/jimmywarting
 * License: MIT
 *   See https://github.com/eligrey/Blob.js/blob/master/LICENSE.md
 */

;(function(){

  var global = typeof window === 'object'
      ? window : typeof self === 'object'
      ? self : this

  var BlobBuilder = global.BlobBuilder
    || global.WebKitBlobBuilder
    || global.MSBlobBuilder
    || global.MozBlobBuilder;

  global.URL = global.URL || global.webkitURL || function(href, a) {
  	a = document.createElement('a')
  	a.href = href
  	return a
  }

  var origBlob = global.Blob
  var createObjectURL = URL.createObjectURL
  var revokeObjectURL = URL.revokeObjectURL
  var strTag = global.Symbol && global.Symbol.toStringTag
  var blobSupported = false
  var blobSupportsArrayBufferView = false
  var arrayBufferSupported = !!global.ArrayBuffer
  var blobBuilderSupported = BlobBuilder
    && BlobBuilder.prototype.append
    && BlobBuilder.prototype.getBlob;

  try {
    // Check if Blob constructor is supported
    blobSupported = new Blob(['ä']).size === 2

    // Check if Blob constructor supports ArrayBufferViews
    // Fails in Safari 6, so we need to map to ArrayBuffers there.
    blobSupportsArrayBufferView = new Blob([new Uint8Array([1,2])]).size === 2
  } catch(e) {}

  /**
   * Helper function that maps ArrayBufferViews to ArrayBuffers
   * Used by BlobBuilder constructor and old browsers that didn't
   * support it in the Blob constructor.
   */
  function mapArrayBufferViews(ary) {
    return ary.map(function(chunk) {
      if (chunk.buffer instanceof ArrayBuffer) {
        var buf = chunk.buffer;

        // if this is a subarray, make a copy so we only
        // include the subarray region from the underlying buffer
        if (chunk.byteLength !== buf.byteLength) {
          var copy = new Uint8Array(chunk.byteLength);
          copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
          buf = copy.buffer;
        }

        return buf;
      }

      return chunk;
    });
  }

  function BlobBuilderConstructor(ary, options) {
    options = options || {};

    var bb = new BlobBuilder();
    mapArrayBufferViews(ary).forEach(function(part) {
      bb.append(part);
    });

    return options.type ? bb.getBlob(options.type) : bb.getBlob();
  };

  function BlobConstructor(ary, options) {
    return new origBlob(mapArrayBufferViews(ary), options || {});
  };

  if (global.Blob) {
    BlobBuilderConstructor.prototype = Blob.prototype;
    BlobConstructor.prototype = Blob.prototype;
  }

  function FakeBlobBuilder() {
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6), 
          0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12), 
          0x80 | ((charcode>>6) & 0x3f), 
          0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
          | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18), 
          0x80 | ((charcode>>12) & 0x3f), 
          0x80 | ((charcode>>6) & 0x3f), 
          0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    function fromUtf8Array(array) {
      var out, i, len, c;
      var char2, char3;
      
      out = "";
      len = array.length;
      i = 0;
      while (i < len) {
        c = array[i++];
        switch (c >> 4)
        { 
          case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c);
          break;
          case 12: case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++];
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
          break;
          case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(((c & 0x0F) << 12) |
          ((char2 & 0x3F) << 6) |
          ((char3 & 0x3F) << 0));
          break;
        }
      }    
      return out;
    }
    function isDataView(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }
    function bufferClone(buf) {
      var view = new Array(buf.byteLength)
      var array = new Uint8Array(buf)
      var i = view.length
      while(i--) {
        view[i] = array[i]
      }
      return view
    }
    function encodeByteArray(input) {
      var byteToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

      var output = [];

      for (var i = 0; i < input.length; i += 3) {
        var byte1 = input[i];
        var haveByte2 = i + 1 < input.length;
        var byte2 = haveByte2 ? input[i + 1] : 0;
        var haveByte3 = i + 2 < input.length;
        var byte3 = haveByte3 ? input[i + 2] : 0;

        var outByte1 = byte1 >> 2;
        var outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
        var outByte3 = ((byte2 & 0x0F) << 2) | (byte3 >> 6);
        var outByte4 = byte3 & 0x3F;

        if (!haveByte3) {
          outByte4 = 64;

          if (!haveByte2) {
            outByte3 = 64;
          }
        }

        output.push(
            byteToCharMap[outByte1], byteToCharMap[outByte2],
            byteToCharMap[outByte3], byteToCharMap[outByte4])
      }

      return output.join('')
    }

    var create = Object.create || function (a) {
      function c() {}
      c.prototype = a;
      return new c
    }
    
    if (arrayBufferSupported) {
      var viewClasses = [
        '[object Int8Array]',
        '[object Uint8Array]',
        '[object Uint8ClampedArray]',
        '[object Int16Array]',
        '[object Uint16Array]',
        '[object Int32Array]',
        '[object Uint32Array]',
        '[object Float32Array]',
        '[object Float64Array]'
      ]

      var isArrayBufferView = ArrayBuffer.isView || function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      }
    }

    
    
    /********************************************************/
    /*                   Blob constructor                   */
    /********************************************************/
    function Blob(chunks, opts) {
      chunks = chunks || []
      for (var i = 0, len = chunks.length; i < len; i++) {
        var chunk = chunks[i]
        if (chunk instanceof Blob) {
          chunks[i] = chunk._buffer
        } else if (typeof chunk === 'string') {
          chunks[i] = toUTF8Array(chunk)
        } else if (arrayBufferSupported && (ArrayBuffer.prototype.isPrototypeOf(chunk) || isArrayBufferView(chunk))) {
          chunks[i] = bufferClone(chunk)
        } else if (arrayBufferSupported && isDataView(chunk)) {
          chunks[i] = bufferClone(chunk.buffer)
        } else {
          chunks[i] = toUTF8Array(String(chunk))
        }
      }

      this._buffer = [].concat.apply([], chunks)
      this.size = this._buffer.length
      this.type = opts ? opts.type || '' : ''
    }

    Blob.prototype.slice = function(start, end, type) {
      var slice = this._buffer.slice(start || 0, end || this._buffer.length)
      return new Blob([slice], {type: type})
    }

    Blob.prototype.toString = function() {
      return '[object Blob]'
    }

    

    /********************************************************/
    /*                   File constructor                   */
    /********************************************************/
    function File(chunks, name, opts) {
      opts = opts || {}
      var a = Blob.call(this, chunks, opts) || this
      a.name = name
      a.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date
      a.lastModified = +a.lastModifiedDate
      
      return a
    }

    File.prototype = create(Blob.prototype);
    File.prototype.constructor = File;

    if (Object.setPrototypeOf) 
      Object.setPrototypeOf(File, Blob);
    else {
      try {File.__proto__ = Blob} catch (e) {}
    }

    File.prototype.toString = function() {
      return '[object File]'
    }

    
    /********************************************************/
    /*                FileReader constructor                */
    /********************************************************/
    function FileReader() {
    	if (!(this instanceof FileReader))
    		throw new TypeError("Failed to construct 'FileReader': Please use the 'new' operator, this DOM object constructor cannot be called as a function.")

    	var delegate = document.createDocumentFragment()
    	this.addEventListener = delegate.addEventListener
    	this.dispatchEvent = function(evt) {
    		var local = this['on' + evt.type]
    		if (typeof local === 'function') local(evt)
    		delegate.dispatchEvent(evt)
    	}
    	this.removeEventListener = delegate.removeEventListener
    }

    function _read(fr, blob, kind) {
    	if (!(blob instanceof Blob))
    		throw new TypeError("Failed to execute '" + kind + "' on 'FileReader': parameter 1 is not of type 'Blob'.")
    	
    	fr.result = ''

    	setTimeout(function(){
    		this.readyState = FileReader.LOADING
    		fr.dispatchEvent(new Event('load'))
    		fr.dispatchEvent(new Event('loadend'))
    	})
    }

    FileReader.EMPTY = 0
    FileReader.LOADING = 1
    FileReader.DONE = 2
    FileReader.prototype.error = null
    FileReader.prototype.onabort = null
    FileReader.prototype.onerror = null
    FileReader.prototype.onload = null
    FileReader.prototype.onloadend = null
    FileReader.prototype.onloadstart = null
    FileReader.prototype.onprogress = null

    FileReader.prototype.readAsDataURL = function(blob) {
    	_read(this, blob, 'readAsDataURL')
    	this.result = 'data:' + blob.type + ';base64,' + encodeByteArray(blob._buffer)
    }

    FileReader.prototype.readAsText = function(blob) {
    	_read(this, blob, 'readAsText')
    	this.result = fromUtf8Array(blob._buffer)
    }

    FileReader.prototype.readAsArrayBuffer = function(blob) {
    	_read(this, blob, 'readAsText')
    	this.result = blob._buffer.slice()
    }

    FileReader.prototype.abort = function() {}

    
    /********************************************************/
    /*                         URL                          */
    /********************************************************/
    URL.createObjectURL = function(blob) {
      return blob instanceof Blob 
        ? 'data:' + blob.type + ';base64,' + encodeByteArray(blob._buffer)
        : createObjectURL.call(URL, blob)
    }
    
    URL.revokeObjectURL = function(url) {
      revokeObjectURL && revokeObjectURL.call(URL, url)
    }

    /********************************************************/
    /*                         XHR                          */
    /********************************************************/
    var _send = global.XMLHttpRequest && global.XMLHttpRequest.prototype.send
    if (_send) {
      XMLHttpRequest.prototype.send = function(data) {
        if (data instanceof Blob) {
          this.setRequestHeader('Content-Type', data.type)
          _send.call(this, fromUtf8Array(data._buffer))
        } else {
          _send.call(this, data)
        }
      }
    }
    
    global.FileReader = FileReader
    global.File = File
    global.Blob = Blob
  }

  if (strTag) {
    File.prototype[strTag] = 'File'
    Blob.prototype[strTag] = 'Blob'
    FileReader.prototype[strTag] = 'FileReader'
  }

  function fixFileAndXHR() {
    var isIE = !!global.ActiveXObject || (
      '-ms-scroll-limit' in document.documentElement.style && 
      '-ms-ime-align' in document.documentElement.style
    )

    // Monkey patched 
    // IE don't set Content-Type header on XHR whose body is a typed Blob
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/6047383
    var _send = global.XMLHttpRequest && global.XMLHttpRequest.prototype.send
    if (isIE && _send) {
      XMLHttpRequest.prototype.send = function(data) {
        if (data instanceof Blob) {
          this.setRequestHeader('Content-Type', data.type)
          _send.call(this, data)
        } else {
          _send.call(this, data)
        }
      }
    }

    try {
      new File([], '')
    } catch(e) {
      try {
        var klass = new Function('class File extends Blob {' + 
          'constructor(chunks, name, opts) {' +
            'opts = opts || {};' +
            'super(chunks, opts || {});' +
            'this.name = name;' +
            'this.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date;' +
            'this.lastModified = +this.lastModifiedDate;' +
          '}};' +
          'return new File([], ""), File'
        )()
        global.File = klass
      } catch(e) {
        var klass = function(b, d, c) {
          var blob = new Blob(b, c)
          var t = c && void 0 !== c.lastModified ? new Date(c.lastModified) : new Date
          
          blob.name = d
          blob.lastModifiedDate = t
          blob.lastModified = +t
          blob.toString = function() {
            return '[object File]'
          }
          
          if (strTag)
            blob[strTag] = 'File'
          
          return blob
        }
        global.File = klass
      }
    }
  }

  if (blobSupported) {
    fixFileAndXHR()
    global.Blob = blobSupportsArrayBufferView ? global.Blob : BlobConstructor
  } else if (blobBuilderSupported) {
    fixFileAndXHR()
    global.Blob = BlobBuilderConstructor;
  } else {
    FakeBlobBuilder()
  }

})();
