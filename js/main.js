(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/base64-js/lib/b64.js","/../../node_modules/base64-js/lib")
},{"buffer":2,"rH1JPG":5}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/buffer/index.js","/../../node_modules/buffer")
},{"base64-js":1,"buffer":2,"ieee754":4,"rH1JPG":5}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var Hogan = {};

(function (Hogan, useArrayBuffer) {
  Hogan.Template = function (renderFunc, text, compiler, options) {
    this.r = renderFunc || this.r;
    this.c = compiler;
    this.options = options;
    this.text = text || '';
    this.buf = (useArrayBuffer) ? [] : '';
  }

  Hogan.Template.prototype = {
    // render: replaced by generated code.
    r: function (context, partials, indent) { return ''; },

    // variable escaping
    v: hoganEscape,

    // triple stache
    t: coerceToString,

    render: function render(context, partials, indent) {
      return this.ri([context], partials || {}, indent);
    },

    // render internal -- a hook for overrides that catches partials too
    ri: function (context, partials, indent) {
      return this.r(context, partials, indent);
    },

    // tries to find a partial in the curent scope and render it
    rp: function(name, context, partials, indent) {
      var partial = partials[name];

      if (!partial) {
        return '';
      }

      if (this.c && typeof partial == 'string') {
        partial = this.c.compile(partial, this.options);
      }

      return partial.ri(context, partials, indent);
    },

    // render a section
    rs: function(context, partials, section) {
      var tail = context[context.length - 1];

      if (!isArray(tail)) {
        section(context, partials, this);
        return;
      }

      for (var i = 0; i < tail.length; i++) {
        context.push(tail[i]);
        section(context, partials, this);
        context.pop();
      }
    },

    // maybe start a section
    s: function(val, ctx, partials, inverted, start, end, tags) {
      var pass;

      if (isArray(val) && val.length === 0) {
        return false;
      }

      if (typeof val == 'function') {
        val = this.ls(val, ctx, partials, inverted, start, end, tags);
      }

      pass = (val === '') || !!val;

      if (!inverted && pass && ctx) {
        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
      }

      return pass;
    },

    // find values with dotted names
    d: function(key, ctx, partials, returnFound) {
      var names = key.split('.'),
          val = this.f(names[0], ctx, partials, returnFound),
          cx = null;

      if (key === '.' && isArray(ctx[ctx.length - 2])) {
        return ctx[ctx.length - 1];
      }

      for (var i = 1; i < names.length; i++) {
        if (val && typeof val == 'object' && names[i] in val) {
          cx = val;
          val = val[names[i]];
        } else {
          val = '';
        }
      }

      if (returnFound && !val) {
        return false;
      }

      if (!returnFound && typeof val == 'function') {
        ctx.push(cx);
        val = this.lv(val, ctx, partials);
        ctx.pop();
      }

      return val;
    },

    // find values with normal names
    f: function(key, ctx, partials, returnFound) {
      var val = false,
          v = null,
          found = false;

      for (var i = ctx.length - 1; i >= 0; i--) {
        v = ctx[i];
        if (v && typeof v == 'object' && key in v) {
          val = v[key];
          found = true;
          break;
        }
      }

      if (!found) {
        return (returnFound) ? false : "";
      }

      if (!returnFound && typeof val == 'function') {
        val = this.lv(val, ctx, partials);
      }

      return val;
    },

    // higher order templates
    ho: function(val, cx, partials, text, tags) {
      var compiler = this.c;
      var options = this.options;
      options.delimiters = tags;
      var text = val.call(cx, text);
      text = (text == null) ? String(text) : text.toString();
      this.b(compiler.compile(text, options).render(cx, partials));
      return false;
    },

    // template result buffering
    b: (useArrayBuffer) ? function(s) { this.buf.push(s); } :
                          function(s) { this.buf += s; },
    fl: (useArrayBuffer) ? function() { var r = this.buf.join(''); this.buf = []; return r; } :
                           function() { var r = this.buf; this.buf = ''; return r; },

    // lambda replace section
    ls: function(val, ctx, partials, inverted, start, end, tags) {
      var cx = ctx[ctx.length - 1],
          t = null;

      if (!inverted && this.c && val.length > 0) {
        return this.ho(val, cx, partials, this.text.substring(start, end), tags);
      }

      t = val.call(cx);

      if (typeof t == 'function') {
        if (inverted) {
          return true;
        } else if (this.c) {
          return this.ho(t, cx, partials, this.text.substring(start, end), tags);
        }
      }

      return t;
    },

    // lambda replace variable
    lv: function(val, ctx, partials) {
      var cx = ctx[ctx.length - 1];
      var result = val.call(cx);

      if (typeof result == 'function') {
        result = coerceToString(result.call(cx));
        if (this.c && ~result.indexOf("{\u007B")) {
          return this.c.compile(result, this.options).render(cx, partials);
        }
      }

      return coerceToString(result);
    }

  };

  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos =/\'/g,
      rQuot = /\"/g,
      hChars =/[&<>\"\']/;


  function coerceToString(val) {
    return String((val === null || val === undefined) ? '' : val);
  }

  function hoganEscape(str) {
    str = coerceToString(str);
    return hChars.test(str) ?
      str
        .replace(rAmp,'&amp;')
        .replace(rLt,'&lt;')
        .replace(rGt,'&gt;')
        .replace(rApos,'&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }

  var isArray = Array.isArray || function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };

})(typeof exports !== 'undefined' ? exports : Hogan);


}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/hogan.js/lib/template.js","/../../node_modules/hogan.js/lib")
},{"buffer":2,"rH1JPG":5}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/ieee754/index.js","/../../node_modules/ieee754")
},{"buffer":2,"rH1JPG":5}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/process/browser.js","/../../node_modules/process")
},{"buffer":2,"rH1JPG":5}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
(function(){
  var repos = require('./github-repos.js').repos;
  //var Trianglify = require('trianglify');
  var MZ = require('./mzlogo').MZ();


  var completeIndex = function(){
    endLoading();
    completeSensitiveFields();
    repos.addReposList("#repos");
  };

  var completeCv = function(){
    endLoading();
  };

  var wellcome = function(){
    runLogo();
  };

  var templates = {
    index:{
      wellcome: wellcome,
      template: require('../templates/index.html'),
      postRender: completeIndex
    },
    cv:{
      wellcome: wellcome,
      template: require('../templates/cv.html'),
      postRender: completeCv
    }
  };

  var $mainContainer = $('#main-container');

  // Place the logo on the svg canvas and start the animaion
  var runLogo = function(){
    var $logo = $("#logo");
    var $logoSvg = $('#logo-svg');
    var logoWidth = $logo.width();
    var logoHeight = $logo.height();
    /* var pattern = Trianglify({
       height: $loading.height(),
       width: $loading.width(),
       cell_size: 40}); */
    $logoSvg.width(logoWidth);
    $logoSvg.height(logoHeight+1);
    MZ.init('#logo-svg', logoWidth-2, logoHeight, 500);
    MZ.startAnimation();
  };

  var initializeContent = function(){
    $('.hidden').each(function(){
      var $this = $(this);
      $this.hide();
      $this.removeClass('hidden');
      $this.fadeIn(1000);
      setTimeout(function(){
        manageScrollFadeIns();
      }, 100);
    });
  };

  var manageScrollFadeIns = function(scrollBottom){
    if(scrollBottom === undefined){
      scrollBottom = $(window).scrollTop() + $(window).height();
    }
    $('.fadeIn').each(function(){
      var $this = $(this);
      var thisTop = $this.offset().top;
      var thisBottom = thisTop + $this.height();
      if(thisTop >= scrollBottom){
        $this.css('opacity', 0.3);
        $.data(this, 'viewed', false);
      }

      if(thisBottom < scrollBottom && !$.data(this, 'viewed')){
        $.data(this, 'viewed', true);
        $this.animate({opacity:1}, 1000);
      }
    });
  };

  var endLoading = function(){
    var $loading = $('#loading');
    if($loading.is(":visible")){
      // Wait the logo animation completes
      setTimeout(function(){
        $loading.fadeOut(500);
        initializeContent();
      }, 3000);
    }else{
      initializeContent();
    }
  };

  var completeSensitiveFields = function(){
    var name = 'zitellimateus';
    var domain = 'gmail.com';
    var country = '+61';
    var region = '';
    var phone = '0402 586';
    $('#email-adress').text(name + '@' + domain);
    $('#phone-number').text([country, region, phone].join(' '));
  };

  var scrollTo = function(div){
    var duration = 400;
    $('html, body').animate({
      scrollTop: $(div).offset().top
    }, duration);
  };

  var loadContent = function(wellcome){
    var hash = document.location.hash.slice(1);
    var targetTemplate = templates.index;
    if(hash !== ''){
      targetTemplate = templates[hash];
    }

    if(wellcome && targetTemplate.wellcome){
      targetTemplate.wellcome();
    }

    if(targetTemplate.preRender){
      targetTemplate.preRender();
    }

    var html = targetTemplate.template.render();
    $mainContainer.html(html);

    if(targetTemplate.postRender){
      targetTemplate.postRender();
    }
    setEvents();
  };

  var setEvents = function(){
    $(".down-arrow").click(function(){
      var target = $(this).attr('data-destination');
      scrollTo(target);
    });

    $("ul.navigation-links a").each(function(){
      var $this = $(this);
      var scrollToElement = $this.attr('href');
      $this.on('click', function(e){
        e.preventDefault();
        if(templates[scrollToElement.slice(1)]){
          document.location.hash = scrollToElement;
        }
        scrollTo(scrollToElement);
      });
    });

    $(window).on('scroll', function(e){
      var scrollTop = e.originalEvent.pageY;
      var scrollBottom = scrollTop + $(this).height();
      manageScrollFadeIns(scrollBottom);
    });

    $(window).on('hashchange',function(){
      loadContent();
    });
  };

  setEvents();
  loadContent(true);
}());

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_b6252a1c.js","/")
},{"../templates/cv.html":9,"../templates/index.html":10,"./github-repos.js":7,"./mzlogo":8,"buffer":2,"rH1JPG":5}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var repos = (function($){
	var reposModule = {};
	var repos;

	var createRepoElement = function($ul, repo){
		var $li = $('<li></li>');
		var $a = $('<a class="col-md-4 repo-link" target="_blank"></a>');
		var $div = $('<div class="repo-content"></div>');
		var $title = $('<h3></h3>');
		var $description = $('<p></p>');
    $title.text(repo.name);
    $description.text(repo.description);
		$title.appendTo($div);
		$description.appendTo($div);
		$div.addClass(repo.language);
		$div.appendTo($a);
		$a.attr('href', repo.html_url);
		$a.appendTo($li);
		$li.appendTo($ul);
	};

	/*
	 * Add the repository list in an element
	 * param {string || jquery Element} element The element selector where the
	 * list will be put in
	 */
	reposModule.addReposList = function(element, all){
		loadRepos(all).then(function(){
			var $element = $(element);
			if(repos === undefined){
				$element.html("<p>Error loading my repositories.</p>");
				throw Error("Please load the repository list.");
			}else if(repos === null){
				$element.html("<p>Error loading my repositories.");
				throw Error("No repositories returned.");
			}

			var $ul = $('<ul class="repo-list list-unstyled"></ul>');
			repos.filter(function(repo){
        return !repo.fork;
      }).map(function(repo){
				createRepoElement($ul, repo);
			});
			$ul.appendTo($element);
		});
	};

	/*
	 * Load the repos list for a given user
	 * param {integer} how_many How many repos to load
	 * param {string} user Github username or org
	 * param {integer} page The page number to be retrieved
	 */

	var loadRepos = function(user, page){
		var how_many = 100;
		user = user || "MateusZitelli";
		page = page || 1;
		repos = repos || [];

		var uri = "https://api.github.com/users/"+ user +"/repos?callback=?"
			+ "&sort=created"
			+ "&type=owner"
			+ "&per_page=" + how_many
			+ "&page=" + page;

		return $.getJSON(uri, function(data){
			var loadedRepos = data.data;
			if(data.meta.status !== 200){
				repos = null;
				return;
			}
			if(loadedRepos.length !== 0){
				repos = repos.concat(loadedRepos);
				loadRepos(user, page + 1);
			}
		});
	};

	return reposModule;
}($));

exports.repos = repos;

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/github-repos.js","/")
},{"buffer":2,"rH1JPG":5}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var MZ = function(services){
  "use strict";
  //Private vars
  var module = {};

  var attrs = {
    border:{
      fill: "none",
      stroke: "#000",
      strokeWidth: 1,
      "fill-opacity": 1.0
    },
    invisible:{
      strokeWidth: 1,
      fill: "none",
      stroke: "#000",
      "stroke-opacity": 0.0
    }
  };

  var matrixes ={
    M: new Snap.Matrix(),
    Z: new Snap.Matrix()
  };

  var snap;
  var stepDuration;
  var coords = {};
  var paths = {};

  // Private funtions
  var setCoords = function(){
    coords = {
      triangle: [
        new Coord(1, 0),
        new Coord(module.size.x, 0),
        new Coord(module.size.x / 2.0, module.size.y / 2.0)
      ],
      mirroredTriangle: [
        new Coord(1, module.size.y),
        new Coord(module.size.x, module.size.y),
        new Coord(module.size.x / 2.0, module.size.y / 2.0)
      ],
      externBox: [
        new Coord(1, 0),
        new Coord(module.size.x, 0),
        new Coord(module.size.x, module.size.y),
        new Coord(1, module.size.y)
      ],
      M: [
        new Coord(1, module.size.y),
        new Coord(1, 0),
        new Coord(module.size.x / 2.0, module.size.y / 2.0),
        new Coord(module.size.x, 0),
        new Coord(module.size.x, module.size.y)
      ],
      Z: [
        new Coord(1, 0),
        new Coord(module.size.x, 0),
        new Coord(1, module.size.y),
        new Coord(module.size.x, module.size.y)
      ]
    };
  };

  var setPaths = function(){
    if(coords === undefined){
      throw "Object coordinates undefined.";
    }

    paths = {
      triangle: new Path(coords.triangle, true),
      mirroredTriangle: new Path(coords.mirroredTriangle, true),
      externBox: new Path(coords.externBox, true),
      M: new Path(coords.M, false),
      Z: new Path(coords.Z, false)
    };

    paths.triangleCopy = paths.triangle.copy();
  };

  var applyInitialStateInSnap = function(){
    paths.triangle.apply(snap).attr(attrs.border);
    paths.triangleCopy.apply(snap).attr(attrs.border);
    paths.externBox.apply(snap).attr(attrs.invisible);
    paths.M.apply(snap).attr(attrs.invisible);
    paths.Z.apply(snap).attr(attrs.invisible);
  };

  var createMZ = function(){
    paths.MBox = new Path(coords.externBox, true);

    paths.MBox.apply(snap).attr(attrs.border);
    paths.mirroredTriangle.apply(snap).attr(attrs.border);

    var MGroup = snap.group(paths.triangle.path.clone(),
                              paths.mirroredTriangle.path, paths.MBox.path);
    var ZGroup = MGroup.clone();

    var showMZ = function(){
      paths.M.path.animate({'stroke-opacity': 1, strokeWidth: 5}, stepDuration,
                            mina.easeinout);
      paths.Z.path.animate({'stroke-opacity': 1, strokeWidth: 5}, stepDuration,
                            mina.easeinout);
      MGroup.animate({'stroke-opacity': 0}, stepDuration, mina.easeinout);
      ZGroup.animate({'stroke-opacity': 0}, stepDuration, mina.easeinout);
    };

    var moveGroupsToFinalDestinationAndShowMZ = function(){
      paths.M.path.animate({transform: matrixes.M}, stepDuration,
                            mina.easeinout);
      paths.Z.path.animate({transform: matrixes.Z}, stepDuration,
                            mina.easeinout);
      MGroup.animate({transform: matrixes.M}, stepDuration, mina.easeinout);
      ZGroup.animate({transform: matrixes.Z}, stepDuration, mina.easeinout);
      setTimeout(showMZ , stepDuration);
    };

    setTimeout(moveGroupsToFinalDestinationAndShowMZ, stepDuration);
  };

  //Public methods
  module.startAnimation = function(){
    if(this.size === undefined){
      throw "The MZ was not initialized.";
    }
    paths.triangleCopy.animateCoords(coords.mirroredTriangle, stepDuration);
    paths.externBox.path.animate({'stroke-opacity':1, }, stepDuration,
                                  mina.easeinout);
    applyInitialStateInSnap();
    setTimeout(createMZ, stepDuration);
  };

  module.init = function(div, width, height, duration){
    snap = Snap(div);
    stepDuration = duration;

    this.size = new Coord();
    this.size.x = width;
    this.size.y = height;

    matrixes.M.scale(0.2, 0.2, module.size.x / 2.0, module.size.y);
    matrixes.M.translate(0, -module.size.y * 3.5);

    matrixes.Z.scale(0.2, 0.2, module.size.x / 2.0, module.size.y);
    matrixes.Z.translate(0, -module.size.y * 0.5);

    setCoords();
    setPaths();
    applyInitialStateInSnap();
  };

  return module;
};
/*
 * Define um elemento de coordenada bidimensional.
 * @param {int} x Abscissas
 * @param {int} y Ordenadas
 */
var Coord = function(x, y){
  this.x = x;
  this.y = y;
};

/* 
 * Gera um elemento path a partir das coordenadas passadas 
 * @param {list of Coord} coords Lista de coordenadas dos pontos
 */
var Path = function(coords, closed){
  if(coords === null){
    return;
  }
  this.coords = coords;
  this.closed = closed;
  this.svgPathString = this.strigifyCoords(coords);
};

/*
 * Gera uma string coma descrição de um path no formado definido
 * pela especificações do svg
 * @param {list of Coord} coords Lista de coordenadas
 */
Path.prototype.strigifyCoords = function(coords){
  var svgPathString = 'M';
  var finalPathChar = this.closed ? 'z': '';
  for(var index in coords){ 
    svgPathString += coords[index].x + ',' + coords[index].y;
    //If is the last line make a close path
    svgPathString += index == coords.length - 1 ? finalPathChar : 'L';
  }
  return svgPathString;
};

/*
 * Aplica o path à um elemento Snap
 * @param {Snap element} snap Elemento Snap no qual o path será aplicado
 */
Path.prototype.apply = function(snap){
  this.path = snap.path(this.svgPathString);
  return this.path;
};

/*
 * Cria uma cópia do path
 * @return {Path element} Copy of
 */
Path.prototype.copy = function(){
  var copy = new Path();
  copy.svgPathString = this.svgPathString;
  copy.coords = this.coords;
  copy.closed = this.closed;
  return copy;
};

/*
 * Anima o path para as novas coordenadas passadas
 * @param {list of Coords} coords Lista com as novas coordenadas
 * @param {float} time Duração da animação em microssegundos
 */
Path.prototype.animateCoords = function(coords, time){
  var newPathString = this.strigifyCoords(coords);
  this.path.animate({path:newPathString}, time, mina.easeinout);
};

exports.MZ = MZ;

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/mzlogo.js","/")
},{"buffer":2,"rH1JPG":5}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var t = new (require('hogan.js/lib/template')).Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div id=\"cv\" class=\"hidden content\">");_.b("\n" + i);_.b("  <article class=\"container\">");_.b("\n" + i);_.b("    <div class=\"row\">");_.b("\n" + i);_.b("      <div class=\"col-sm-12 paper\">");_.b("\n" + i);_.b("        <h1>Mateus Zitelli, Curriculum Vitae</h1>");_.b("\n" + i);_.b("        <p>");_.b("\n" + i);_.b("          I'm a 22 years old Brazilian student of Computer Science, with 7 years of experience in software development. I'm in the third year of Computer Science course at Universidade Federal do ABC and currently in exchange at Australian National University by the Brazilian program Science without Borders.");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        <h2>Techinical skills</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <p>");_.b("\n" + i);_.b("          During the last 7 years I've developed software for different proposes, from assembly to AVR microcontrollers, simple applications with scheme, to complete web apps using Flux + React.js. Those years studying different technologies allowed me to have a good notion of what is necessary to develop software with quality independent of the adopted technologies.");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        <ul>");_.b("\n" + i);_.b("          <li>Basic C programming for desktop applications;</li>");_.b("\n" + i);_.b("          <li>Advanced python programming for general propose usage, data analysis and web development with Django;</li>");_.b("\n" + i);_.b("          <li>ES2016 JavaScript linted, tested;</li>");_.b("\n" + i);_.b("          <li>Front-end development with React.js, Flux using Redux and usage of immutable datatypes with Immutable.js;</li>");_.b("\n" + i);_.b("          <li>Node.js + express/koa.js for general back-end solutions, including REST APIs;</li>");_.b("\n" + i);_.b("          <li>Advanced git experience for code version controll;</li>");_.b("\n" + i);_.b("          <li>Gulp, Grunt and Webpack for automation and management of JavaScript projects;</li>");_.b("\n" + i);_.b("          <li>CSS2, CSS3, Bootstrap, handwritten for responsible layouts;</li>");_.b("\n" + i);_.b("          <li>Experience with MongoDB and RethinkDB for noSQL databases;</li> ");_.b("\n" + i);_.b("          <li>Scheme as a general propose language (and because it's fun!);</li>");_.b("\n" + i);_.b("          <li>XHTML 4.0, (X)HTML5, handwritten with experience in automation tools such as emmet;</li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("        <h2>Extras</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Research Program - Qeopps - Young Talents of Science/CNPq");_.b("\n" + i);_.b("            <br>(Q)eopps is an (E)volutionary (O)ptimizator for (P)arallel (P)rogram(s)");_.b("\n" + i);_.b("            <br><small>January/2013 - December/2013</small>");_.b("\n" + i);_.b("          </h3>");_.b("\n" + i);_.b("          <ul>");_.b("\n" + i);_.b("            <li><strong>Honorable Mention</strong> in the axis of Communication and Information - Scientific Initiation Meeting</li>");_.b("\n" + i);_.b("            <li>Python for complex applications;</li>");_.b("\n" + i);_.b("            <li>Scheme for complex applications;</li>");_.b("\n" + i);_.b("            <li>Experience with academic writing;</li>");_.b("\n" + i);_.b("            <li>Experience with parallel programming using Posix Threads;</li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Hackaton 99jobs - First Place");_.b("\n" + i);_.b("          <small>12 and 13 of April of 2014</small></h3>");_.b("\n" + i);_.b("          <p>As Front-end developer me with my team developed the winner project <a href=\"http://genteboa.meteor.com\">Gente Boa</a>.</p>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <h2>Education</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Australian National University");_.b("\n" + i);_.b("          <small>November/2015 - December/2016</small></h3>");_.b("\n" + i);_.b("          <p>Scholarship from CNPq with the program Science Without Borders</p>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Universidade Federal do ABC");_.b("\n" + i);_.b("          <small>April/2012 - April/2017</small></h3>");_.b("\n" + i);_.b("          <p>Bachelor Degree in Science and Technology / Bachelor Degree in Computer Science</p>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <h2>Experience</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Full-stack developer/CTO at Lóg BI");_.b("\n" + i);_.b("          <br><small>January/2015 - November/2015</small></h3>");_.b("\n" + i);_.b("          <ul>");_.b("\n" + i);_.b("              <li>Complete development of a complex web app;</li>");_.b("\n" + i);_.b("              <li>Api REST with Node.js + Koa.js;</li> ");_.b("\n" + i);_.b("              <li>Mongodb as a noSQL database;</li>");_.b("\n" + i);_.b("              <li>React.js for reusable UI components;</li>");_.b("\n" + i);_.b("              <li>Flux as the architeture for the front-end application;</li>");_.b("\n" + i);_.b("              <li>Immutable data structs with Immutable.js;</li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Front-end development at 99jobs");_.b("\n" + i);_.b("          <br><small>July/2014 - November/2014</small></h3>");_.b("\n" + i);_.b("          <ul>");_.b("\n" + i);_.b("            <li>CSS3, SASS, Bootstrap for pixels perfect and responsive designs;</li>");_.b("\n" + i);_.b("            <li>Javascript and JQuery for dynamic webpages;</li>");_.b("\n" + i);_.b("            <li>Experience with solution that were used by thousands users everyday;</li>");_.b("\n" + i);_.b("            <li>React.js + Flux for a web app development;</li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Internship - Metamáquina (<a href=\"http://metamaquina.com.br/\">http://metamaquina.com.br/</a>)");_.b("\n" + i);_.b("          <br><small>April/2012 - September/2012</small></h3>");_.b("\n" + i);_.b("          <ul>");_.b("\n" + i);_.b("            <li>Experience with configuration of 3D printers;</li>");_.b("\n" + i);_.b("            <li>Experience with 3D printing with open source tools;</li>");_.b("\n" + i);_.b("            <li>3D programmatic modeling with Openscad;</li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  </article>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});module.exports = {  render: function () { return t.render.apply(t, arguments); },  r: function () { return t.r.apply(t, arguments); },  ri: function () { return t.ri.apply(t, arguments); }};
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../templates/cv.html","/../templates")
},{"buffer":2,"hogan.js/lib/template":3,"rH1JPG":5}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var t = new (require('hogan.js/lib/template')).Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div id=\"intro\" class=\"hidden content\">");_.b("\n" + i);_.b("  <header class=\"container pull-left big-table\">");_.b("\n" + i);_.b("    <div class=\"row center-cell\">");_.b("\n" + i);_.b("      <div class=\"col-sm-12 centered-element\">");_.b("\n" + i);_.b("        <h1>Mateus Zitelli</h1>");_.b("\n" + i);_.b("        <h2>Full stack web developer • Canberra, ACT - Australia</h2>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("      <div class=\"col-xs-6 col-sm-3 col-lg-2 text-center info\">");_.b("\n" + i);_.b("        <h2>Navigation</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <ul class=\"list-unstyled navigation-links\">");_.b("\n" + i);_.b("          <li><a href=\"#cv\">Curriculum</a></li>");_.b("\n" + i);_.b("          <li><a href=\"#repos-content\">Open-source projects</a></li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("      <div class=\"col-xs-6 col-sm-3 col-lg-2 text-center info\">");_.b("\n" + i);_.b("        <h2>Social</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <ul class=\"list-unstyled\">");_.b("\n" + i);_.b("          <li><a href=\"https://twitter.com/MateusZitelli\">Twitter</a></li>");_.b("\n" + i);_.b("          <li><a href=\"https://github.com/MateusZitelli\">Github</a></li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("      <div class=\"col-xs-6 col-sm-3 col-lg-2 text-center info\">");_.b("\n" + i);_.b("        <h2>Get in contact</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <ul class=\"list-unstyled\">");_.b("\n" + i);_.b("          <li id=\"email-adress\"></li>");_.b("\n" + i);_.b("          <li id=\"phone-number\"></li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  </header>");_.b("\n" + i);_.b("  <img src=\"images/down-arrow.svg\" data-destination=\"#repos-content\" class=\"down-arrow\" alt=\"Seta para ver mais\">");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<div class=\"hidden content\" id=\"repos-content\">");_.b("\n" + i);_.b("  <article class=\"container pull-left\">");_.b("\n" + i);_.b("    <h1>My GitHub repositories</h1>");_.b("\n" + i);_.b("    <div class=\"row\" id=\"repos\">");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  </article>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});module.exports = {  render: function () { return t.render.apply(t, arguments); },  r: function () { return t.r.apply(t, arguments); },  ri: function () { return t.ri.apply(t, arguments); }};
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../templates/index.html","/../templates")
},{"buffer":2,"hogan.js/lib/template":3,"rH1JPG":5}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21hdGV1cy9kZXYvbWF0ZXVzeml0ZWxsaS5naXRodWIuaW8vbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL21hdGV1cy9kZXYvbWF0ZXVzeml0ZWxsaS5naXRodWIuaW8vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwiL2hvbWUvbWF0ZXVzL2Rldi9tYXRldXN6aXRlbGxpLmdpdGh1Yi5pby9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL2hvbWUvbWF0ZXVzL2Rldi9tYXRldXN6aXRlbGxpLmdpdGh1Yi5pby9ub2RlX21vZHVsZXMvaG9nYW4uanMvbGliL3RlbXBsYXRlLmpzIiwiL2hvbWUvbWF0ZXVzL2Rldi9tYXRldXN6aXRlbGxpLmdpdGh1Yi5pby9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9ob21lL21hdGV1cy9kZXYvbWF0ZXVzeml0ZWxsaS5naXRodWIuaW8vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9ob21lL21hdGV1cy9kZXYvbWF0ZXVzeml0ZWxsaS5naXRodWIuaW8vc3JjL2pzL2Zha2VfYjYyNTJhMWMuanMiLCIvaG9tZS9tYXRldXMvZGV2L21hdGV1c3ppdGVsbGkuZ2l0aHViLmlvL3NyYy9qcy9naXRodWItcmVwb3MuanMiLCIvaG9tZS9tYXRldXMvZGV2L21hdGV1c3ppdGVsbGkuZ2l0aHViLmlvL3NyYy9qcy9temxvZ28uanMiLCIvaG9tZS9tYXRldXMvZGV2L21hdGV1c3ppdGVsbGkuZ2l0aHViLmlvL3NyYy90ZW1wbGF0ZXMvY3YuaHRtbCIsIi9ob21lL21hdGV1cy9kZXYvbWF0ZXVzeml0ZWxsaS5naXRodWIuaW8vc3JjL3RlbXBsYXRlcy9pbmRleC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLypcbiAqICBDb3B5cmlnaHQgMjAxMSBUd2l0dGVyLCBJbmMuXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqICB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiAgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqICBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG52YXIgSG9nYW4gPSB7fTtcblxuKGZ1bmN0aW9uIChIb2dhbiwgdXNlQXJyYXlCdWZmZXIpIHtcbiAgSG9nYW4uVGVtcGxhdGUgPSBmdW5jdGlvbiAocmVuZGVyRnVuYywgdGV4dCwgY29tcGlsZXIsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnIgPSByZW5kZXJGdW5jIHx8IHRoaXMucjtcbiAgICB0aGlzLmMgPSBjb21waWxlcjtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMudGV4dCA9IHRleHQgfHwgJyc7XG4gICAgdGhpcy5idWYgPSAodXNlQXJyYXlCdWZmZXIpID8gW10gOiAnJztcbiAgfVxuXG4gIEhvZ2FuLlRlbXBsYXRlLnByb3RvdHlwZSA9IHtcbiAgICAvLyByZW5kZXI6IHJlcGxhY2VkIGJ5IGdlbmVyYXRlZCBjb2RlLlxuICAgIHI6IGZ1bmN0aW9uIChjb250ZXh0LCBwYXJ0aWFscywgaW5kZW50KSB7IHJldHVybiAnJzsgfSxcblxuICAgIC8vIHZhcmlhYmxlIGVzY2FwaW5nXG4gICAgdjogaG9nYW5Fc2NhcGUsXG5cbiAgICAvLyB0cmlwbGUgc3RhY2hlXG4gICAgdDogY29lcmNlVG9TdHJpbmcsXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcihjb250ZXh0LCBwYXJ0aWFscywgaW5kZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5yaShbY29udGV4dF0sIHBhcnRpYWxzIHx8IHt9LCBpbmRlbnQpO1xuICAgIH0sXG5cbiAgICAvLyByZW5kZXIgaW50ZXJuYWwgLS0gYSBob29rIGZvciBvdmVycmlkZXMgdGhhdCBjYXRjaGVzIHBhcnRpYWxzIHRvb1xuICAgIHJpOiBmdW5jdGlvbiAoY29udGV4dCwgcGFydGlhbHMsIGluZGVudCkge1xuICAgICAgcmV0dXJuIHRoaXMucihjb250ZXh0LCBwYXJ0aWFscywgaW5kZW50KTtcbiAgICB9LFxuXG4gICAgLy8gdHJpZXMgdG8gZmluZCBhIHBhcnRpYWwgaW4gdGhlIGN1cmVudCBzY29wZSBhbmQgcmVuZGVyIGl0XG4gICAgcnA6IGZ1bmN0aW9uKG5hbWUsIGNvbnRleHQsIHBhcnRpYWxzLCBpbmRlbnQpIHtcbiAgICAgIHZhciBwYXJ0aWFsID0gcGFydGlhbHNbbmFtZV07XG5cbiAgICAgIGlmICghcGFydGlhbCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmMgJiYgdHlwZW9mIHBhcnRpYWwgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGFydGlhbCA9IHRoaXMuYy5jb21waWxlKHBhcnRpYWwsIHRoaXMub3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJ0aWFsLnJpKGNvbnRleHQsIHBhcnRpYWxzLCBpbmRlbnQpO1xuICAgIH0sXG5cbiAgICAvLyByZW5kZXIgYSBzZWN0aW9uXG4gICAgcnM6IGZ1bmN0aW9uKGNvbnRleHQsIHBhcnRpYWxzLCBzZWN0aW9uKSB7XG4gICAgICB2YXIgdGFpbCA9IGNvbnRleHRbY29udGV4dC5sZW5ndGggLSAxXTtcblxuICAgICAgaWYgKCFpc0FycmF5KHRhaWwpKSB7XG4gICAgICAgIHNlY3Rpb24oY29udGV4dCwgcGFydGlhbHMsIHRoaXMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFpbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb250ZXh0LnB1c2godGFpbFtpXSk7XG4gICAgICAgIHNlY3Rpb24oY29udGV4dCwgcGFydGlhbHMsIHRoaXMpO1xuICAgICAgICBjb250ZXh0LnBvcCgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBtYXliZSBzdGFydCBhIHNlY3Rpb25cbiAgICBzOiBmdW5jdGlvbih2YWwsIGN0eCwgcGFydGlhbHMsIGludmVydGVkLCBzdGFydCwgZW5kLCB0YWdzKSB7XG4gICAgICB2YXIgcGFzcztcblxuICAgICAgaWYgKGlzQXJyYXkodmFsKSAmJiB2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YWwgPSB0aGlzLmxzKHZhbCwgY3R4LCBwYXJ0aWFscywgaW52ZXJ0ZWQsIHN0YXJ0LCBlbmQsIHRhZ3MpO1xuICAgICAgfVxuXG4gICAgICBwYXNzID0gKHZhbCA9PT0gJycpIHx8ICEhdmFsO1xuXG4gICAgICBpZiAoIWludmVydGVkICYmIHBhc3MgJiYgY3R4KSB7XG4gICAgICAgIGN0eC5wdXNoKCh0eXBlb2YgdmFsID09ICdvYmplY3QnKSA/IHZhbCA6IGN0eFtjdHgubGVuZ3RoIC0gMV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFzcztcbiAgICB9LFxuXG4gICAgLy8gZmluZCB2YWx1ZXMgd2l0aCBkb3R0ZWQgbmFtZXNcbiAgICBkOiBmdW5jdGlvbihrZXksIGN0eCwgcGFydGlhbHMsIHJldHVybkZvdW5kKSB7XG4gICAgICB2YXIgbmFtZXMgPSBrZXkuc3BsaXQoJy4nKSxcbiAgICAgICAgICB2YWwgPSB0aGlzLmYobmFtZXNbMF0sIGN0eCwgcGFydGlhbHMsIHJldHVybkZvdW5kKSxcbiAgICAgICAgICBjeCA9IG51bGw7XG5cbiAgICAgIGlmIChrZXkgPT09ICcuJyAmJiBpc0FycmF5KGN0eFtjdHgubGVuZ3RoIC0gMl0pKSB7XG4gICAgICAgIHJldHVybiBjdHhbY3R4Lmxlbmd0aCAtIDFdO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PSAnb2JqZWN0JyAmJiBuYW1lc1tpXSBpbiB2YWwpIHtcbiAgICAgICAgICBjeCA9IHZhbDtcbiAgICAgICAgICB2YWwgPSB2YWxbbmFtZXNbaV1dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbCA9ICcnO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXR1cm5Gb3VuZCAmJiAhdmFsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFyZXR1cm5Gb3VuZCAmJiB0eXBlb2YgdmFsID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY3R4LnB1c2goY3gpO1xuICAgICAgICB2YWwgPSB0aGlzLmx2KHZhbCwgY3R4LCBwYXJ0aWFscyk7XG4gICAgICAgIGN0eC5wb3AoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9LFxuXG4gICAgLy8gZmluZCB2YWx1ZXMgd2l0aCBub3JtYWwgbmFtZXNcbiAgICBmOiBmdW5jdGlvbihrZXksIGN0eCwgcGFydGlhbHMsIHJldHVybkZvdW5kKSB7XG4gICAgICB2YXIgdmFsID0gZmFsc2UsXG4gICAgICAgICAgdiA9IG51bGwsXG4gICAgICAgICAgZm91bmQgPSBmYWxzZTtcblxuICAgICAgZm9yICh2YXIgaSA9IGN0eC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2ID0gY3R4W2ldO1xuICAgICAgICBpZiAodiAmJiB0eXBlb2YgdiA9PSAnb2JqZWN0JyAmJiBrZXkgaW4gdikge1xuICAgICAgICAgIHZhbCA9IHZba2V5XTtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICByZXR1cm4gKHJldHVybkZvdW5kKSA/IGZhbHNlIDogXCJcIjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFyZXR1cm5Gb3VuZCAmJiB0eXBlb2YgdmFsID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsID0gdGhpcy5sdih2YWwsIGN0eCwgcGFydGlhbHMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsO1xuICAgIH0sXG5cbiAgICAvLyBoaWdoZXIgb3JkZXIgdGVtcGxhdGVzXG4gICAgaG86IGZ1bmN0aW9uKHZhbCwgY3gsIHBhcnRpYWxzLCB0ZXh0LCB0YWdzKSB7XG4gICAgICB2YXIgY29tcGlsZXIgPSB0aGlzLmM7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIG9wdGlvbnMuZGVsaW1pdGVycyA9IHRhZ3M7XG4gICAgICB2YXIgdGV4dCA9IHZhbC5jYWxsKGN4LCB0ZXh0KTtcbiAgICAgIHRleHQgPSAodGV4dCA9PSBudWxsKSA/IFN0cmluZyh0ZXh0KSA6IHRleHQudG9TdHJpbmcoKTtcbiAgICAgIHRoaXMuYihjb21waWxlci5jb21waWxlKHRleHQsIG9wdGlvbnMpLnJlbmRlcihjeCwgcGFydGlhbHMpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gdGVtcGxhdGUgcmVzdWx0IGJ1ZmZlcmluZ1xuICAgIGI6ICh1c2VBcnJheUJ1ZmZlcikgPyBmdW5jdGlvbihzKSB7IHRoaXMuYnVmLnB1c2gocyk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihzKSB7IHRoaXMuYnVmICs9IHM7IH0sXG4gICAgZmw6ICh1c2VBcnJheUJ1ZmZlcikgPyBmdW5jdGlvbigpIHsgdmFyIHIgPSB0aGlzLmJ1Zi5qb2luKCcnKTsgdGhpcy5idWYgPSBbXTsgcmV0dXJuIHI7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7IHZhciByID0gdGhpcy5idWY7IHRoaXMuYnVmID0gJyc7IHJldHVybiByOyB9LFxuXG4gICAgLy8gbGFtYmRhIHJlcGxhY2Ugc2VjdGlvblxuICAgIGxzOiBmdW5jdGlvbih2YWwsIGN0eCwgcGFydGlhbHMsIGludmVydGVkLCBzdGFydCwgZW5kLCB0YWdzKSB7XG4gICAgICB2YXIgY3ggPSBjdHhbY3R4Lmxlbmd0aCAtIDFdLFxuICAgICAgICAgIHQgPSBudWxsO1xuXG4gICAgICBpZiAoIWludmVydGVkICYmIHRoaXMuYyAmJiB2YWwubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5obyh2YWwsIGN4LCBwYXJ0aWFscywgdGhpcy50ZXh0LnN1YnN0cmluZyhzdGFydCwgZW5kKSwgdGFncyk7XG4gICAgICB9XG5cbiAgICAgIHQgPSB2YWwuY2FsbChjeCk7XG5cbiAgICAgIGlmICh0eXBlb2YgdCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChpbnZlcnRlZCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYykge1xuICAgICAgICAgIHJldHVybiB0aGlzLmhvKHQsIGN4LCBwYXJ0aWFscywgdGhpcy50ZXh0LnN1YnN0cmluZyhzdGFydCwgZW5kKSwgdGFncyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHQ7XG4gICAgfSxcblxuICAgIC8vIGxhbWJkYSByZXBsYWNlIHZhcmlhYmxlXG4gICAgbHY6IGZ1bmN0aW9uKHZhbCwgY3R4LCBwYXJ0aWFscykge1xuICAgICAgdmFyIGN4ID0gY3R4W2N0eC5sZW5ndGggLSAxXTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWwuY2FsbChjeCk7XG5cbiAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmVzdWx0ID0gY29lcmNlVG9TdHJpbmcocmVzdWx0LmNhbGwoY3gpKTtcbiAgICAgICAgaWYgKHRoaXMuYyAmJiB+cmVzdWx0LmluZGV4T2YoXCJ7XFx1MDA3QlwiKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmMuY29tcGlsZShyZXN1bHQsIHRoaXMub3B0aW9ucykucmVuZGVyKGN4LCBwYXJ0aWFscyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvZXJjZVRvU3RyaW5nKHJlc3VsdCk7XG4gICAgfVxuXG4gIH07XG5cbiAgdmFyIHJBbXAgPSAvJi9nLFxuICAgICAgckx0ID0gLzwvZyxcbiAgICAgIHJHdCA9IC8+L2csXG4gICAgICByQXBvcyA9L1xcJy9nLFxuICAgICAgclF1b3QgPSAvXFxcIi9nLFxuICAgICAgaENoYXJzID0vWyY8PlxcXCJcXCddLztcblxuXG4gIGZ1bmN0aW9uIGNvZXJjZVRvU3RyaW5nKHZhbCkge1xuICAgIHJldHVybiBTdHJpbmcoKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkgPyAnJyA6IHZhbCk7XG4gIH1cblxuICBmdW5jdGlvbiBob2dhbkVzY2FwZShzdHIpIHtcbiAgICBzdHIgPSBjb2VyY2VUb1N0cmluZyhzdHIpO1xuICAgIHJldHVybiBoQ2hhcnMudGVzdChzdHIpID9cbiAgICAgIHN0clxuICAgICAgICAucmVwbGFjZShyQW1wLCcmYW1wOycpXG4gICAgICAgIC5yZXBsYWNlKHJMdCwnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlKHJHdCwnJmd0OycpXG4gICAgICAgIC5yZXBsYWNlKHJBcG9zLCcmIzM5OycpXG4gICAgICAgIC5yZXBsYWNlKHJRdW90LCAnJnF1b3Q7JykgOlxuICAgICAgc3RyO1xuICB9XG5cbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKGEpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG59KSh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgPyBleHBvcnRzIDogSG9nYW4pO1xuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2hvZ2FuLmpzL2xpYi90ZW1wbGF0ZS5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9ob2dhbi5qcy9saWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuKGZ1bmN0aW9uKCl7XG4gIHZhciByZXBvcyA9IHJlcXVpcmUoJy4vZ2l0aHViLXJlcG9zLmpzJykucmVwb3M7XG4gIC8vdmFyIFRyaWFuZ2xpZnkgPSByZXF1aXJlKCd0cmlhbmdsaWZ5Jyk7XG4gIHZhciBNWiA9IHJlcXVpcmUoJy4vbXpsb2dvJykuTVooKTtcblxuXG4gIHZhciBjb21wbGV0ZUluZGV4ID0gZnVuY3Rpb24oKXtcbiAgICBlbmRMb2FkaW5nKCk7XG4gICAgY29tcGxldGVTZW5zaXRpdmVGaWVsZHMoKTtcbiAgICByZXBvcy5hZGRSZXBvc0xpc3QoXCIjcmVwb3NcIik7XG4gIH07XG5cbiAgdmFyIGNvbXBsZXRlQ3YgPSBmdW5jdGlvbigpe1xuICAgIGVuZExvYWRpbmcoKTtcbiAgfTtcblxuICB2YXIgd2VsbGNvbWUgPSBmdW5jdGlvbigpe1xuICAgIHJ1bkxvZ28oKTtcbiAgfTtcblxuICB2YXIgdGVtcGxhdGVzID0ge1xuICAgIGluZGV4OntcbiAgICAgIHdlbGxjb21lOiB3ZWxsY29tZSxcbiAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvaW5kZXguaHRtbCcpLFxuICAgICAgcG9zdFJlbmRlcjogY29tcGxldGVJbmRleFxuICAgIH0sXG4gICAgY3Y6e1xuICAgICAgd2VsbGNvbWU6IHdlbGxjb21lLFxuICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9jdi5odG1sJyksXG4gICAgICBwb3N0UmVuZGVyOiBjb21wbGV0ZUN2XG4gICAgfVxuICB9O1xuXG4gIHZhciAkbWFpbkNvbnRhaW5lciA9ICQoJyNtYWluLWNvbnRhaW5lcicpO1xuXG4gIC8vIFBsYWNlIHRoZSBsb2dvIG9uIHRoZSBzdmcgY2FudmFzIGFuZCBzdGFydCB0aGUgYW5pbWFpb25cbiAgdmFyIHJ1bkxvZ28gPSBmdW5jdGlvbigpe1xuICAgIHZhciAkbG9nbyA9ICQoXCIjbG9nb1wiKTtcbiAgICB2YXIgJGxvZ29TdmcgPSAkKCcjbG9nby1zdmcnKTtcbiAgICB2YXIgbG9nb1dpZHRoID0gJGxvZ28ud2lkdGgoKTtcbiAgICB2YXIgbG9nb0hlaWdodCA9ICRsb2dvLmhlaWdodCgpO1xuICAgIC8qIHZhciBwYXR0ZXJuID0gVHJpYW5nbGlmeSh7XG4gICAgICAgaGVpZ2h0OiAkbG9hZGluZy5oZWlnaHQoKSxcbiAgICAgICB3aWR0aDogJGxvYWRpbmcud2lkdGgoKSxcbiAgICAgICBjZWxsX3NpemU6IDQwfSk7ICovXG4gICAgJGxvZ29Tdmcud2lkdGgobG9nb1dpZHRoKTtcbiAgICAkbG9nb1N2Zy5oZWlnaHQobG9nb0hlaWdodCsxKTtcbiAgICBNWi5pbml0KCcjbG9nby1zdmcnLCBsb2dvV2lkdGgtMiwgbG9nb0hlaWdodCwgNTAwKTtcbiAgICBNWi5zdGFydEFuaW1hdGlvbigpO1xuICB9O1xuXG4gIHZhciBpbml0aWFsaXplQ29udGVudCA9IGZ1bmN0aW9uKCl7XG4gICAgJCgnLmhpZGRlbicpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAkdGhpcy5oaWRlKCk7XG4gICAgICAkdGhpcy5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkdGhpcy5mYWRlSW4oMTAwMCk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIG1hbmFnZVNjcm9sbEZhZGVJbnMoKTtcbiAgICAgIH0sIDEwMCk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIG1hbmFnZVNjcm9sbEZhZGVJbnMgPSBmdW5jdGlvbihzY3JvbGxCb3R0b20pe1xuICAgIGlmKHNjcm9sbEJvdHRvbSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHNjcm9sbEJvdHRvbSA9ICQod2luZG93KS5zY3JvbGxUb3AoKSArICQod2luZG93KS5oZWlnaHQoKTtcbiAgICB9XG4gICAgJCgnLmZhZGVJbicpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICB2YXIgdGhpc1RvcCA9ICR0aGlzLm9mZnNldCgpLnRvcDtcbiAgICAgIHZhciB0aGlzQm90dG9tID0gdGhpc1RvcCArICR0aGlzLmhlaWdodCgpO1xuICAgICAgaWYodGhpc1RvcCA+PSBzY3JvbGxCb3R0b20pe1xuICAgICAgICAkdGhpcy5jc3MoJ29wYWNpdHknLCAwLjMpO1xuICAgICAgICAkLmRhdGEodGhpcywgJ3ZpZXdlZCcsIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgaWYodGhpc0JvdHRvbSA8IHNjcm9sbEJvdHRvbSAmJiAhJC5kYXRhKHRoaXMsICd2aWV3ZWQnKSl7XG4gICAgICAgICQuZGF0YSh0aGlzLCAndmlld2VkJywgdHJ1ZSk7XG4gICAgICAgICR0aGlzLmFuaW1hdGUoe29wYWNpdHk6MX0sIDEwMDApO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHZhciBlbmRMb2FkaW5nID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgJGxvYWRpbmcgPSAkKCcjbG9hZGluZycpO1xuICAgIGlmKCRsb2FkaW5nLmlzKFwiOnZpc2libGVcIikpe1xuICAgICAgLy8gV2FpdCB0aGUgbG9nbyBhbmltYXRpb24gY29tcGxldGVzXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRsb2FkaW5nLmZhZGVPdXQoNTAwKTtcbiAgICAgICAgaW5pdGlhbGl6ZUNvbnRlbnQoKTtcbiAgICAgIH0sIDMwMDApO1xuICAgIH1lbHNle1xuICAgICAgaW5pdGlhbGl6ZUNvbnRlbnQoKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNvbXBsZXRlU2Vuc2l0aXZlRmllbGRzID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbmFtZSA9ICd6aXRlbGxpbWF0ZXVzJztcbiAgICB2YXIgZG9tYWluID0gJ2dtYWlsLmNvbSc7XG4gICAgdmFyIGNvdW50cnkgPSAnKzYxJztcbiAgICB2YXIgcmVnaW9uID0gJyc7XG4gICAgdmFyIHBob25lID0gJzA0MDIgNTg2JztcbiAgICAkKCcjZW1haWwtYWRyZXNzJykudGV4dChuYW1lICsgJ0AnICsgZG9tYWluKTtcbiAgICAkKCcjcGhvbmUtbnVtYmVyJykudGV4dChbY291bnRyeSwgcmVnaW9uLCBwaG9uZV0uam9pbignICcpKTtcbiAgfTtcblxuICB2YXIgc2Nyb2xsVG8gPSBmdW5jdGlvbihkaXYpe1xuICAgIHZhciBkdXJhdGlvbiA9IDQwMDtcbiAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICBzY3JvbGxUb3A6ICQoZGl2KS5vZmZzZXQoKS50b3BcbiAgICB9LCBkdXJhdGlvbik7XG4gIH07XG5cbiAgdmFyIGxvYWRDb250ZW50ID0gZnVuY3Rpb24od2VsbGNvbWUpe1xuICAgIHZhciBoYXNoID0gZG9jdW1lbnQubG9jYXRpb24uaGFzaC5zbGljZSgxKTtcbiAgICB2YXIgdGFyZ2V0VGVtcGxhdGUgPSB0ZW1wbGF0ZXMuaW5kZXg7XG4gICAgaWYoaGFzaCAhPT0gJycpe1xuICAgICAgdGFyZ2V0VGVtcGxhdGUgPSB0ZW1wbGF0ZXNbaGFzaF07XG4gICAgfVxuXG4gICAgaWYod2VsbGNvbWUgJiYgdGFyZ2V0VGVtcGxhdGUud2VsbGNvbWUpe1xuICAgICAgdGFyZ2V0VGVtcGxhdGUud2VsbGNvbWUoKTtcbiAgICB9XG5cbiAgICBpZih0YXJnZXRUZW1wbGF0ZS5wcmVSZW5kZXIpe1xuICAgICAgdGFyZ2V0VGVtcGxhdGUucHJlUmVuZGVyKCk7XG4gICAgfVxuXG4gICAgdmFyIGh0bWwgPSB0YXJnZXRUZW1wbGF0ZS50ZW1wbGF0ZS5yZW5kZXIoKTtcbiAgICAkbWFpbkNvbnRhaW5lci5odG1sKGh0bWwpO1xuXG4gICAgaWYodGFyZ2V0VGVtcGxhdGUucG9zdFJlbmRlcil7XG4gICAgICB0YXJnZXRUZW1wbGF0ZS5wb3N0UmVuZGVyKCk7XG4gICAgfVxuICAgIHNldEV2ZW50cygpO1xuICB9O1xuXG4gIHZhciBzZXRFdmVudHMgPSBmdW5jdGlvbigpe1xuICAgICQoXCIuZG93bi1hcnJvd1wiKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgdmFyIHRhcmdldCA9ICQodGhpcykuYXR0cignZGF0YS1kZXN0aW5hdGlvbicpO1xuICAgICAgc2Nyb2xsVG8odGFyZ2V0KTtcbiAgICB9KTtcblxuICAgICQoXCJ1bC5uYXZpZ2F0aW9uLWxpbmtzIGFcIikuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgIHZhciBzY3JvbGxUb0VsZW1lbnQgPSAkdGhpcy5hdHRyKCdocmVmJyk7XG4gICAgICAkdGhpcy5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZih0ZW1wbGF0ZXNbc2Nyb2xsVG9FbGVtZW50LnNsaWNlKDEpXSl7XG4gICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9IHNjcm9sbFRvRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBzY3JvbGxUbyhzY3JvbGxUb0VsZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyIHNjcm9sbFRvcCA9IGUub3JpZ2luYWxFdmVudC5wYWdlWTtcbiAgICAgIHZhciBzY3JvbGxCb3R0b20gPSBzY3JvbGxUb3AgKyAkKHRoaXMpLmhlaWdodCgpO1xuICAgICAgbWFuYWdlU2Nyb2xsRmFkZUlucyhzY3JvbGxCb3R0b20pO1xuICAgIH0pO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlJyxmdW5jdGlvbigpe1xuICAgICAgbG9hZENvbnRlbnQoKTtcbiAgICB9KTtcbiAgfTtcblxuICBzZXRFdmVudHMoKTtcbiAgbG9hZENvbnRlbnQodHJ1ZSk7XG59KCkpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zha2VfYjYyNTJhMWMuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgcmVwb3MgPSAoZnVuY3Rpb24oJCl7XG5cdHZhciByZXBvc01vZHVsZSA9IHt9O1xuXHR2YXIgcmVwb3M7XG5cblx0dmFyIGNyZWF0ZVJlcG9FbGVtZW50ID0gZnVuY3Rpb24oJHVsLCByZXBvKXtcblx0XHR2YXIgJGxpID0gJCgnPGxpPjwvbGk+Jyk7XG5cdFx0dmFyICRhID0gJCgnPGEgY2xhc3M9XCJjb2wtbWQtNCByZXBvLWxpbmtcIiB0YXJnZXQ9XCJfYmxhbmtcIj48L2E+Jyk7XG5cdFx0dmFyICRkaXYgPSAkKCc8ZGl2IGNsYXNzPVwicmVwby1jb250ZW50XCI+PC9kaXY+Jyk7XG5cdFx0dmFyICR0aXRsZSA9ICQoJzxoMz48L2gzPicpO1xuXHRcdHZhciAkZGVzY3JpcHRpb24gPSAkKCc8cD48L3A+Jyk7XG4gICAgJHRpdGxlLnRleHQocmVwby5uYW1lKTtcbiAgICAkZGVzY3JpcHRpb24udGV4dChyZXBvLmRlc2NyaXB0aW9uKTtcblx0XHQkdGl0bGUuYXBwZW5kVG8oJGRpdik7XG5cdFx0JGRlc2NyaXB0aW9uLmFwcGVuZFRvKCRkaXYpO1xuXHRcdCRkaXYuYWRkQ2xhc3MocmVwby5sYW5ndWFnZSk7XG5cdFx0JGRpdi5hcHBlbmRUbygkYSk7XG5cdFx0JGEuYXR0cignaHJlZicsIHJlcG8uaHRtbF91cmwpO1xuXHRcdCRhLmFwcGVuZFRvKCRsaSk7XG5cdFx0JGxpLmFwcGVuZFRvKCR1bCk7XG5cdH07XG5cblx0Lypcblx0ICogQWRkIHRoZSByZXBvc2l0b3J5IGxpc3QgaW4gYW4gZWxlbWVudFxuXHQgKiBwYXJhbSB7c3RyaW5nIHx8IGpxdWVyeSBFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHNlbGVjdG9yIHdoZXJlIHRoZVxuXHQgKiBsaXN0IHdpbGwgYmUgcHV0IGluXG5cdCAqL1xuXHRyZXBvc01vZHVsZS5hZGRSZXBvc0xpc3QgPSBmdW5jdGlvbihlbGVtZW50LCBhbGwpe1xuXHRcdGxvYWRSZXBvcyhhbGwpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG5cdFx0XHRpZihyZXBvcyA9PT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0JGVsZW1lbnQuaHRtbChcIjxwPkVycm9yIGxvYWRpbmcgbXkgcmVwb3NpdG9yaWVzLjwvcD5cIik7XG5cdFx0XHRcdHRocm93IEVycm9yKFwiUGxlYXNlIGxvYWQgdGhlIHJlcG9zaXRvcnkgbGlzdC5cIik7XG5cdFx0XHR9ZWxzZSBpZihyZXBvcyA9PT0gbnVsbCl7XG5cdFx0XHRcdCRlbGVtZW50Lmh0bWwoXCI8cD5FcnJvciBsb2FkaW5nIG15IHJlcG9zaXRvcmllcy5cIik7XG5cdFx0XHRcdHRocm93IEVycm9yKFwiTm8gcmVwb3NpdG9yaWVzIHJldHVybmVkLlwiKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyICR1bCA9ICQoJzx1bCBjbGFzcz1cInJlcG8tbGlzdCBsaXN0LXVuc3R5bGVkXCI+PC91bD4nKTtcblx0XHRcdHJlcG9zLmZpbHRlcihmdW5jdGlvbihyZXBvKXtcbiAgICAgICAgcmV0dXJuICFyZXBvLmZvcms7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24ocmVwbyl7XG5cdFx0XHRcdGNyZWF0ZVJlcG9FbGVtZW50KCR1bCwgcmVwbyk7XG5cdFx0XHR9KTtcblx0XHRcdCR1bC5hcHBlbmRUbygkZWxlbWVudCk7XG5cdFx0fSk7XG5cdH07XG5cblx0Lypcblx0ICogTG9hZCB0aGUgcmVwb3MgbGlzdCBmb3IgYSBnaXZlbiB1c2VyXG5cdCAqIHBhcmFtIHtpbnRlZ2VyfSBob3dfbWFueSBIb3cgbWFueSByZXBvcyB0byBsb2FkXG5cdCAqIHBhcmFtIHtzdHJpbmd9IHVzZXIgR2l0aHViIHVzZXJuYW1lIG9yIG9yZ1xuXHQgKiBwYXJhbSB7aW50ZWdlcn0gcGFnZSBUaGUgcGFnZSBudW1iZXIgdG8gYmUgcmV0cmlldmVkXG5cdCAqL1xuXG5cdHZhciBsb2FkUmVwb3MgPSBmdW5jdGlvbih1c2VyLCBwYWdlKXtcblx0XHR2YXIgaG93X21hbnkgPSAxMDA7XG5cdFx0dXNlciA9IHVzZXIgfHwgXCJNYXRldXNaaXRlbGxpXCI7XG5cdFx0cGFnZSA9IHBhZ2UgfHwgMTtcblx0XHRyZXBvcyA9IHJlcG9zIHx8IFtdO1xuXG5cdFx0dmFyIHVyaSA9IFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy9cIisgdXNlciArXCIvcmVwb3M/Y2FsbGJhY2s9P1wiXG5cdFx0XHQrIFwiJnNvcnQ9Y3JlYXRlZFwiXG5cdFx0XHQrIFwiJnR5cGU9b3duZXJcIlxuXHRcdFx0KyBcIiZwZXJfcGFnZT1cIiArIGhvd19tYW55XG5cdFx0XHQrIFwiJnBhZ2U9XCIgKyBwYWdlO1xuXG5cdFx0cmV0dXJuICQuZ2V0SlNPTih1cmksIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dmFyIGxvYWRlZFJlcG9zID0gZGF0YS5kYXRhO1xuXHRcdFx0aWYoZGF0YS5tZXRhLnN0YXR1cyAhPT0gMjAwKXtcblx0XHRcdFx0cmVwb3MgPSBudWxsO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZihsb2FkZWRSZXBvcy5sZW5ndGggIT09IDApe1xuXHRcdFx0XHRyZXBvcyA9IHJlcG9zLmNvbmNhdChsb2FkZWRSZXBvcyk7XG5cdFx0XHRcdGxvYWRSZXBvcyh1c2VyLCBwYWdlICsgMSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0cmV0dXJuIHJlcG9zTW9kdWxlO1xufSgkKSk7XG5cbmV4cG9ydHMucmVwb3MgPSByZXBvcztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9naXRodWItcmVwb3MuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgTVogPSBmdW5jdGlvbihzZXJ2aWNlcyl7XG4gIFwidXNlIHN0cmljdFwiO1xuICAvL1ByaXZhdGUgdmFyc1xuICB2YXIgbW9kdWxlID0ge307XG5cbiAgdmFyIGF0dHJzID0ge1xuICAgIGJvcmRlcjp7XG4gICAgICBmaWxsOiBcIm5vbmVcIixcbiAgICAgIHN0cm9rZTogXCIjMDAwXCIsXG4gICAgICBzdHJva2VXaWR0aDogMSxcbiAgICAgIFwiZmlsbC1vcGFjaXR5XCI6IDEuMFxuICAgIH0sXG4gICAgaW52aXNpYmxlOntcbiAgICAgIHN0cm9rZVdpZHRoOiAxLFxuICAgICAgZmlsbDogXCJub25lXCIsXG4gICAgICBzdHJva2U6IFwiIzAwMFwiLFxuICAgICAgXCJzdHJva2Utb3BhY2l0eVwiOiAwLjBcbiAgICB9XG4gIH07XG5cbiAgdmFyIG1hdHJpeGVzID17XG4gICAgTTogbmV3IFNuYXAuTWF0cml4KCksXG4gICAgWjogbmV3IFNuYXAuTWF0cml4KClcbiAgfTtcblxuICB2YXIgc25hcDtcbiAgdmFyIHN0ZXBEdXJhdGlvbjtcbiAgdmFyIGNvb3JkcyA9IHt9O1xuICB2YXIgcGF0aHMgPSB7fTtcblxuICAvLyBQcml2YXRlIGZ1bnRpb25zXG4gIHZhciBzZXRDb29yZHMgPSBmdW5jdGlvbigpe1xuICAgIGNvb3JkcyA9IHtcbiAgICAgIHRyaWFuZ2xlOiBbXG4gICAgICAgIG5ldyBDb29yZCgxLCAwKSxcbiAgICAgICAgbmV3IENvb3JkKG1vZHVsZS5zaXplLngsIDApLFxuICAgICAgICBuZXcgQ29vcmQobW9kdWxlLnNpemUueCAvIDIuMCwgbW9kdWxlLnNpemUueSAvIDIuMClcbiAgICAgIF0sXG4gICAgICBtaXJyb3JlZFRyaWFuZ2xlOiBbXG4gICAgICAgIG5ldyBDb29yZCgxLCBtb2R1bGUuc2l6ZS55KSxcbiAgICAgICAgbmV3IENvb3JkKG1vZHVsZS5zaXplLngsIG1vZHVsZS5zaXplLnkpLFxuICAgICAgICBuZXcgQ29vcmQobW9kdWxlLnNpemUueCAvIDIuMCwgbW9kdWxlLnNpemUueSAvIDIuMClcbiAgICAgIF0sXG4gICAgICBleHRlcm5Cb3g6IFtcbiAgICAgICAgbmV3IENvb3JkKDEsIDApLFxuICAgICAgICBuZXcgQ29vcmQobW9kdWxlLnNpemUueCwgMCksXG4gICAgICAgIG5ldyBDb29yZChtb2R1bGUuc2l6ZS54LCBtb2R1bGUuc2l6ZS55KSxcbiAgICAgICAgbmV3IENvb3JkKDEsIG1vZHVsZS5zaXplLnkpXG4gICAgICBdLFxuICAgICAgTTogW1xuICAgICAgICBuZXcgQ29vcmQoMSwgbW9kdWxlLnNpemUueSksXG4gICAgICAgIG5ldyBDb29yZCgxLCAwKSxcbiAgICAgICAgbmV3IENvb3JkKG1vZHVsZS5zaXplLnggLyAyLjAsIG1vZHVsZS5zaXplLnkgLyAyLjApLFxuICAgICAgICBuZXcgQ29vcmQobW9kdWxlLnNpemUueCwgMCksXG4gICAgICAgIG5ldyBDb29yZChtb2R1bGUuc2l6ZS54LCBtb2R1bGUuc2l6ZS55KVxuICAgICAgXSxcbiAgICAgIFo6IFtcbiAgICAgICAgbmV3IENvb3JkKDEsIDApLFxuICAgICAgICBuZXcgQ29vcmQobW9kdWxlLnNpemUueCwgMCksXG4gICAgICAgIG5ldyBDb29yZCgxLCBtb2R1bGUuc2l6ZS55KSxcbiAgICAgICAgbmV3IENvb3JkKG1vZHVsZS5zaXplLngsIG1vZHVsZS5zaXplLnkpXG4gICAgICBdXG4gICAgfTtcbiAgfTtcblxuICB2YXIgc2V0UGF0aHMgPSBmdW5jdGlvbigpe1xuICAgIGlmKGNvb3JkcyA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHRocm93IFwiT2JqZWN0IGNvb3JkaW5hdGVzIHVuZGVmaW5lZC5cIjtcbiAgICB9XG5cbiAgICBwYXRocyA9IHtcbiAgICAgIHRyaWFuZ2xlOiBuZXcgUGF0aChjb29yZHMudHJpYW5nbGUsIHRydWUpLFxuICAgICAgbWlycm9yZWRUcmlhbmdsZTogbmV3IFBhdGgoY29vcmRzLm1pcnJvcmVkVHJpYW5nbGUsIHRydWUpLFxuICAgICAgZXh0ZXJuQm94OiBuZXcgUGF0aChjb29yZHMuZXh0ZXJuQm94LCB0cnVlKSxcbiAgICAgIE06IG5ldyBQYXRoKGNvb3Jkcy5NLCBmYWxzZSksXG4gICAgICBaOiBuZXcgUGF0aChjb29yZHMuWiwgZmFsc2UpXG4gICAgfTtcblxuICAgIHBhdGhzLnRyaWFuZ2xlQ29weSA9IHBhdGhzLnRyaWFuZ2xlLmNvcHkoKTtcbiAgfTtcblxuICB2YXIgYXBwbHlJbml0aWFsU3RhdGVJblNuYXAgPSBmdW5jdGlvbigpe1xuICAgIHBhdGhzLnRyaWFuZ2xlLmFwcGx5KHNuYXApLmF0dHIoYXR0cnMuYm9yZGVyKTtcbiAgICBwYXRocy50cmlhbmdsZUNvcHkuYXBwbHkoc25hcCkuYXR0cihhdHRycy5ib3JkZXIpO1xuICAgIHBhdGhzLmV4dGVybkJveC5hcHBseShzbmFwKS5hdHRyKGF0dHJzLmludmlzaWJsZSk7XG4gICAgcGF0aHMuTS5hcHBseShzbmFwKS5hdHRyKGF0dHJzLmludmlzaWJsZSk7XG4gICAgcGF0aHMuWi5hcHBseShzbmFwKS5hdHRyKGF0dHJzLmludmlzaWJsZSk7XG4gIH07XG5cbiAgdmFyIGNyZWF0ZU1aID0gZnVuY3Rpb24oKXtcbiAgICBwYXRocy5NQm94ID0gbmV3IFBhdGgoY29vcmRzLmV4dGVybkJveCwgdHJ1ZSk7XG5cbiAgICBwYXRocy5NQm94LmFwcGx5KHNuYXApLmF0dHIoYXR0cnMuYm9yZGVyKTtcbiAgICBwYXRocy5taXJyb3JlZFRyaWFuZ2xlLmFwcGx5KHNuYXApLmF0dHIoYXR0cnMuYm9yZGVyKTtcblxuICAgIHZhciBNR3JvdXAgPSBzbmFwLmdyb3VwKHBhdGhzLnRyaWFuZ2xlLnBhdGguY2xvbmUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzLm1pcnJvcmVkVHJpYW5nbGUucGF0aCwgcGF0aHMuTUJveC5wYXRoKTtcbiAgICB2YXIgWkdyb3VwID0gTUdyb3VwLmNsb25lKCk7XG5cbiAgICB2YXIgc2hvd01aID0gZnVuY3Rpb24oKXtcbiAgICAgIHBhdGhzLk0ucGF0aC5hbmltYXRlKHsnc3Ryb2tlLW9wYWNpdHknOiAxLCBzdHJva2VXaWR0aDogNX0sIHN0ZXBEdXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5hLmVhc2Vpbm91dCk7XG4gICAgICBwYXRocy5aLnBhdGguYW5pbWF0ZSh7J3N0cm9rZS1vcGFjaXR5JzogMSwgc3Ryb2tlV2lkdGg6IDV9LCBzdGVwRHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluYS5lYXNlaW5vdXQpO1xuICAgICAgTUdyb3VwLmFuaW1hdGUoeydzdHJva2Utb3BhY2l0eSc6IDB9LCBzdGVwRHVyYXRpb24sIG1pbmEuZWFzZWlub3V0KTtcbiAgICAgIFpHcm91cC5hbmltYXRlKHsnc3Ryb2tlLW9wYWNpdHknOiAwfSwgc3RlcER1cmF0aW9uLCBtaW5hLmVhc2Vpbm91dCk7XG4gICAgfTtcblxuICAgIHZhciBtb3ZlR3JvdXBzVG9GaW5hbERlc3RpbmF0aW9uQW5kU2hvd01aID0gZnVuY3Rpb24oKXtcbiAgICAgIHBhdGhzLk0ucGF0aC5hbmltYXRlKHt0cmFuc2Zvcm06IG1hdHJpeGVzLk19LCBzdGVwRHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluYS5lYXNlaW5vdXQpO1xuICAgICAgcGF0aHMuWi5wYXRoLmFuaW1hdGUoe3RyYW5zZm9ybTogbWF0cml4ZXMuWn0sIHN0ZXBEdXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5hLmVhc2Vpbm91dCk7XG4gICAgICBNR3JvdXAuYW5pbWF0ZSh7dHJhbnNmb3JtOiBtYXRyaXhlcy5NfSwgc3RlcER1cmF0aW9uLCBtaW5hLmVhc2Vpbm91dCk7XG4gICAgICBaR3JvdXAuYW5pbWF0ZSh7dHJhbnNmb3JtOiBtYXRyaXhlcy5afSwgc3RlcER1cmF0aW9uLCBtaW5hLmVhc2Vpbm91dCk7XG4gICAgICBzZXRUaW1lb3V0KHNob3dNWiAsIHN0ZXBEdXJhdGlvbik7XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQobW92ZUdyb3Vwc1RvRmluYWxEZXN0aW5hdGlvbkFuZFNob3dNWiwgc3RlcER1cmF0aW9uKTtcbiAgfTtcblxuICAvL1B1YmxpYyBtZXRob2RzXG4gIG1vZHVsZS5zdGFydEFuaW1hdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgaWYodGhpcy5zaXplID09PSB1bmRlZmluZWQpe1xuICAgICAgdGhyb3cgXCJUaGUgTVogd2FzIG5vdCBpbml0aWFsaXplZC5cIjtcbiAgICB9XG4gICAgcGF0aHMudHJpYW5nbGVDb3B5LmFuaW1hdGVDb29yZHMoY29vcmRzLm1pcnJvcmVkVHJpYW5nbGUsIHN0ZXBEdXJhdGlvbik7XG4gICAgcGF0aHMuZXh0ZXJuQm94LnBhdGguYW5pbWF0ZSh7J3N0cm9rZS1vcGFjaXR5JzoxLCB9LCBzdGVwRHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluYS5lYXNlaW5vdXQpO1xuICAgIGFwcGx5SW5pdGlhbFN0YXRlSW5TbmFwKCk7XG4gICAgc2V0VGltZW91dChjcmVhdGVNWiwgc3RlcER1cmF0aW9uKTtcbiAgfTtcblxuICBtb2R1bGUuaW5pdCA9IGZ1bmN0aW9uKGRpdiwgd2lkdGgsIGhlaWdodCwgZHVyYXRpb24pe1xuICAgIHNuYXAgPSBTbmFwKGRpdik7XG4gICAgc3RlcER1cmF0aW9uID0gZHVyYXRpb247XG5cbiAgICB0aGlzLnNpemUgPSBuZXcgQ29vcmQoKTtcbiAgICB0aGlzLnNpemUueCA9IHdpZHRoO1xuICAgIHRoaXMuc2l6ZS55ID0gaGVpZ2h0O1xuXG4gICAgbWF0cml4ZXMuTS5zY2FsZSgwLjIsIDAuMiwgbW9kdWxlLnNpemUueCAvIDIuMCwgbW9kdWxlLnNpemUueSk7XG4gICAgbWF0cml4ZXMuTS50cmFuc2xhdGUoMCwgLW1vZHVsZS5zaXplLnkgKiAzLjUpO1xuXG4gICAgbWF0cml4ZXMuWi5zY2FsZSgwLjIsIDAuMiwgbW9kdWxlLnNpemUueCAvIDIuMCwgbW9kdWxlLnNpemUueSk7XG4gICAgbWF0cml4ZXMuWi50cmFuc2xhdGUoMCwgLW1vZHVsZS5zaXplLnkgKiAwLjUpO1xuXG4gICAgc2V0Q29vcmRzKCk7XG4gICAgc2V0UGF0aHMoKTtcbiAgICBhcHBseUluaXRpYWxTdGF0ZUluU25hcCgpO1xuICB9O1xuXG4gIHJldHVybiBtb2R1bGU7XG59O1xuLypcbiAqIERlZmluZSB1bSBlbGVtZW50byBkZSBjb29yZGVuYWRhIGJpZGltZW5zaW9uYWwuXG4gKiBAcGFyYW0ge2ludH0geCBBYnNjaXNzYXNcbiAqIEBwYXJhbSB7aW50fSB5IE9yZGVuYWRhc1xuICovXG52YXIgQ29vcmQgPSBmdW5jdGlvbih4LCB5KXtcbiAgdGhpcy54ID0geDtcbiAgdGhpcy55ID0geTtcbn07XG5cbi8qIFxuICogR2VyYSB1bSBlbGVtZW50byBwYXRoIGEgcGFydGlyIGRhcyBjb29yZGVuYWRhcyBwYXNzYWRhcyBcbiAqIEBwYXJhbSB7bGlzdCBvZiBDb29yZH0gY29vcmRzIExpc3RhIGRlIGNvb3JkZW5hZGFzIGRvcyBwb250b3NcbiAqL1xudmFyIFBhdGggPSBmdW5jdGlvbihjb29yZHMsIGNsb3NlZCl7XG4gIGlmKGNvb3JkcyA9PT0gbnVsbCl7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuY29vcmRzID0gY29vcmRzO1xuICB0aGlzLmNsb3NlZCA9IGNsb3NlZDtcbiAgdGhpcy5zdmdQYXRoU3RyaW5nID0gdGhpcy5zdHJpZ2lmeUNvb3Jkcyhjb29yZHMpO1xufTtcblxuLypcbiAqIEdlcmEgdW1hIHN0cmluZyBjb21hIGRlc2NyacOnw6NvIGRlIHVtIHBhdGggbm8gZm9ybWFkbyBkZWZpbmlkb1xuICogcGVsYSBlc3BlY2lmaWNhw6fDtWVzIGRvIHN2Z1xuICogQHBhcmFtIHtsaXN0IG9mIENvb3JkfSBjb29yZHMgTGlzdGEgZGUgY29vcmRlbmFkYXNcbiAqL1xuUGF0aC5wcm90b3R5cGUuc3RyaWdpZnlDb29yZHMgPSBmdW5jdGlvbihjb29yZHMpe1xuICB2YXIgc3ZnUGF0aFN0cmluZyA9ICdNJztcbiAgdmFyIGZpbmFsUGF0aENoYXIgPSB0aGlzLmNsb3NlZCA/ICd6JzogJyc7XG4gIGZvcih2YXIgaW5kZXggaW4gY29vcmRzKXsgXG4gICAgc3ZnUGF0aFN0cmluZyArPSBjb29yZHNbaW5kZXhdLnggKyAnLCcgKyBjb29yZHNbaW5kZXhdLnk7XG4gICAgLy9JZiBpcyB0aGUgbGFzdCBsaW5lIG1ha2UgYSBjbG9zZSBwYXRoXG4gICAgc3ZnUGF0aFN0cmluZyArPSBpbmRleCA9PSBjb29yZHMubGVuZ3RoIC0gMSA/IGZpbmFsUGF0aENoYXIgOiAnTCc7XG4gIH1cbiAgcmV0dXJuIHN2Z1BhdGhTdHJpbmc7XG59O1xuXG4vKlxuICogQXBsaWNhIG8gcGF0aCDDoCB1bSBlbGVtZW50byBTbmFwXG4gKiBAcGFyYW0ge1NuYXAgZWxlbWVudH0gc25hcCBFbGVtZW50byBTbmFwIG5vIHF1YWwgbyBwYXRoIHNlcsOhIGFwbGljYWRvXG4gKi9cblBhdGgucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24oc25hcCl7XG4gIHRoaXMucGF0aCA9IHNuYXAucGF0aCh0aGlzLnN2Z1BhdGhTdHJpbmcpO1xuICByZXR1cm4gdGhpcy5wYXRoO1xufTtcblxuLypcbiAqIENyaWEgdW1hIGPDs3BpYSBkbyBwYXRoXG4gKiBAcmV0dXJuIHtQYXRoIGVsZW1lbnR9IENvcHkgb2ZcbiAqL1xuUGF0aC5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBjb3B5ID0gbmV3IFBhdGgoKTtcbiAgY29weS5zdmdQYXRoU3RyaW5nID0gdGhpcy5zdmdQYXRoU3RyaW5nO1xuICBjb3B5LmNvb3JkcyA9IHRoaXMuY29vcmRzO1xuICBjb3B5LmNsb3NlZCA9IHRoaXMuY2xvc2VkO1xuICByZXR1cm4gY29weTtcbn07XG5cbi8qXG4gKiBBbmltYSBvIHBhdGggcGFyYSBhcyBub3ZhcyBjb29yZGVuYWRhcyBwYXNzYWRhc1xuICogQHBhcmFtIHtsaXN0IG9mIENvb3Jkc30gY29vcmRzIExpc3RhIGNvbSBhcyBub3ZhcyBjb29yZGVuYWRhc1xuICogQHBhcmFtIHtmbG9hdH0gdGltZSBEdXJhw6fDo28gZGEgYW5pbWHDp8OjbyBlbSBtaWNyb3NzZWd1bmRvc1xuICovXG5QYXRoLnByb3RvdHlwZS5hbmltYXRlQ29vcmRzID0gZnVuY3Rpb24oY29vcmRzLCB0aW1lKXtcbiAgdmFyIG5ld1BhdGhTdHJpbmcgPSB0aGlzLnN0cmlnaWZ5Q29vcmRzKGNvb3Jkcyk7XG4gIHRoaXMucGF0aC5hbmltYXRlKHtwYXRoOm5ld1BhdGhTdHJpbmd9LCB0aW1lLCBtaW5hLmVhc2Vpbm91dCk7XG59O1xuXG5leHBvcnRzLk1aID0gTVo7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbXpsb2dvLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHQgPSBuZXcgKHJlcXVpcmUoJ2hvZ2FuLmpzL2xpYi90ZW1wbGF0ZScpKS5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8ZGl2IGlkPVxcXCJjdlxcXCIgY2xhc3M9XFxcImhpZGRlbiBjb250ZW50XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxhcnRpY2xlIGNsYXNzPVxcXCJjb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS0xMiBwYXBlclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDE+TWF0ZXVzIFppdGVsbGksIEN1cnJpY3VsdW0gVml0YWU8L2gxPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIEknbSBhIDIyIHllYXJzIG9sZCBCcmF6aWxpYW4gc3R1ZGVudCBvZiBDb21wdXRlciBTY2llbmNlLCB3aXRoIDcgeWVhcnMgb2YgZXhwZXJpZW5jZSBpbiBzb2Z0d2FyZSBkZXZlbG9wbWVudC4gSSdtIGluIHRoZSB0aGlyZCB5ZWFyIG9mIENvbXB1dGVyIFNjaWVuY2UgY291cnNlIGF0IFVuaXZlcnNpZGFkZSBGZWRlcmFsIGRvIEFCQyBhbmQgY3VycmVudGx5IGluIGV4Y2hhbmdlIGF0IEF1c3RyYWxpYW4gTmF0aW9uYWwgVW5pdmVyc2l0eSBieSB0aGUgQnJhemlsaWFuIHByb2dyYW0gU2NpZW5jZSB3aXRob3V0IEJvcmRlcnMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDI+VGVjaGluaWNhbCBza2lsbHM8L2gyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGhyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIER1cmluZyB0aGUgbGFzdCA3IHllYXJzIEkndmUgZGV2ZWxvcGVkIHNvZnR3YXJlIGZvciBkaWZmZXJlbnQgcHJvcG9zZXMsIGZyb20gYXNzZW1ibHkgdG8gQVZSIG1pY3JvY29udHJvbGxlcnMsIHNpbXBsZSBhcHBsaWNhdGlvbnMgd2l0aCBzY2hlbWUsIHRvIGNvbXBsZXRlIHdlYiBhcHBzIHVzaW5nIEZsdXggKyBSZWFjdC5qcy4gVGhvc2UgeWVhcnMgc3R1ZHlpbmcgZGlmZmVyZW50IHRlY2hub2xvZ2llcyBhbGxvd2VkIG1lIHRvIGhhdmUgYSBnb29kIG5vdGlvbiBvZiB3aGF0IGlzIG5lY2Vzc2FyeSB0byBkZXZlbG9wIHNvZnR3YXJlIHdpdGggcXVhbGl0eSBpbmRlcGVuZGVudCBvZiB0aGUgYWRvcHRlZCB0ZWNobm9sb2dpZXMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5CYXNpYyBDIHByb2dyYW1taW5nIGZvciBkZXNrdG9wIGFwcGxpY2F0aW9uczs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8bGk+QWR2YW5jZWQgcHl0aG9uIHByb2dyYW1taW5nIGZvciBnZW5lcmFsIHByb3Bvc2UgdXNhZ2UsIGRhdGEgYW5hbHlzaXMgYW5kIHdlYiBkZXZlbG9wbWVudCB3aXRoIERqYW5nbzs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8bGk+RVMyMDE2IEphdmFTY3JpcHQgbGludGVkLCB0ZXN0ZWQ7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGxpPkZyb250LWVuZCBkZXZlbG9wbWVudCB3aXRoIFJlYWN0LmpzLCBGbHV4IHVzaW5nIFJlZHV4IGFuZCB1c2FnZSBvZiBpbW11dGFibGUgZGF0YXR5cGVzIHdpdGggSW1tdXRhYmxlLmpzOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5Ob2RlLmpzICsgZXhwcmVzcy9rb2EuanMgZm9yIGdlbmVyYWwgYmFjay1lbmQgc29sdXRpb25zLCBpbmNsdWRpbmcgUkVTVCBBUElzOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5BZHZhbmNlZCBnaXQgZXhwZXJpZW5jZSBmb3IgY29kZSB2ZXJzaW9uIGNvbnRyb2xsOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5HdWxwLCBHcnVudCBhbmQgV2VicGFjayBmb3IgYXV0b21hdGlvbiBhbmQgbWFuYWdlbWVudCBvZiBKYXZhU2NyaXB0IHByb2plY3RzOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5DU1MyLCBDU1MzLCBCb290c3RyYXAsIGhhbmR3cml0dGVuIGZvciByZXNwb25zaWJsZSBsYXlvdXRzOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5FeHBlcmllbmNlIHdpdGggTW9uZ29EQiBhbmQgUmV0aGlua0RCIGZvciBub1NRTCBkYXRhYmFzZXM7PC9saT4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5TY2hlbWUgYXMgYSBnZW5lcmFsIHByb3Bvc2UgbGFuZ3VhZ2UgKGFuZCBiZWNhdXNlIGl0J3MgZnVuISk7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGxpPlhIVE1MIDQuMCwgKFgpSFRNTDUsIGhhbmR3cml0dGVuIHdpdGggZXhwZXJpZW5jZSBpbiBhdXRvbWF0aW9uIHRvb2xzIHN1Y2ggYXMgZW1tZXQ7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDI+RXh0cmFzPC9oMj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxocj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxoMz5SZXNlYXJjaCBQcm9ncmFtIC0gUWVvcHBzIC0gWW91bmcgVGFsZW50cyBvZiBTY2llbmNlL0NOUHFcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8YnI+KFEpZW9wcHMgaXMgYW4gKEUpdm9sdXRpb25hcnkgKE8pcHRpbWl6YXRvciBmb3IgKFApYXJhbGxlbCAoUClyb2dyYW0ocylcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8YnI+PHNtYWxsPkphbnVhcnkvMjAxMyAtIERlY2VtYmVyLzIwMTM8L3NtYWxsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L2gzPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPGxpPjxzdHJvbmc+SG9ub3JhYmxlIE1lbnRpb248L3N0cm9uZz4gaW4gdGhlIGF4aXMgb2YgQ29tbXVuaWNhdGlvbiBhbmQgSW5mb3JtYXRpb24gLSBTY2llbnRpZmljIEluaXRpYXRpb24gTWVldGluZzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPGxpPlB5dGhvbiBmb3IgY29tcGxleCBhcHBsaWNhdGlvbnM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8bGk+U2NoZW1lIGZvciBjb21wbGV4IGFwcGxpY2F0aW9uczs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxsaT5FeHBlcmllbmNlIHdpdGggYWNhZGVtaWMgd3JpdGluZzs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxsaT5FeHBlcmllbmNlIHdpdGggcGFyYWxsZWwgcHJvZ3JhbW1pbmcgdXNpbmcgUG9zaXggVGhyZWFkczs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8aDM+SGFja2F0b24gOTlqb2JzIC0gRmlyc3QgUGxhY2VcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNtYWxsPjEyIGFuZCAxMyBvZiBBcHJpbCBvZiAyMDE0PC9zbWFsbD48L2gzPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5BcyBGcm9udC1lbmQgZGV2ZWxvcGVyIG1lIHdpdGggbXkgdGVhbSBkZXZlbG9wZWQgdGhlIHdpbm5lciBwcm9qZWN0IDxhIGhyZWY9XFxcImh0dHA6Ly9nZW50ZWJvYS5tZXRlb3IuY29tXFxcIj5HZW50ZSBCb2E8L2E+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGgyPkVkdWNhdGlvbjwvaDI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8aDM+QXVzdHJhbGlhbiBOYXRpb25hbCBVbml2ZXJzaXR5XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxzbWFsbD5Ob3ZlbWJlci8yMDE1IC0gRGVjZW1iZXIvMjAxNjwvc21hbGw+PC9oMz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHA+U2Nob2xhcnNoaXAgZnJvbSBDTlBxIHdpdGggdGhlIHByb2dyYW0gU2NpZW5jZSBXaXRob3V0IEJvcmRlcnM8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxoMz5Vbml2ZXJzaWRhZGUgRmVkZXJhbCBkbyBBQkNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNtYWxsPkFwcmlsLzIwMTIgLSBBcHJpbC8yMDE3PC9zbWFsbD48L2gzPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5CYWNoZWxvciBEZWdyZWUgaW4gU2NpZW5jZSBhbmQgVGVjaG5vbG9neSAvIEJhY2hlbG9yIERlZ3JlZSBpbiBDb21wdXRlciBTY2llbmNlPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDI+RXhwZXJpZW5jZTwvaDI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8aDM+RnVsbC1zdGFjayBkZXZlbG9wZXIvQ1RPIGF0IEzDs2cgQklcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGJyPjxzbWFsbD5KYW51YXJ5LzIwMTUgLSBOb3ZlbWJlci8yMDE1PC9zbWFsbD48L2gzPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8bGk+Q29tcGxldGUgZGV2ZWxvcG1lbnQgb2YgYSBjb21wbGV4IHdlYiBhcHA7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDxsaT5BcGkgUkVTVCB3aXRoIE5vZGUuanMgKyBLb2EuanM7PC9saT4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8bGk+TW9uZ29kYiBhcyBhIG5vU1FMIGRhdGFiYXNlOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8bGk+UmVhY3QuanMgZm9yIHJldXNhYmxlIFVJIGNvbXBvbmVudHM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDxsaT5GbHV4IGFzIHRoZSBhcmNoaXRldHVyZSBmb3IgdGhlIGZyb250LWVuZCBhcHBsaWNhdGlvbjs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPGxpPkltbXV0YWJsZSBkYXRhIHN0cnVjdHMgd2l0aCBJbW11dGFibGUuanM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC91bD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGRpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGgzPkZyb250LWVuZCBkZXZlbG9wbWVudCBhdCA5OWpvYnNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGJyPjxzbWFsbD5KdWx5LzIwMTQgLSBOb3ZlbWJlci8yMDE0PC9zbWFsbD48L2gzPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPGxpPkNTUzMsIFNBU1MsIEJvb3RzdHJhcCBmb3IgcGl4ZWxzIHBlcmZlY3QgYW5kIHJlc3BvbnNpdmUgZGVzaWduczs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxsaT5KYXZhc2NyaXB0IGFuZCBKUXVlcnkgZm9yIGR5bmFtaWMgd2VicGFnZXM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8bGk+RXhwZXJpZW5jZSB3aXRoIHNvbHV0aW9uIHRoYXQgd2VyZSB1c2VkIGJ5IHRob3VzYW5kcyB1c2VycyBldmVyeWRheTs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxsaT5SZWFjdC5qcyArIEZsdXggZm9yIGEgd2ViIGFwcCBkZXZlbG9wbWVudDs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8aDM+SW50ZXJuc2hpcCAtIE1ldGFtw6FxdWluYSAoPGEgaHJlZj1cXFwiaHR0cDovL21ldGFtYXF1aW5hLmNvbS5ici9cXFwiPmh0dHA6Ly9tZXRhbWFxdWluYS5jb20uYnIvPC9hPilcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGJyPjxzbWFsbD5BcHJpbC8yMDEyIC0gU2VwdGVtYmVyLzIwMTI8L3NtYWxsPjwvaDM+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx1bD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8bGk+RXhwZXJpZW5jZSB3aXRoIGNvbmZpZ3VyYXRpb24gb2YgM0QgcHJpbnRlcnM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8bGk+RXhwZXJpZW5jZSB3aXRoIDNEIHByaW50aW5nIHdpdGggb3BlbiBzb3VyY2UgdG9vbHM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8bGk+M0QgcHJvZ3JhbW1hdGljIG1vZGVsaW5nIHdpdGggT3BlbnNjYWQ7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC91bD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvYXJ0aWNsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO21vZHVsZS5leHBvcnRzID0geyAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7IHJldHVybiB0LnJlbmRlci5hcHBseSh0LCBhcmd1bWVudHMpOyB9LCAgcjogZnVuY3Rpb24gKCkgeyByZXR1cm4gdC5yLmFwcGx5KHQsIGFyZ3VtZW50cyk7IH0sICByaTogZnVuY3Rpb24gKCkgeyByZXR1cm4gdC5yaS5hcHBseSh0LCBhcmd1bWVudHMpOyB9fTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vdGVtcGxhdGVzL2N2Lmh0bWxcIixcIi8uLi90ZW1wbGF0ZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgdCA9IG5ldyAocmVxdWlyZSgnaG9nYW4uanMvbGliL3RlbXBsYXRlJykpLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgaWQ9XFxcImludHJvXFxcIiBjbGFzcz1cXFwiaGlkZGVuIGNvbnRlbnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGhlYWRlciBjbGFzcz1cXFwiY29udGFpbmVyIHB1bGwtbGVmdCBiaWctdGFibGVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyb3cgY2VudGVyLWNlbGxcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS0xMiBjZW50ZXJlZC1lbGVtZW50XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoMT5NYXRldXMgWml0ZWxsaTwvaDE+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDI+RnVsbCBzdGFjayB3ZWIgZGV2ZWxvcGVyIOKAoiBDYW5iZXJyYSwgQUNUIC0gQXVzdHJhbGlhPC9oMj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wteHMtNiBjb2wtc20tMyBjb2wtbGctMiB0ZXh0LWNlbnRlciBpbmZvXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoMj5OYXZpZ2F0aW9uPC9oMj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxocj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx1bCBjbGFzcz1cXFwibGlzdC11bnN0eWxlZCBuYXZpZ2F0aW9uLWxpbmtzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGxpPjxhIGhyZWY9XFxcIiNjdlxcXCI+Q3VycmljdWx1bTwvYT48L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiI3JlcG9zLWNvbnRlbnRcXFwiPk9wZW4tc291cmNlIHByb2plY3RzPC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC14cy02IGNvbC1zbS0zIGNvbC1sZy0yIHRleHQtY2VudGVyIGluZm9cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGgyPlNvY2lhbDwvaDI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dWwgY2xhc3M9XFxcImxpc3QtdW5zdHlsZWRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly90d2l0dGVyLmNvbS9NYXRldXNaaXRlbGxpXFxcIj5Ud2l0dGVyPC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL2dpdGh1Yi5jb20vTWF0ZXVzWml0ZWxsaVxcXCI+R2l0aHViPC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC14cy02IGNvbC1zbS0zIGNvbC1sZy0yIHRleHQtY2VudGVyIGluZm9cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGgyPkdldCBpbiBjb250YWN0PC9oMj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxocj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx1bCBjbGFzcz1cXFwibGlzdC11bnN0eWxlZFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaSBpZD1cXFwiZW1haWwtYWRyZXNzXFxcIj48L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8bGkgaWQ9XFxcInBob25lLW51bWJlclxcXCI+PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9oZWFkZXI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aW1nIHNyYz1cXFwiaW1hZ2VzL2Rvd24tYXJyb3cuc3ZnXFxcIiBkYXRhLWRlc3RpbmF0aW9uPVxcXCIjcmVwb3MtY29udGVudFxcXCIgY2xhc3M9XFxcImRvd24tYXJyb3dcXFwiIGFsdD1cXFwiU2V0YSBwYXJhIHZlciBtYWlzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJoaWRkZW4gY29udGVudFxcXCIgaWQ9XFxcInJlcG9zLWNvbnRlbnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGFydGljbGUgY2xhc3M9XFxcImNvbnRhaW5lciBwdWxsLWxlZnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDE+TXkgR2l0SHViIHJlcG9zaXRvcmllczwvaDE+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJvd1xcXCIgaWQ9XFxcInJlcG9zXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2FydGljbGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTttb2R1bGUuZXhwb3J0cyA9IHsgIHJlbmRlcjogZnVuY3Rpb24gKCkgeyByZXR1cm4gdC5yZW5kZXIuYXBwbHkodCwgYXJndW1lbnRzKTsgfSwgIHI6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHQuci5hcHBseSh0LCBhcmd1bWVudHMpOyB9LCAgcmk6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHQucmkuYXBwbHkodCwgYXJndW1lbnRzKTsgfX07XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL3RlbXBsYXRlcy9pbmRleC5odG1sXCIsXCIvLi4vdGVtcGxhdGVzXCIpIl19
