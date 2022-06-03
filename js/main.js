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
  var eLen = (nBytes * 8) - mLen - 1
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
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

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
  var eLen = (nBytes * 8) - mLen - 1
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
      m = ((value * c) - 1) * Math.pow(2, mLen)
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

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_63975a63.js","/")
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
var t = new (require('hogan.js/lib/template')).Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div id=\"cv\" class=\"hidden content\">");_.b("\n" + i);_.b("  <article class=\"container\">");_.b("\n" + i);_.b("    <div class=\"row\">");_.b("\n" + i);_.b("      <div class=\"col-sm-12 paper\">");_.b("\n" + i);_.b("        <h1>Mateus Zitelli, Curriculum Vitae</h1>");_.b("\n" + i);_.b("        <p>");_.b("\n" + i);_.b("          I'm a 22 years old Brazilian student of Computer Science, with 7 years of experience in software development. I'm in the third year of Computer Science course at Universidade Federal do ABC and currently in exchange at Australian National University by the Brazilian program Science without Borders.");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        <h2>Techinical skills</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <p>");_.b("\n" + i);_.b("          During the last 7 years I've developed software for different proposes, from assembly to AVR microcontrollers, simple applications with scheme, to complete web apps using Flux + React.js. Those years studying different technologies allowed me to have a good notion of what is necessary to develop software with quality independent of the adopted technologies.");_.b("\n" + i);_.b("        </p>");_.b("\n" + i);_.b("        <ul>");_.b("\n" + i);_.b("          <li>Basic C programming for desktop applications;</li>");_.b("\n" + i);_.b("          <li>Advanced python programming for general propose usage, data analysis and web development with Django;</li>");_.b("\n" + i);_.b("          <li>ES2016 JavaScript linted, tested;</li>");_.b("\n" + i);_.b("          <li>Front-end development with React.js, Flux using Redux and usage of immutable datatypes with Immutable.js;</li>");_.b("\n" + i);_.b("          <li>Node.js + express/koa.js for general back-end solutions, including REST APIs;</li>");_.b("\n" + i);_.b("          <li>Advanced git experience for code version controll;</li>");_.b("\n" + i);_.b("          <li>Gulp, Grunt and Webpack for automation and management of JavaScript projects;</li>");_.b("\n" + i);_.b("          <li>CSS2, CSS3, Bootstrap, handwritten for responsible layouts;</li>");_.b("\n" + i);_.b("          <li>Experience with MongoDB and RethinkDB for noSQL databases;</li> ");_.b("\n" + i);_.b("          <li>Scheme as a general propose language (and because it's fun!);</li>");_.b("\n" + i);_.b("          <li>XHTML 4.0, (X)HTML5, handwritten with experience in automation tools such as emmet;</li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("        <h2>Extras</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Research Program - Qeopps - Young Talents of Science/CNPq");_.b("\n" + i);_.b("            <br>(Q)eopps is an (E)volutionary (O)ptimizator for (P)arallel (P)rogram(s)");_.b("\n" + i);_.b("            <br><small>January/2013 - December/2013</small>");_.b("\n" + i);_.b("          </h3>");_.b("\n" + i);_.b("          <ul>");_.b("\n" + i);_.b("            <li><strong>Honorable Mention</strong> in the axis of Communication and Information - Scientific Initiation Meeting</li>");_.b("\n" + i);_.b("            <li>Python for complex applications;</li>");_.b("\n" + i);_.b("            <li>Scheme for complex applications;</li>");_.b("\n" + i);_.b("            <li>Experience with academic writing;</li>");_.b("\n" + i);_.b("            <li>Experience with parallel programming using Posix Threads;</li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Hackaton 99jobs - First Place");_.b("\n" + i);_.b("          <small>12 and 13 of April of 2014</small></h3>");_.b("\n" + i);_.b("          <p>As Front-end developer me with my team developed the winner project <a href=\"http://genteboa.meteor.com\">Gente Boa</a>.</p>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <h2>Education</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Australian National University");_.b("\n" + i);_.b("          <small>November/2015 - December/2016</small></h3>");_.b("\n" + i);_.b("          <p>Scholarship from CNPq with the program Science Without Borders</p>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Universidade Federal do ABC");_.b("\n" + i);_.b("          <small>April/2012 - April/2017</small></h3>");_.b("\n" + i);_.b("          <p>Bachelor Degree in Science and Technology / Bachelor Degree in Computer Science</p>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <h2>Experience</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>full-stack developer/cto at lóg bi");_.b("\n" + i);_.b("          <br><small>january/2015 - november/2015</small></h3>");_.b("\n" + i);_.b("          <ul>");_.b("\n" + i);_.b("              <li>complete development of a complex web app;</li>");_.b("\n" + i);_.b("              <li>api rest with node.js + koa.js;</li> ");_.b("\n" + i);_.b("              <li>mongodb as a nosql database;</li>");_.b("\n" + i);_.b("              <li>react.js for reusable ui components;</li>");_.b("\n" + i);_.b("              <li>flux as the architeture for the front-end application;</li>");_.b("\n" + i);_.b("              <li>immutable data structs with immutable.js;</li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Front-end development at 99jobs");_.b("\n" + i);_.b("          <br><small>July/2014 - November/2014</small></h3>");_.b("\n" + i);_.b("          <ul>");_.b("\n" + i);_.b("            <li>CSS3, SASS, Bootstrap for pixels perfect and responsive designs;</li>");_.b("\n" + i);_.b("            <li>Javascript and JQuery for dynamic webpages;</li>");_.b("\n" + i);_.b("            <li>Experience with solution that were used by thousands users everyday;</li>");_.b("\n" + i);_.b("            <li>React.js + Flux for a web app development;</li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("        <div>");_.b("\n" + i);_.b("          <h3>Internship - Metamáquina (<a href=\"http://metamaquina.com.br/\">http://metamaquina.com.br/</a>)");_.b("\n" + i);_.b("          <br><small>April/2012 - September/2012</small></h3>");_.b("\n" + i);_.b("          <ul>");_.b("\n" + i);_.b("            <li>Experience with configuration of 3D printers;</li>");_.b("\n" + i);_.b("            <li>Experience with 3D printing with open source tools;</li>");_.b("\n" + i);_.b("            <li>3D programmatic modeling with Openscad;</li>");_.b("\n" + i);_.b("          </ul>");_.b("\n" + i);_.b("        </div>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  </article>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});module.exports = {  render: function () { return t.render.apply(t, arguments); },  r: function () { return t.r.apply(t, arguments); },  ri: function () { return t.ri.apply(t, arguments); }};
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../templates/cv.html","/../templates")
},{"buffer":2,"hogan.js/lib/template":3,"rH1JPG":5}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var t = new (require('hogan.js/lib/template')).Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div id=\"intro\" class=\"hidden content\">");_.b("\n" + i);_.b("  <header class=\"container pull-left big-table\">");_.b("\n" + i);_.b("    <div class=\"row center-cell\">");_.b("\n" + i);_.b("      <div class=\"col-sm-12 centered-element\">");_.b("\n" + i);_.b("        <h1>Mateus Zitelli</h1>");_.b("\n" + i);_.b("        <h2>Full stack web developer • Canberra, ACT - Australia</h2>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("      <div class=\"col-xs-6 col-sm-3 col-lg-2 text-center info\">");_.b("\n" + i);_.b("        <h2>Navigation</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <ul class=\"list-unstyled navigation-links\">");_.b("\n" + i);_.b("          <li><a href=\"#cv\">Curriculum</a></li>");_.b("\n" + i);_.b("          <li><a href=\"#repos-content\">Open-source projects</a></li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("      <div class=\"col-xs-6 col-sm-3 col-lg-2 text-center info\">");_.b("\n" + i);_.b("        <h2>Social</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <ul class=\"list-unstyled\">");_.b("\n" + i);_.b("          <li><a href=\"https://twitter.com/MateusZitelli\">Twitter</a></li>");_.b("\n" + i);_.b("          <li><a href=\"https://github.com/MateusZitelli\">Github</a></li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("      <div class=\"col-xs-6 col-sm-3 col-lg-2 text-center info\">");_.b("\n" + i);_.b("        <h2>Get in contact</h2>");_.b("\n" + i);_.b("        <hr>");_.b("\n" + i);_.b("        <ul class=\"list-unstyled\">");_.b("\n" + i);_.b("          <li id=\"email-adress\"></li>");_.b("\n" + i);_.b("          <li id=\"phone-number\"></li>");_.b("\n" + i);_.b("        </ul>");_.b("\n" + i);_.b("      </div>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  </header>");_.b("\n" + i);_.b("  <img src=\"images/down-arrow.svg\" data-destination=\"#repos-content\" class=\"down-arrow\" alt=\"Seta para ver mais\">");_.b("\n" + i);_.b("</div>");_.b("\n" + i);_.b("<div class=\"hidden content\" id=\"repos-content\">");_.b("\n" + i);_.b("  <article class=\"container pull-left\">");_.b("\n" + i);_.b("    <h1>My GitHub repositories</h1>");_.b("\n" + i);_.b("    <div class=\"row\" id=\"repos\">");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("  </article>");_.b("\n" + i);_.b("</div>");_.b("\n");return _.fl();;});module.exports = {  render: function () { return t.render.apply(t, arguments); },  r: function () { return t.r.apply(t, arguments); },  ri: function () { return t.ri.apply(t, arguments); }};
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../templates/index.html","/../templates")
},{"buffer":2,"hogan.js/lib/template":3,"rH1JPG":5}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9raW11cmEvZGV2L21hdGV1c3ppdGVsbGkuZ2l0aHViLmlvL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMva2ltdXJhL2Rldi9tYXRldXN6aXRlbGxpLmdpdGh1Yi5pby9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCIvVXNlcnMva2ltdXJhL2Rldi9tYXRldXN6aXRlbGxpLmdpdGh1Yi5pby9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL1VzZXJzL2tpbXVyYS9kZXYvbWF0ZXVzeml0ZWxsaS5naXRodWIuaW8vbm9kZV9tb2R1bGVzL2hvZ2FuLmpzL2xpYi90ZW1wbGF0ZS5qcyIsIi9Vc2Vycy9raW11cmEvZGV2L21hdGV1c3ppdGVsbGkuZ2l0aHViLmlvL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiL1VzZXJzL2tpbXVyYS9kZXYvbWF0ZXVzeml0ZWxsaS5naXRodWIuaW8vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9raW11cmEvZGV2L21hdGV1c3ppdGVsbGkuZ2l0aHViLmlvL3NyYy9qcy9mYWtlXzYzOTc1YTYzLmpzIiwiL1VzZXJzL2tpbXVyYS9kZXYvbWF0ZXVzeml0ZWxsaS5naXRodWIuaW8vc3JjL2pzL2dpdGh1Yi1yZXBvcy5qcyIsIi9Vc2Vycy9raW11cmEvZGV2L21hdGV1c3ppdGVsbGkuZ2l0aHViLmlvL3NyYy9qcy9temxvZ28uanMiLCIvVXNlcnMva2ltdXJhL2Rldi9tYXRldXN6aXRlbGxpLmdpdGh1Yi5pby9zcmMvdGVtcGxhdGVzL2N2Lmh0bWwiLCIvVXNlcnMva2ltdXJhL2Rldi9tYXRldXN6aXRlbGxpLmdpdGh1Yi5pby9zcmMvdGVtcGxhdGVzL2luZGV4Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25QQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKlxuICogIENvcHlyaWdodCAyMDExIFR3aXR0ZXIsIEluYy5cbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqICBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiAgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiAgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbnZhciBIb2dhbiA9IHt9O1xuXG4oZnVuY3Rpb24gKEhvZ2FuLCB1c2VBcnJheUJ1ZmZlcikge1xuICBIb2dhbi5UZW1wbGF0ZSA9IGZ1bmN0aW9uIChyZW5kZXJGdW5jLCB0ZXh0LCBjb21waWxlciwgb3B0aW9ucykge1xuICAgIHRoaXMuciA9IHJlbmRlckZ1bmMgfHwgdGhpcy5yO1xuICAgIHRoaXMuYyA9IGNvbXBpbGVyO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy50ZXh0ID0gdGV4dCB8fCAnJztcbiAgICB0aGlzLmJ1ZiA9ICh1c2VBcnJheUJ1ZmZlcikgPyBbXSA6ICcnO1xuICB9XG5cbiAgSG9nYW4uVGVtcGxhdGUucHJvdG90eXBlID0ge1xuICAgIC8vIHJlbmRlcjogcmVwbGFjZWQgYnkgZ2VuZXJhdGVkIGNvZGUuXG4gICAgcjogZnVuY3Rpb24gKGNvbnRleHQsIHBhcnRpYWxzLCBpbmRlbnQpIHsgcmV0dXJuICcnOyB9LFxuXG4gICAgLy8gdmFyaWFibGUgZXNjYXBpbmdcbiAgICB2OiBob2dhbkVzY2FwZSxcblxuICAgIC8vIHRyaXBsZSBzdGFjaGVcbiAgICB0OiBjb2VyY2VUb1N0cmluZyxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKGNvbnRleHQsIHBhcnRpYWxzLCBpbmRlbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnJpKFtjb250ZXh0XSwgcGFydGlhbHMgfHwge30sIGluZGVudCk7XG4gICAgfSxcblxuICAgIC8vIHJlbmRlciBpbnRlcm5hbCAtLSBhIGhvb2sgZm9yIG92ZXJyaWRlcyB0aGF0IGNhdGNoZXMgcGFydGlhbHMgdG9vXG4gICAgcmk6IGZ1bmN0aW9uIChjb250ZXh0LCBwYXJ0aWFscywgaW5kZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5yKGNvbnRleHQsIHBhcnRpYWxzLCBpbmRlbnQpO1xuICAgIH0sXG5cbiAgICAvLyB0cmllcyB0byBmaW5kIGEgcGFydGlhbCBpbiB0aGUgY3VyZW50IHNjb3BlIGFuZCByZW5kZXIgaXRcbiAgICBycDogZnVuY3Rpb24obmFtZSwgY29udGV4dCwgcGFydGlhbHMsIGluZGVudCkge1xuICAgICAgdmFyIHBhcnRpYWwgPSBwYXJ0aWFsc1tuYW1lXTtcblxuICAgICAgaWYgKCFwYXJ0aWFsKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuYyAmJiB0eXBlb2YgcGFydGlhbCA9PSAnc3RyaW5nJykge1xuICAgICAgICBwYXJ0aWFsID0gdGhpcy5jLmNvbXBpbGUocGFydGlhbCwgdGhpcy5vcHRpb25zKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcnRpYWwucmkoY29udGV4dCwgcGFydGlhbHMsIGluZGVudCk7XG4gICAgfSxcblxuICAgIC8vIHJlbmRlciBhIHNlY3Rpb25cbiAgICByczogZnVuY3Rpb24oY29udGV4dCwgcGFydGlhbHMsIHNlY3Rpb24pIHtcbiAgICAgIHZhciB0YWlsID0gY29udGV4dFtjb250ZXh0Lmxlbmd0aCAtIDFdO1xuXG4gICAgICBpZiAoIWlzQXJyYXkodGFpbCkpIHtcbiAgICAgICAgc2VjdGlvbihjb250ZXh0LCBwYXJ0aWFscywgdGhpcyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWlsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnRleHQucHVzaCh0YWlsW2ldKTtcbiAgICAgICAgc2VjdGlvbihjb250ZXh0LCBwYXJ0aWFscywgdGhpcyk7XG4gICAgICAgIGNvbnRleHQucG9wKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIG1heWJlIHN0YXJ0IGEgc2VjdGlvblxuICAgIHM6IGZ1bmN0aW9uKHZhbCwgY3R4LCBwYXJ0aWFscywgaW52ZXJ0ZWQsIHN0YXJ0LCBlbmQsIHRhZ3MpIHtcbiAgICAgIHZhciBwYXNzO1xuXG4gICAgICBpZiAoaXNBcnJheSh2YWwpICYmIHZhbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHZhbCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhbCA9IHRoaXMubHModmFsLCBjdHgsIHBhcnRpYWxzLCBpbnZlcnRlZCwgc3RhcnQsIGVuZCwgdGFncyk7XG4gICAgICB9XG5cbiAgICAgIHBhc3MgPSAodmFsID09PSAnJykgfHwgISF2YWw7XG5cbiAgICAgIGlmICghaW52ZXJ0ZWQgJiYgcGFzcyAmJiBjdHgpIHtcbiAgICAgICAgY3R4LnB1c2goKHR5cGVvZiB2YWwgPT0gJ29iamVjdCcpID8gdmFsIDogY3R4W2N0eC5sZW5ndGggLSAxXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXNzO1xuICAgIH0sXG5cbiAgICAvLyBmaW5kIHZhbHVlcyB3aXRoIGRvdHRlZCBuYW1lc1xuICAgIGQ6IGZ1bmN0aW9uKGtleSwgY3R4LCBwYXJ0aWFscywgcmV0dXJuRm91bmQpIHtcbiAgICAgIHZhciBuYW1lcyA9IGtleS5zcGxpdCgnLicpLFxuICAgICAgICAgIHZhbCA9IHRoaXMuZihuYW1lc1swXSwgY3R4LCBwYXJ0aWFscywgcmV0dXJuRm91bmQpLFxuICAgICAgICAgIGN4ID0gbnVsbDtcblxuICAgICAgaWYgKGtleSA9PT0gJy4nICYmIGlzQXJyYXkoY3R4W2N0eC5sZW5ndGggLSAyXSkpIHtcbiAgICAgICAgcmV0dXJuIGN0eFtjdHgubGVuZ3RoIC0gMV07XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09ICdvYmplY3QnICYmIG5hbWVzW2ldIGluIHZhbCkge1xuICAgICAgICAgIGN4ID0gdmFsO1xuICAgICAgICAgIHZhbCA9IHZhbFtuYW1lc1tpXV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsID0gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHJldHVybkZvdW5kICYmICF2YWwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXJldHVybkZvdW5kICYmIHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjdHgucHVzaChjeCk7XG4gICAgICAgIHZhbCA9IHRoaXMubHYodmFsLCBjdHgsIHBhcnRpYWxzKTtcbiAgICAgICAgY3R4LnBvcCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsO1xuICAgIH0sXG5cbiAgICAvLyBmaW5kIHZhbHVlcyB3aXRoIG5vcm1hbCBuYW1lc1xuICAgIGY6IGZ1bmN0aW9uKGtleSwgY3R4LCBwYXJ0aWFscywgcmV0dXJuRm91bmQpIHtcbiAgICAgIHZhciB2YWwgPSBmYWxzZSxcbiAgICAgICAgICB2ID0gbnVsbCxcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlO1xuXG4gICAgICBmb3IgKHZhciBpID0gY3R4Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHYgPSBjdHhbaV07XG4gICAgICAgIGlmICh2ICYmIHR5cGVvZiB2ID09ICdvYmplY3QnICYmIGtleSBpbiB2KSB7XG4gICAgICAgICAgdmFsID0gdltrZXldO1xuICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgIHJldHVybiAocmV0dXJuRm91bmQpID8gZmFsc2UgOiBcIlwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXJldHVybkZvdW5kICYmIHR5cGVvZiB2YWwgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YWwgPSB0aGlzLmx2KHZhbCwgY3R4LCBwYXJ0aWFscyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWw7XG4gICAgfSxcblxuICAgIC8vIGhpZ2hlciBvcmRlciB0ZW1wbGF0ZXNcbiAgICBobzogZnVuY3Rpb24odmFsLCBjeCwgcGFydGlhbHMsIHRleHQsIHRhZ3MpIHtcbiAgICAgIHZhciBjb21waWxlciA9IHRoaXMuYztcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgb3B0aW9ucy5kZWxpbWl0ZXJzID0gdGFncztcbiAgICAgIHZhciB0ZXh0ID0gdmFsLmNhbGwoY3gsIHRleHQpO1xuICAgICAgdGV4dCA9ICh0ZXh0ID09IG51bGwpID8gU3RyaW5nKHRleHQpIDogdGV4dC50b1N0cmluZygpO1xuICAgICAgdGhpcy5iKGNvbXBpbGVyLmNvbXBpbGUodGV4dCwgb3B0aW9ucykucmVuZGVyKGN4LCBwYXJ0aWFscykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyB0ZW1wbGF0ZSByZXN1bHQgYnVmZmVyaW5nXG4gICAgYjogKHVzZUFycmF5QnVmZmVyKSA/IGZ1bmN0aW9uKHMpIHsgdGhpcy5idWYucHVzaChzKTsgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHMpIHsgdGhpcy5idWYgKz0gczsgfSxcbiAgICBmbDogKHVzZUFycmF5QnVmZmVyKSA/IGZ1bmN0aW9uKCkgeyB2YXIgciA9IHRoaXMuYnVmLmpvaW4oJycpOyB0aGlzLmJ1ZiA9IFtdOyByZXR1cm4gcjsgfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHsgdmFyIHIgPSB0aGlzLmJ1ZjsgdGhpcy5idWYgPSAnJzsgcmV0dXJuIHI7IH0sXG5cbiAgICAvLyBsYW1iZGEgcmVwbGFjZSBzZWN0aW9uXG4gICAgbHM6IGZ1bmN0aW9uKHZhbCwgY3R4LCBwYXJ0aWFscywgaW52ZXJ0ZWQsIHN0YXJ0LCBlbmQsIHRhZ3MpIHtcbiAgICAgIHZhciBjeCA9IGN0eFtjdHgubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgdCA9IG51bGw7XG5cbiAgICAgIGlmICghaW52ZXJ0ZWQgJiYgdGhpcy5jICYmIHZhbC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhvKHZhbCwgY3gsIHBhcnRpYWxzLCB0aGlzLnRleHQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpLCB0YWdzKTtcbiAgICAgIH1cblxuICAgICAgdCA9IHZhbC5jYWxsKGN4KTtcblxuICAgICAgaWYgKHR5cGVvZiB0ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaWYgKGludmVydGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaG8odCwgY3gsIHBhcnRpYWxzLCB0aGlzLnRleHQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpLCB0YWdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdDtcbiAgICB9LFxuXG4gICAgLy8gbGFtYmRhIHJlcGxhY2UgdmFyaWFibGVcbiAgICBsdjogZnVuY3Rpb24odmFsLCBjdHgsIHBhcnRpYWxzKSB7XG4gICAgICB2YXIgY3ggPSBjdHhbY3R4Lmxlbmd0aCAtIDFdO1xuICAgICAgdmFyIHJlc3VsdCA9IHZhbC5jYWxsKGN4KTtcblxuICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXN1bHQgPSBjb2VyY2VUb1N0cmluZyhyZXN1bHQuY2FsbChjeCkpO1xuICAgICAgICBpZiAodGhpcy5jICYmIH5yZXN1bHQuaW5kZXhPZihcIntcXHUwMDdCXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYy5jb21waWxlKHJlc3VsdCwgdGhpcy5vcHRpb25zKS5yZW5kZXIoY3gsIHBhcnRpYWxzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29lcmNlVG9TdHJpbmcocmVzdWx0KTtcbiAgICB9XG5cbiAgfTtcblxuICB2YXIgckFtcCA9IC8mL2csXG4gICAgICByTHQgPSAvPC9nLFxuICAgICAgckd0ID0gLz4vZyxcbiAgICAgIHJBcG9zID0vXFwnL2csXG4gICAgICByUXVvdCA9IC9cXFwiL2csXG4gICAgICBoQ2hhcnMgPS9bJjw+XFxcIlxcJ10vO1xuXG5cbiAgZnVuY3Rpb24gY29lcmNlVG9TdHJpbmcodmFsKSB7XG4gICAgcmV0dXJuIFN0cmluZygodmFsID09PSBudWxsIHx8IHZhbCA9PT0gdW5kZWZpbmVkKSA/ICcnIDogdmFsKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhvZ2FuRXNjYXBlKHN0cikge1xuICAgIHN0ciA9IGNvZXJjZVRvU3RyaW5nKHN0cik7XG4gICAgcmV0dXJuIGhDaGFycy50ZXN0KHN0cikgP1xuICAgICAgc3RyXG4gICAgICAgIC5yZXBsYWNlKHJBbXAsJyZhbXA7JylcbiAgICAgICAgLnJlcGxhY2Uockx0LCcmbHQ7JylcbiAgICAgICAgLnJlcGxhY2Uockd0LCcmZ3Q7JylcbiAgICAgICAgLnJlcGxhY2UockFwb3MsJyYjMzk7JylcbiAgICAgICAgLnJlcGxhY2UoclF1b3QsICcmcXVvdDsnKSA6XG4gICAgICBzdHI7XG4gIH1cblxuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24oYSkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbn0pKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJyA/IGV4cG9ydHMgOiBIb2dhbik7XG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvaG9nYW4uanMvbGliL3RlbXBsYXRlLmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2hvZ2FuLmpzL2xpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gKG5CeXRlcyAqIDgpIC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gKGUgKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gKG0gKiAyNTYpICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAoKHZhbHVlICogYykgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuKGZ1bmN0aW9uKCl7XG4gIHZhciByZXBvcyA9IHJlcXVpcmUoJy4vZ2l0aHViLXJlcG9zLmpzJykucmVwb3M7XG4gIC8vdmFyIFRyaWFuZ2xpZnkgPSByZXF1aXJlKCd0cmlhbmdsaWZ5Jyk7XG4gIHZhciBNWiA9IHJlcXVpcmUoJy4vbXpsb2dvJykuTVooKTtcblxuXG4gIHZhciBjb21wbGV0ZUluZGV4ID0gZnVuY3Rpb24oKXtcbiAgICBlbmRMb2FkaW5nKCk7XG4gICAgY29tcGxldGVTZW5zaXRpdmVGaWVsZHMoKTtcbiAgICByZXBvcy5hZGRSZXBvc0xpc3QoXCIjcmVwb3NcIik7XG4gIH07XG5cbiAgdmFyIGNvbXBsZXRlQ3YgPSBmdW5jdGlvbigpe1xuICAgIGVuZExvYWRpbmcoKTtcbiAgfTtcblxuICB2YXIgd2VsbGNvbWUgPSBmdW5jdGlvbigpe1xuICAgIHJ1bkxvZ28oKTtcbiAgfTtcblxuICB2YXIgdGVtcGxhdGVzID0ge1xuICAgIGluZGV4OntcbiAgICAgIHdlbGxjb21lOiB3ZWxsY29tZSxcbiAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvaW5kZXguaHRtbCcpLFxuICAgICAgcG9zdFJlbmRlcjogY29tcGxldGVJbmRleFxuICAgIH0sXG4gICAgY3Y6e1xuICAgICAgd2VsbGNvbWU6IHdlbGxjb21lLFxuICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9jdi5odG1sJyksXG4gICAgICBwb3N0UmVuZGVyOiBjb21wbGV0ZUN2XG4gICAgfVxuICB9O1xuXG4gIHZhciAkbWFpbkNvbnRhaW5lciA9ICQoJyNtYWluLWNvbnRhaW5lcicpO1xuXG4gIC8vIFBsYWNlIHRoZSBsb2dvIG9uIHRoZSBzdmcgY2FudmFzIGFuZCBzdGFydCB0aGUgYW5pbWFpb25cbiAgdmFyIHJ1bkxvZ28gPSBmdW5jdGlvbigpe1xuICAgIHZhciAkbG9nbyA9ICQoXCIjbG9nb1wiKTtcbiAgICB2YXIgJGxvZ29TdmcgPSAkKCcjbG9nby1zdmcnKTtcbiAgICB2YXIgbG9nb1dpZHRoID0gJGxvZ28ud2lkdGgoKTtcbiAgICB2YXIgbG9nb0hlaWdodCA9ICRsb2dvLmhlaWdodCgpO1xuICAgIC8qIHZhciBwYXR0ZXJuID0gVHJpYW5nbGlmeSh7XG4gICAgICAgaGVpZ2h0OiAkbG9hZGluZy5oZWlnaHQoKSxcbiAgICAgICB3aWR0aDogJGxvYWRpbmcud2lkdGgoKSxcbiAgICAgICBjZWxsX3NpemU6IDQwfSk7ICovXG4gICAgJGxvZ29Tdmcud2lkdGgobG9nb1dpZHRoKTtcbiAgICAkbG9nb1N2Zy5oZWlnaHQobG9nb0hlaWdodCsxKTtcbiAgICBNWi5pbml0KCcjbG9nby1zdmcnLCBsb2dvV2lkdGgtMiwgbG9nb0hlaWdodCwgNTAwKTtcbiAgICBNWi5zdGFydEFuaW1hdGlvbigpO1xuICB9O1xuXG4gIHZhciBpbml0aWFsaXplQ29udGVudCA9IGZ1bmN0aW9uKCl7XG4gICAgJCgnLmhpZGRlbicpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAkdGhpcy5oaWRlKCk7XG4gICAgICAkdGhpcy5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkdGhpcy5mYWRlSW4oMTAwMCk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIG1hbmFnZVNjcm9sbEZhZGVJbnMoKTtcbiAgICAgIH0sIDEwMCk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIG1hbmFnZVNjcm9sbEZhZGVJbnMgPSBmdW5jdGlvbihzY3JvbGxCb3R0b20pe1xuICAgIGlmKHNjcm9sbEJvdHRvbSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHNjcm9sbEJvdHRvbSA9ICQod2luZG93KS5zY3JvbGxUb3AoKSArICQod2luZG93KS5oZWlnaHQoKTtcbiAgICB9XG4gICAgJCgnLmZhZGVJbicpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICB2YXIgdGhpc1RvcCA9ICR0aGlzLm9mZnNldCgpLnRvcDtcbiAgICAgIHZhciB0aGlzQm90dG9tID0gdGhpc1RvcCArICR0aGlzLmhlaWdodCgpO1xuICAgICAgaWYodGhpc1RvcCA+PSBzY3JvbGxCb3R0b20pe1xuICAgICAgICAkdGhpcy5jc3MoJ29wYWNpdHknLCAwLjMpO1xuICAgICAgICAkLmRhdGEodGhpcywgJ3ZpZXdlZCcsIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgaWYodGhpc0JvdHRvbSA8IHNjcm9sbEJvdHRvbSAmJiAhJC5kYXRhKHRoaXMsICd2aWV3ZWQnKSl7XG4gICAgICAgICQuZGF0YSh0aGlzLCAndmlld2VkJywgdHJ1ZSk7XG4gICAgICAgICR0aGlzLmFuaW1hdGUoe29wYWNpdHk6MX0sIDEwMDApO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHZhciBlbmRMb2FkaW5nID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgJGxvYWRpbmcgPSAkKCcjbG9hZGluZycpO1xuICAgIGlmKCRsb2FkaW5nLmlzKFwiOnZpc2libGVcIikpe1xuICAgICAgLy8gV2FpdCB0aGUgbG9nbyBhbmltYXRpb24gY29tcGxldGVzXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRsb2FkaW5nLmZhZGVPdXQoNTAwKTtcbiAgICAgICAgaW5pdGlhbGl6ZUNvbnRlbnQoKTtcbiAgICAgIH0sIDMwMDApO1xuICAgIH1lbHNle1xuICAgICAgaW5pdGlhbGl6ZUNvbnRlbnQoKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNvbXBsZXRlU2Vuc2l0aXZlRmllbGRzID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbmFtZSA9ICd6aXRlbGxpbWF0ZXVzJztcbiAgICB2YXIgZG9tYWluID0gJ2dtYWlsLmNvbSc7XG4gICAgdmFyIGNvdW50cnkgPSAnKzYxJztcbiAgICB2YXIgcmVnaW9uID0gJyc7XG4gICAgdmFyIHBob25lID0gJzA0MDIgNTg2JztcbiAgICAkKCcjZW1haWwtYWRyZXNzJykudGV4dChuYW1lICsgJ0AnICsgZG9tYWluKTtcbiAgICAkKCcjcGhvbmUtbnVtYmVyJykudGV4dChbY291bnRyeSwgcmVnaW9uLCBwaG9uZV0uam9pbignICcpKTtcbiAgfTtcblxuICB2YXIgc2Nyb2xsVG8gPSBmdW5jdGlvbihkaXYpe1xuICAgIHZhciBkdXJhdGlvbiA9IDQwMDtcbiAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICBzY3JvbGxUb3A6ICQoZGl2KS5vZmZzZXQoKS50b3BcbiAgICB9LCBkdXJhdGlvbik7XG4gIH07XG5cbiAgdmFyIGxvYWRDb250ZW50ID0gZnVuY3Rpb24od2VsbGNvbWUpe1xuICAgIHZhciBoYXNoID0gZG9jdW1lbnQubG9jYXRpb24uaGFzaC5zbGljZSgxKTtcbiAgICB2YXIgdGFyZ2V0VGVtcGxhdGUgPSB0ZW1wbGF0ZXMuaW5kZXg7XG4gICAgaWYoaGFzaCAhPT0gJycpe1xuICAgICAgdGFyZ2V0VGVtcGxhdGUgPSB0ZW1wbGF0ZXNbaGFzaF07XG4gICAgfVxuXG4gICAgaWYod2VsbGNvbWUgJiYgdGFyZ2V0VGVtcGxhdGUud2VsbGNvbWUpe1xuICAgICAgdGFyZ2V0VGVtcGxhdGUud2VsbGNvbWUoKTtcbiAgICB9XG5cbiAgICBpZih0YXJnZXRUZW1wbGF0ZS5wcmVSZW5kZXIpe1xuICAgICAgdGFyZ2V0VGVtcGxhdGUucHJlUmVuZGVyKCk7XG4gICAgfVxuXG4gICAgdmFyIGh0bWwgPSB0YXJnZXRUZW1wbGF0ZS50ZW1wbGF0ZS5yZW5kZXIoKTtcbiAgICAkbWFpbkNvbnRhaW5lci5odG1sKGh0bWwpO1xuXG4gICAgaWYodGFyZ2V0VGVtcGxhdGUucG9zdFJlbmRlcil7XG4gICAgICB0YXJnZXRUZW1wbGF0ZS5wb3N0UmVuZGVyKCk7XG4gICAgfVxuICAgIHNldEV2ZW50cygpO1xuICB9O1xuXG4gIHZhciBzZXRFdmVudHMgPSBmdW5jdGlvbigpe1xuICAgICQoXCIuZG93bi1hcnJvd1wiKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgdmFyIHRhcmdldCA9ICQodGhpcykuYXR0cignZGF0YS1kZXN0aW5hdGlvbicpO1xuICAgICAgc2Nyb2xsVG8odGFyZ2V0KTtcbiAgICB9KTtcblxuICAgICQoXCJ1bC5uYXZpZ2F0aW9uLWxpbmtzIGFcIikuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgIHZhciBzY3JvbGxUb0VsZW1lbnQgPSAkdGhpcy5hdHRyKCdocmVmJyk7XG4gICAgICAkdGhpcy5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZih0ZW1wbGF0ZXNbc2Nyb2xsVG9FbGVtZW50LnNsaWNlKDEpXSl7XG4gICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24uaGFzaCA9IHNjcm9sbFRvRWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBzY3JvbGxUbyhzY3JvbGxUb0VsZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyIHNjcm9sbFRvcCA9IGUub3JpZ2luYWxFdmVudC5wYWdlWTtcbiAgICAgIHZhciBzY3JvbGxCb3R0b20gPSBzY3JvbGxUb3AgKyAkKHRoaXMpLmhlaWdodCgpO1xuICAgICAgbWFuYWdlU2Nyb2xsRmFkZUlucyhzY3JvbGxCb3R0b20pO1xuICAgIH0pO1xuXG4gICAgJCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlJyxmdW5jdGlvbigpe1xuICAgICAgbG9hZENvbnRlbnQoKTtcbiAgICB9KTtcbiAgfTtcblxuICBzZXRFdmVudHMoKTtcbiAgbG9hZENvbnRlbnQodHJ1ZSk7XG59KCkpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zha2VfNjM5NzVhNjMuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgcmVwb3MgPSAoZnVuY3Rpb24oJCl7XG5cdHZhciByZXBvc01vZHVsZSA9IHt9O1xuXHR2YXIgcmVwb3M7XG5cblx0dmFyIGNyZWF0ZVJlcG9FbGVtZW50ID0gZnVuY3Rpb24oJHVsLCByZXBvKXtcblx0XHR2YXIgJGxpID0gJCgnPGxpPjwvbGk+Jyk7XG5cdFx0dmFyICRhID0gJCgnPGEgY2xhc3M9XCJjb2wtbWQtNCByZXBvLWxpbmtcIiB0YXJnZXQ9XCJfYmxhbmtcIj48L2E+Jyk7XG5cdFx0dmFyICRkaXYgPSAkKCc8ZGl2IGNsYXNzPVwicmVwby1jb250ZW50XCI+PC9kaXY+Jyk7XG5cdFx0dmFyICR0aXRsZSA9ICQoJzxoMz48L2gzPicpO1xuXHRcdHZhciAkZGVzY3JpcHRpb24gPSAkKCc8cD48L3A+Jyk7XG4gICAgJHRpdGxlLnRleHQocmVwby5uYW1lKTtcbiAgICAkZGVzY3JpcHRpb24udGV4dChyZXBvLmRlc2NyaXB0aW9uKTtcblx0XHQkdGl0bGUuYXBwZW5kVG8oJGRpdik7XG5cdFx0JGRlc2NyaXB0aW9uLmFwcGVuZFRvKCRkaXYpO1xuXHRcdCRkaXYuYWRkQ2xhc3MocmVwby5sYW5ndWFnZSk7XG5cdFx0JGRpdi5hcHBlbmRUbygkYSk7XG5cdFx0JGEuYXR0cignaHJlZicsIHJlcG8uaHRtbF91cmwpO1xuXHRcdCRhLmFwcGVuZFRvKCRsaSk7XG5cdFx0JGxpLmFwcGVuZFRvKCR1bCk7XG5cdH07XG5cblx0Lypcblx0ICogQWRkIHRoZSByZXBvc2l0b3J5IGxpc3QgaW4gYW4gZWxlbWVudFxuXHQgKiBwYXJhbSB7c3RyaW5nIHx8IGpxdWVyeSBFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHNlbGVjdG9yIHdoZXJlIHRoZVxuXHQgKiBsaXN0IHdpbGwgYmUgcHV0IGluXG5cdCAqL1xuXHRyZXBvc01vZHVsZS5hZGRSZXBvc0xpc3QgPSBmdW5jdGlvbihlbGVtZW50LCBhbGwpe1xuXHRcdGxvYWRSZXBvcyhhbGwpLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG5cdFx0XHRpZihyZXBvcyA9PT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0JGVsZW1lbnQuaHRtbChcIjxwPkVycm9yIGxvYWRpbmcgbXkgcmVwb3NpdG9yaWVzLjwvcD5cIik7XG5cdFx0XHRcdHRocm93IEVycm9yKFwiUGxlYXNlIGxvYWQgdGhlIHJlcG9zaXRvcnkgbGlzdC5cIik7XG5cdFx0XHR9ZWxzZSBpZihyZXBvcyA9PT0gbnVsbCl7XG5cdFx0XHRcdCRlbGVtZW50Lmh0bWwoXCI8cD5FcnJvciBsb2FkaW5nIG15IHJlcG9zaXRvcmllcy5cIik7XG5cdFx0XHRcdHRocm93IEVycm9yKFwiTm8gcmVwb3NpdG9yaWVzIHJldHVybmVkLlwiKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyICR1bCA9ICQoJzx1bCBjbGFzcz1cInJlcG8tbGlzdCBsaXN0LXVuc3R5bGVkXCI+PC91bD4nKTtcblx0XHRcdHJlcG9zLmZpbHRlcihmdW5jdGlvbihyZXBvKXtcbiAgICAgICAgcmV0dXJuICFyZXBvLmZvcms7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24ocmVwbyl7XG5cdFx0XHRcdGNyZWF0ZVJlcG9FbGVtZW50KCR1bCwgcmVwbyk7XG5cdFx0XHR9KTtcblx0XHRcdCR1bC5hcHBlbmRUbygkZWxlbWVudCk7XG5cdFx0fSk7XG5cdH07XG5cblx0Lypcblx0ICogTG9hZCB0aGUgcmVwb3MgbGlzdCBmb3IgYSBnaXZlbiB1c2VyXG5cdCAqIHBhcmFtIHtpbnRlZ2VyfSBob3dfbWFueSBIb3cgbWFueSByZXBvcyB0byBsb2FkXG5cdCAqIHBhcmFtIHtzdHJpbmd9IHVzZXIgR2l0aHViIHVzZXJuYW1lIG9yIG9yZ1xuXHQgKiBwYXJhbSB7aW50ZWdlcn0gcGFnZSBUaGUgcGFnZSBudW1iZXIgdG8gYmUgcmV0cmlldmVkXG5cdCAqL1xuXG5cdHZhciBsb2FkUmVwb3MgPSBmdW5jdGlvbih1c2VyLCBwYWdlKXtcblx0XHR2YXIgaG93X21hbnkgPSAxMDA7XG5cdFx0dXNlciA9IHVzZXIgfHwgXCJNYXRldXNaaXRlbGxpXCI7XG5cdFx0cGFnZSA9IHBhZ2UgfHwgMTtcblx0XHRyZXBvcyA9IHJlcG9zIHx8IFtdO1xuXG5cdFx0dmFyIHVyaSA9IFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy9cIisgdXNlciArXCIvcmVwb3M/Y2FsbGJhY2s9P1wiXG5cdFx0XHQrIFwiJnNvcnQ9Y3JlYXRlZFwiXG5cdFx0XHQrIFwiJnR5cGU9b3duZXJcIlxuXHRcdFx0KyBcIiZwZXJfcGFnZT1cIiArIGhvd19tYW55XG5cdFx0XHQrIFwiJnBhZ2U9XCIgKyBwYWdlO1xuXG5cdFx0cmV0dXJuICQuZ2V0SlNPTih1cmksIGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dmFyIGxvYWRlZFJlcG9zID0gZGF0YS5kYXRhO1xuXHRcdFx0aWYoZGF0YS5tZXRhLnN0YXR1cyAhPT0gMjAwKXtcblx0XHRcdFx0cmVwb3MgPSBudWxsO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZihsb2FkZWRSZXBvcy5sZW5ndGggIT09IDApe1xuXHRcdFx0XHRyZXBvcyA9IHJlcG9zLmNvbmNhdChsb2FkZWRSZXBvcyk7XG5cdFx0XHRcdGxvYWRSZXBvcyh1c2VyLCBwYWdlICsgMSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0cmV0dXJuIHJlcG9zTW9kdWxlO1xufSgkKSk7XG5cbmV4cG9ydHMucmVwb3MgPSByZXBvcztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9naXRodWItcmVwb3MuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgTVogPSBmdW5jdGlvbihzZXJ2aWNlcyl7XG4gIFwidXNlIHN0cmljdFwiO1xuICAvL1ByaXZhdGUgdmFyc1xuICB2YXIgbW9kdWxlID0ge307XG5cbiAgdmFyIGF0dHJzID0ge1xuICAgIGJvcmRlcjp7XG4gICAgICBmaWxsOiBcIm5vbmVcIixcbiAgICAgIHN0cm9rZTogXCIjMDAwXCIsXG4gICAgICBzdHJva2VXaWR0aDogMSxcbiAgICAgIFwiZmlsbC1vcGFjaXR5XCI6IDEuMFxuICAgIH0sXG4gICAgaW52aXNpYmxlOntcbiAgICAgIHN0cm9rZVdpZHRoOiAxLFxuICAgICAgZmlsbDogXCJub25lXCIsXG4gICAgICBzdHJva2U6IFwiIzAwMFwiLFxuICAgICAgXCJzdHJva2Utb3BhY2l0eVwiOiAwLjBcbiAgICB9XG4gIH07XG5cbiAgdmFyIG1hdHJpeGVzID17XG4gICAgTTogbmV3IFNuYXAuTWF0cml4KCksXG4gICAgWjogbmV3IFNuYXAuTWF0cml4KClcbiAgfTtcblxuICB2YXIgc25hcDtcbiAgdmFyIHN0ZXBEdXJhdGlvbjtcbiAgdmFyIGNvb3JkcyA9IHt9O1xuICB2YXIgcGF0aHMgPSB7fTtcblxuICAvLyBQcml2YXRlIGZ1bnRpb25zXG4gIHZhciBzZXRDb29yZHMgPSBmdW5jdGlvbigpe1xuICAgIGNvb3JkcyA9IHtcbiAgICAgIHRyaWFuZ2xlOiBbXG4gICAgICAgIG5ldyBDb29yZCgxLCAwKSxcbiAgICAgICAgbmV3IENvb3JkKG1vZHVsZS5zaXplLngsIDApLFxuICAgICAgICBuZXcgQ29vcmQobW9kdWxlLnNpemUueCAvIDIuMCwgbW9kdWxlLnNpemUueSAvIDIuMClcbiAgICAgIF0sXG4gICAgICBtaXJyb3JlZFRyaWFuZ2xlOiBbXG4gICAgICAgIG5ldyBDb29yZCgxLCBtb2R1bGUuc2l6ZS55KSxcbiAgICAgICAgbmV3IENvb3JkKG1vZHVsZS5zaXplLngsIG1vZHVsZS5zaXplLnkpLFxuICAgICAgICBuZXcgQ29vcmQobW9kdWxlLnNpemUueCAvIDIuMCwgbW9kdWxlLnNpemUueSAvIDIuMClcbiAgICAgIF0sXG4gICAgICBleHRlcm5Cb3g6IFtcbiAgICAgICAgbmV3IENvb3JkKDEsIDApLFxuICAgICAgICBuZXcgQ29vcmQobW9kdWxlLnNpemUueCwgMCksXG4gICAgICAgIG5ldyBDb29yZChtb2R1bGUuc2l6ZS54LCBtb2R1bGUuc2l6ZS55KSxcbiAgICAgICAgbmV3IENvb3JkKDEsIG1vZHVsZS5zaXplLnkpXG4gICAgICBdLFxuICAgICAgTTogW1xuICAgICAgICBuZXcgQ29vcmQoMSwgbW9kdWxlLnNpemUueSksXG4gICAgICAgIG5ldyBDb29yZCgxLCAwKSxcbiAgICAgICAgbmV3IENvb3JkKG1vZHVsZS5zaXplLnggLyAyLjAsIG1vZHVsZS5zaXplLnkgLyAyLjApLFxuICAgICAgICBuZXcgQ29vcmQobW9kdWxlLnNpemUueCwgMCksXG4gICAgICAgIG5ldyBDb29yZChtb2R1bGUuc2l6ZS54LCBtb2R1bGUuc2l6ZS55KVxuICAgICAgXSxcbiAgICAgIFo6IFtcbiAgICAgICAgbmV3IENvb3JkKDEsIDApLFxuICAgICAgICBuZXcgQ29vcmQobW9kdWxlLnNpemUueCwgMCksXG4gICAgICAgIG5ldyBDb29yZCgxLCBtb2R1bGUuc2l6ZS55KSxcbiAgICAgICAgbmV3IENvb3JkKG1vZHVsZS5zaXplLngsIG1vZHVsZS5zaXplLnkpXG4gICAgICBdXG4gICAgfTtcbiAgfTtcblxuICB2YXIgc2V0UGF0aHMgPSBmdW5jdGlvbigpe1xuICAgIGlmKGNvb3JkcyA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHRocm93IFwiT2JqZWN0IGNvb3JkaW5hdGVzIHVuZGVmaW5lZC5cIjtcbiAgICB9XG5cbiAgICBwYXRocyA9IHtcbiAgICAgIHRyaWFuZ2xlOiBuZXcgUGF0aChjb29yZHMudHJpYW5nbGUsIHRydWUpLFxuICAgICAgbWlycm9yZWRUcmlhbmdsZTogbmV3IFBhdGgoY29vcmRzLm1pcnJvcmVkVHJpYW5nbGUsIHRydWUpLFxuICAgICAgZXh0ZXJuQm94OiBuZXcgUGF0aChjb29yZHMuZXh0ZXJuQm94LCB0cnVlKSxcbiAgICAgIE06IG5ldyBQYXRoKGNvb3Jkcy5NLCBmYWxzZSksXG4gICAgICBaOiBuZXcgUGF0aChjb29yZHMuWiwgZmFsc2UpXG4gICAgfTtcblxuICAgIHBhdGhzLnRyaWFuZ2xlQ29weSA9IHBhdGhzLnRyaWFuZ2xlLmNvcHkoKTtcbiAgfTtcblxuICB2YXIgYXBwbHlJbml0aWFsU3RhdGVJblNuYXAgPSBmdW5jdGlvbigpe1xuICAgIHBhdGhzLnRyaWFuZ2xlLmFwcGx5KHNuYXApLmF0dHIoYXR0cnMuYm9yZGVyKTtcbiAgICBwYXRocy50cmlhbmdsZUNvcHkuYXBwbHkoc25hcCkuYXR0cihhdHRycy5ib3JkZXIpO1xuICAgIHBhdGhzLmV4dGVybkJveC5hcHBseShzbmFwKS5hdHRyKGF0dHJzLmludmlzaWJsZSk7XG4gICAgcGF0aHMuTS5hcHBseShzbmFwKS5hdHRyKGF0dHJzLmludmlzaWJsZSk7XG4gICAgcGF0aHMuWi5hcHBseShzbmFwKS5hdHRyKGF0dHJzLmludmlzaWJsZSk7XG4gIH07XG5cbiAgdmFyIGNyZWF0ZU1aID0gZnVuY3Rpb24oKXtcbiAgICBwYXRocy5NQm94ID0gbmV3IFBhdGgoY29vcmRzLmV4dGVybkJveCwgdHJ1ZSk7XG5cbiAgICBwYXRocy5NQm94LmFwcGx5KHNuYXApLmF0dHIoYXR0cnMuYm9yZGVyKTtcbiAgICBwYXRocy5taXJyb3JlZFRyaWFuZ2xlLmFwcGx5KHNuYXApLmF0dHIoYXR0cnMuYm9yZGVyKTtcblxuICAgIHZhciBNR3JvdXAgPSBzbmFwLmdyb3VwKHBhdGhzLnRyaWFuZ2xlLnBhdGguY2xvbmUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzLm1pcnJvcmVkVHJpYW5nbGUucGF0aCwgcGF0aHMuTUJveC5wYXRoKTtcbiAgICB2YXIgWkdyb3VwID0gTUdyb3VwLmNsb25lKCk7XG5cbiAgICB2YXIgc2hvd01aID0gZnVuY3Rpb24oKXtcbiAgICAgIHBhdGhzLk0ucGF0aC5hbmltYXRlKHsnc3Ryb2tlLW9wYWNpdHknOiAxLCBzdHJva2VXaWR0aDogNX0sIHN0ZXBEdXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5hLmVhc2Vpbm91dCk7XG4gICAgICBwYXRocy5aLnBhdGguYW5pbWF0ZSh7J3N0cm9rZS1vcGFjaXR5JzogMSwgc3Ryb2tlV2lkdGg6IDV9LCBzdGVwRHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluYS5lYXNlaW5vdXQpO1xuICAgICAgTUdyb3VwLmFuaW1hdGUoeydzdHJva2Utb3BhY2l0eSc6IDB9LCBzdGVwRHVyYXRpb24sIG1pbmEuZWFzZWlub3V0KTtcbiAgICAgIFpHcm91cC5hbmltYXRlKHsnc3Ryb2tlLW9wYWNpdHknOiAwfSwgc3RlcER1cmF0aW9uLCBtaW5hLmVhc2Vpbm91dCk7XG4gICAgfTtcblxuICAgIHZhciBtb3ZlR3JvdXBzVG9GaW5hbERlc3RpbmF0aW9uQW5kU2hvd01aID0gZnVuY3Rpb24oKXtcbiAgICAgIHBhdGhzLk0ucGF0aC5hbmltYXRlKHt0cmFuc2Zvcm06IG1hdHJpeGVzLk19LCBzdGVwRHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluYS5lYXNlaW5vdXQpO1xuICAgICAgcGF0aHMuWi5wYXRoLmFuaW1hdGUoe3RyYW5zZm9ybTogbWF0cml4ZXMuWn0sIHN0ZXBEdXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5hLmVhc2Vpbm91dCk7XG4gICAgICBNR3JvdXAuYW5pbWF0ZSh7dHJhbnNmb3JtOiBtYXRyaXhlcy5NfSwgc3RlcER1cmF0aW9uLCBtaW5hLmVhc2Vpbm91dCk7XG4gICAgICBaR3JvdXAuYW5pbWF0ZSh7dHJhbnNmb3JtOiBtYXRyaXhlcy5afSwgc3RlcER1cmF0aW9uLCBtaW5hLmVhc2Vpbm91dCk7XG4gICAgICBzZXRUaW1lb3V0KHNob3dNWiAsIHN0ZXBEdXJhdGlvbik7XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQobW92ZUdyb3Vwc1RvRmluYWxEZXN0aW5hdGlvbkFuZFNob3dNWiwgc3RlcER1cmF0aW9uKTtcbiAgfTtcblxuICAvL1B1YmxpYyBtZXRob2RzXG4gIG1vZHVsZS5zdGFydEFuaW1hdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgaWYodGhpcy5zaXplID09PSB1bmRlZmluZWQpe1xuICAgICAgdGhyb3cgXCJUaGUgTVogd2FzIG5vdCBpbml0aWFsaXplZC5cIjtcbiAgICB9XG4gICAgcGF0aHMudHJpYW5nbGVDb3B5LmFuaW1hdGVDb29yZHMoY29vcmRzLm1pcnJvcmVkVHJpYW5nbGUsIHN0ZXBEdXJhdGlvbik7XG4gICAgcGF0aHMuZXh0ZXJuQm94LnBhdGguYW5pbWF0ZSh7J3N0cm9rZS1vcGFjaXR5JzoxLCB9LCBzdGVwRHVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluYS5lYXNlaW5vdXQpO1xuICAgIGFwcGx5SW5pdGlhbFN0YXRlSW5TbmFwKCk7XG4gICAgc2V0VGltZW91dChjcmVhdGVNWiwgc3RlcER1cmF0aW9uKTtcbiAgfTtcblxuICBtb2R1bGUuaW5pdCA9IGZ1bmN0aW9uKGRpdiwgd2lkdGgsIGhlaWdodCwgZHVyYXRpb24pe1xuICAgIHNuYXAgPSBTbmFwKGRpdik7XG4gICAgc3RlcER1cmF0aW9uID0gZHVyYXRpb247XG5cbiAgICB0aGlzLnNpemUgPSBuZXcgQ29vcmQoKTtcbiAgICB0aGlzLnNpemUueCA9IHdpZHRoO1xuICAgIHRoaXMuc2l6ZS55ID0gaGVpZ2h0O1xuXG4gICAgbWF0cml4ZXMuTS5zY2FsZSgwLjIsIDAuMiwgbW9kdWxlLnNpemUueCAvIDIuMCwgbW9kdWxlLnNpemUueSk7XG4gICAgbWF0cml4ZXMuTS50cmFuc2xhdGUoMCwgLW1vZHVsZS5zaXplLnkgKiAzLjUpO1xuXG4gICAgbWF0cml4ZXMuWi5zY2FsZSgwLjIsIDAuMiwgbW9kdWxlLnNpemUueCAvIDIuMCwgbW9kdWxlLnNpemUueSk7XG4gICAgbWF0cml4ZXMuWi50cmFuc2xhdGUoMCwgLW1vZHVsZS5zaXplLnkgKiAwLjUpO1xuXG4gICAgc2V0Q29vcmRzKCk7XG4gICAgc2V0UGF0aHMoKTtcbiAgICBhcHBseUluaXRpYWxTdGF0ZUluU25hcCgpO1xuICB9O1xuXG4gIHJldHVybiBtb2R1bGU7XG59O1xuLypcbiAqIERlZmluZSB1bSBlbGVtZW50byBkZSBjb29yZGVuYWRhIGJpZGltZW5zaW9uYWwuXG4gKiBAcGFyYW0ge2ludH0geCBBYnNjaXNzYXNcbiAqIEBwYXJhbSB7aW50fSB5IE9yZGVuYWRhc1xuICovXG52YXIgQ29vcmQgPSBmdW5jdGlvbih4LCB5KXtcbiAgdGhpcy54ID0geDtcbiAgdGhpcy55ID0geTtcbn07XG5cbi8qIFxuICogR2VyYSB1bSBlbGVtZW50byBwYXRoIGEgcGFydGlyIGRhcyBjb29yZGVuYWRhcyBwYXNzYWRhcyBcbiAqIEBwYXJhbSB7bGlzdCBvZiBDb29yZH0gY29vcmRzIExpc3RhIGRlIGNvb3JkZW5hZGFzIGRvcyBwb250b3NcbiAqL1xudmFyIFBhdGggPSBmdW5jdGlvbihjb29yZHMsIGNsb3NlZCl7XG4gIGlmKGNvb3JkcyA9PT0gbnVsbCl7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuY29vcmRzID0gY29vcmRzO1xuICB0aGlzLmNsb3NlZCA9IGNsb3NlZDtcbiAgdGhpcy5zdmdQYXRoU3RyaW5nID0gdGhpcy5zdHJpZ2lmeUNvb3Jkcyhjb29yZHMpO1xufTtcblxuLypcbiAqIEdlcmEgdW1hIHN0cmluZyBjb21hIGRlc2NyacOnw6NvIGRlIHVtIHBhdGggbm8gZm9ybWFkbyBkZWZpbmlkb1xuICogcGVsYSBlc3BlY2lmaWNhw6fDtWVzIGRvIHN2Z1xuICogQHBhcmFtIHtsaXN0IG9mIENvb3JkfSBjb29yZHMgTGlzdGEgZGUgY29vcmRlbmFkYXNcbiAqL1xuUGF0aC5wcm90b3R5cGUuc3RyaWdpZnlDb29yZHMgPSBmdW5jdGlvbihjb29yZHMpe1xuICB2YXIgc3ZnUGF0aFN0cmluZyA9ICdNJztcbiAgdmFyIGZpbmFsUGF0aENoYXIgPSB0aGlzLmNsb3NlZCA/ICd6JzogJyc7XG4gIGZvcih2YXIgaW5kZXggaW4gY29vcmRzKXsgXG4gICAgc3ZnUGF0aFN0cmluZyArPSBjb29yZHNbaW5kZXhdLnggKyAnLCcgKyBjb29yZHNbaW5kZXhdLnk7XG4gICAgLy9JZiBpcyB0aGUgbGFzdCBsaW5lIG1ha2UgYSBjbG9zZSBwYXRoXG4gICAgc3ZnUGF0aFN0cmluZyArPSBpbmRleCA9PSBjb29yZHMubGVuZ3RoIC0gMSA/IGZpbmFsUGF0aENoYXIgOiAnTCc7XG4gIH1cbiAgcmV0dXJuIHN2Z1BhdGhTdHJpbmc7XG59O1xuXG4vKlxuICogQXBsaWNhIG8gcGF0aCDDoCB1bSBlbGVtZW50byBTbmFwXG4gKiBAcGFyYW0ge1NuYXAgZWxlbWVudH0gc25hcCBFbGVtZW50byBTbmFwIG5vIHF1YWwgbyBwYXRoIHNlcsOhIGFwbGljYWRvXG4gKi9cblBhdGgucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24oc25hcCl7XG4gIHRoaXMucGF0aCA9IHNuYXAucGF0aCh0aGlzLnN2Z1BhdGhTdHJpbmcpO1xuICByZXR1cm4gdGhpcy5wYXRoO1xufTtcblxuLypcbiAqIENyaWEgdW1hIGPDs3BpYSBkbyBwYXRoXG4gKiBAcmV0dXJuIHtQYXRoIGVsZW1lbnR9IENvcHkgb2ZcbiAqL1xuUGF0aC5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBjb3B5ID0gbmV3IFBhdGgoKTtcbiAgY29weS5zdmdQYXRoU3RyaW5nID0gdGhpcy5zdmdQYXRoU3RyaW5nO1xuICBjb3B5LmNvb3JkcyA9IHRoaXMuY29vcmRzO1xuICBjb3B5LmNsb3NlZCA9IHRoaXMuY2xvc2VkO1xuICByZXR1cm4gY29weTtcbn07XG5cbi8qXG4gKiBBbmltYSBvIHBhdGggcGFyYSBhcyBub3ZhcyBjb29yZGVuYWRhcyBwYXNzYWRhc1xuICogQHBhcmFtIHtsaXN0IG9mIENvb3Jkc30gY29vcmRzIExpc3RhIGNvbSBhcyBub3ZhcyBjb29yZGVuYWRhc1xuICogQHBhcmFtIHtmbG9hdH0gdGltZSBEdXJhw6fDo28gZGEgYW5pbWHDp8OjbyBlbSBtaWNyb3NzZWd1bmRvc1xuICovXG5QYXRoLnByb3RvdHlwZS5hbmltYXRlQ29vcmRzID0gZnVuY3Rpb24oY29vcmRzLCB0aW1lKXtcbiAgdmFyIG5ld1BhdGhTdHJpbmcgPSB0aGlzLnN0cmlnaWZ5Q29vcmRzKGNvb3Jkcyk7XG4gIHRoaXMucGF0aC5hbmltYXRlKHtwYXRoOm5ld1BhdGhTdHJpbmd9LCB0aW1lLCBtaW5hLmVhc2Vpbm91dCk7XG59O1xuXG5leHBvcnRzLk1aID0gTVo7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbXpsb2dvLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHQgPSBuZXcgKHJlcXVpcmUoJ2hvZ2FuLmpzL2xpYi90ZW1wbGF0ZScpKS5UZW1wbGF0ZShmdW5jdGlvbihjLHAsaSl7dmFyIF89dGhpcztfLmIoaT1pfHxcIlwiKTtfLmIoXCI8ZGl2IGlkPVxcXCJjdlxcXCIgY2xhc3M9XFxcImhpZGRlbiBjb250ZW50XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDxhcnRpY2xlIGNsYXNzPVxcXCJjb250YWluZXJcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS0xMiBwYXBlclxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDE+TWF0ZXVzIFppdGVsbGksIEN1cnJpY3VsdW0gVml0YWU8L2gxPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIEknbSBhIDIyIHllYXJzIG9sZCBCcmF6aWxpYW4gc3R1ZGVudCBvZiBDb21wdXRlciBTY2llbmNlLCB3aXRoIDcgeWVhcnMgb2YgZXhwZXJpZW5jZSBpbiBzb2Z0d2FyZSBkZXZlbG9wbWVudC4gSSdtIGluIHRoZSB0aGlyZCB5ZWFyIG9mIENvbXB1dGVyIFNjaWVuY2UgY291cnNlIGF0IFVuaXZlcnNpZGFkZSBGZWRlcmFsIGRvIEFCQyBhbmQgY3VycmVudGx5IGluIGV4Y2hhbmdlIGF0IEF1c3RyYWxpYW4gTmF0aW9uYWwgVW5pdmVyc2l0eSBieSB0aGUgQnJhemlsaWFuIHByb2dyYW0gU2NpZW5jZSB3aXRob3V0IEJvcmRlcnMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDI+VGVjaGluaWNhbCBza2lsbHM8L2gyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGhyPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPHA+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIER1cmluZyB0aGUgbGFzdCA3IHllYXJzIEkndmUgZGV2ZWxvcGVkIHNvZnR3YXJlIGZvciBkaWZmZXJlbnQgcHJvcG9zZXMsIGZyb20gYXNzZW1ibHkgdG8gQVZSIG1pY3JvY29udHJvbGxlcnMsIHNpbXBsZSBhcHBsaWNhdGlvbnMgd2l0aCBzY2hlbWUsIHRvIGNvbXBsZXRlIHdlYiBhcHBzIHVzaW5nIEZsdXggKyBSZWFjdC5qcy4gVGhvc2UgeWVhcnMgc3R1ZHlpbmcgZGlmZmVyZW50IHRlY2hub2xvZ2llcyBhbGxvd2VkIG1lIHRvIGhhdmUgYSBnb29kIG5vdGlvbiBvZiB3aGF0IGlzIG5lY2Vzc2FyeSB0byBkZXZlbG9wIHNvZnR3YXJlIHdpdGggcXVhbGl0eSBpbmRlcGVuZGVudCBvZiB0aGUgYWRvcHRlZCB0ZWNobm9sb2dpZXMuXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5CYXNpYyBDIHByb2dyYW1taW5nIGZvciBkZXNrdG9wIGFwcGxpY2F0aW9uczs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8bGk+QWR2YW5jZWQgcHl0aG9uIHByb2dyYW1taW5nIGZvciBnZW5lcmFsIHByb3Bvc2UgdXNhZ2UsIGRhdGEgYW5hbHlzaXMgYW5kIHdlYiBkZXZlbG9wbWVudCB3aXRoIERqYW5nbzs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8bGk+RVMyMDE2IEphdmFTY3JpcHQgbGludGVkLCB0ZXN0ZWQ7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGxpPkZyb250LWVuZCBkZXZlbG9wbWVudCB3aXRoIFJlYWN0LmpzLCBGbHV4IHVzaW5nIFJlZHV4IGFuZCB1c2FnZSBvZiBpbW11dGFibGUgZGF0YXR5cGVzIHdpdGggSW1tdXRhYmxlLmpzOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5Ob2RlLmpzICsgZXhwcmVzcy9rb2EuanMgZm9yIGdlbmVyYWwgYmFjay1lbmQgc29sdXRpb25zLCBpbmNsdWRpbmcgUkVTVCBBUElzOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5BZHZhbmNlZCBnaXQgZXhwZXJpZW5jZSBmb3IgY29kZSB2ZXJzaW9uIGNvbnRyb2xsOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5HdWxwLCBHcnVudCBhbmQgV2VicGFjayBmb3IgYXV0b21hdGlvbiBhbmQgbWFuYWdlbWVudCBvZiBKYXZhU2NyaXB0IHByb2plY3RzOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5DU1MyLCBDU1MzLCBCb290c3RyYXAsIGhhbmR3cml0dGVuIGZvciByZXNwb25zaWJsZSBsYXlvdXRzOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5FeHBlcmllbmNlIHdpdGggTW9uZ29EQiBhbmQgUmV0aGlua0RCIGZvciBub1NRTCBkYXRhYmFzZXM7PC9saT4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT5TY2hlbWUgYXMgYSBnZW5lcmFsIHByb3Bvc2UgbGFuZ3VhZ2UgKGFuZCBiZWNhdXNlIGl0J3MgZnVuISk7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGxpPlhIVE1MIDQuMCwgKFgpSFRNTDUsIGhhbmR3cml0dGVuIHdpdGggZXhwZXJpZW5jZSBpbiBhdXRvbWF0aW9uIHRvb2xzIHN1Y2ggYXMgZW1tZXQ7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDI+RXh0cmFzPC9oMj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxocj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxoMz5SZXNlYXJjaCBQcm9ncmFtIC0gUWVvcHBzIC0gWW91bmcgVGFsZW50cyBvZiBTY2llbmNlL0NOUHFcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8YnI+KFEpZW9wcHMgaXMgYW4gKEUpdm9sdXRpb25hcnkgKE8pcHRpbWl6YXRvciBmb3IgKFApYXJhbGxlbCAoUClyb2dyYW0ocylcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8YnI+PHNtYWxsPkphbnVhcnkvMjAxMyAtIERlY2VtYmVyLzIwMTM8L3NtYWxsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L2gzPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPGxpPjxzdHJvbmc+SG9ub3JhYmxlIE1lbnRpb248L3N0cm9uZz4gaW4gdGhlIGF4aXMgb2YgQ29tbXVuaWNhdGlvbiBhbmQgSW5mb3JtYXRpb24gLSBTY2llbnRpZmljIEluaXRpYXRpb24gTWVldGluZzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPGxpPlB5dGhvbiBmb3IgY29tcGxleCBhcHBsaWNhdGlvbnM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8bGk+U2NoZW1lIGZvciBjb21wbGV4IGFwcGxpY2F0aW9uczs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxsaT5FeHBlcmllbmNlIHdpdGggYWNhZGVtaWMgd3JpdGluZzs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxsaT5FeHBlcmllbmNlIHdpdGggcGFyYWxsZWwgcHJvZ3JhbW1pbmcgdXNpbmcgUG9zaXggVGhyZWFkczs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8aDM+SGFja2F0b24gOTlqb2JzIC0gRmlyc3QgUGxhY2VcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNtYWxsPjEyIGFuZCAxMyBvZiBBcHJpbCBvZiAyMDE0PC9zbWFsbD48L2gzPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5BcyBGcm9udC1lbmQgZGV2ZWxvcGVyIG1lIHdpdGggbXkgdGVhbSBkZXZlbG9wZWQgdGhlIHdpbm5lciBwcm9qZWN0IDxhIGhyZWY9XFxcImh0dHA6Ly9nZW50ZWJvYS5tZXRlb3IuY29tXFxcIj5HZW50ZSBCb2E8L2E+LjwvcD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGgyPkVkdWNhdGlvbjwvaDI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8aDM+QXVzdHJhbGlhbiBOYXRpb25hbCBVbml2ZXJzaXR5XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxzbWFsbD5Ob3ZlbWJlci8yMDE1IC0gRGVjZW1iZXIvMjAxNjwvc21hbGw+PC9oMz5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHA+U2Nob2xhcnNoaXAgZnJvbSBDTlBxIHdpdGggdGhlIHByb2dyYW0gU2NpZW5jZSBXaXRob3V0IEJvcmRlcnM8L3A+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxkaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxoMz5Vbml2ZXJzaWRhZGUgRmVkZXJhbCBkbyBBQkNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPHNtYWxsPkFwcmlsLzIwMTIgLSBBcHJpbC8yMDE3PC9zbWFsbD48L2gzPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8cD5CYWNoZWxvciBEZWdyZWUgaW4gU2NpZW5jZSBhbmQgVGVjaG5vbG9neSAvIEJhY2hlbG9yIERlZ3JlZSBpbiBDb21wdXRlciBTY2llbmNlPC9wPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDI+RXhwZXJpZW5jZTwvaDI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8aDM+ZnVsbC1zdGFjayBkZXZlbG9wZXIvY3RvIGF0IGzDs2cgYmlcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGJyPjxzbWFsbD5qYW51YXJ5LzIwMTUgLSBub3ZlbWJlci8yMDE1PC9zbWFsbD48L2gzPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8bGk+Y29tcGxldGUgZGV2ZWxvcG1lbnQgb2YgYSBjb21wbGV4IHdlYiBhcHA7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDxsaT5hcGkgcmVzdCB3aXRoIG5vZGUuanMgKyBrb2EuanM7PC9saT4gXCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8bGk+bW9uZ29kYiBhcyBhIG5vc3FsIGRhdGFiYXNlOzwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgICA8bGk+cmVhY3QuanMgZm9yIHJldXNhYmxlIHVpIGNvbXBvbmVudHM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICAgIDxsaT5mbHV4IGFzIHRoZSBhcmNoaXRldHVyZSBmb3IgdGhlIGZyb250LWVuZCBhcHBsaWNhdGlvbjs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgICAgPGxpPmltbXV0YWJsZSBkYXRhIHN0cnVjdHMgd2l0aCBpbW11dGFibGUuanM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC91bD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGRpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGgzPkZyb250LWVuZCBkZXZlbG9wbWVudCBhdCA5OWpvYnNcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGJyPjxzbWFsbD5KdWx5LzIwMTQgLSBOb3ZlbWJlci8yMDE0PC9zbWFsbD48L2gzPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8dWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgICAgPGxpPkNTUzMsIFNBU1MsIEJvb3RzdHJhcCBmb3IgcGl4ZWxzIHBlcmZlY3QgYW5kIHJlc3BvbnNpdmUgZGVzaWduczs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxsaT5KYXZhc2NyaXB0IGFuZCBKUXVlcnkgZm9yIGR5bmFtaWMgd2VicGFnZXM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8bGk+RXhwZXJpZW5jZSB3aXRoIHNvbHV0aW9uIHRoYXQgd2VyZSB1c2VkIGJ5IHRob3VzYW5kcyB1c2VycyBldmVyeWRheTs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICAgIDxsaT5SZWFjdC5qcyArIEZsdXggZm9yIGEgd2ViIGFwcCBkZXZlbG9wbWVudDs8L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8ZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8aDM+SW50ZXJuc2hpcCAtIE1ldGFtw6FxdWluYSAoPGEgaHJlZj1cXFwiaHR0cDovL21ldGFtYXF1aW5hLmNvbS5ici9cXFwiPmh0dHA6Ly9tZXRhbWFxdWluYS5jb20uYnIvPC9hPilcIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGJyPjxzbWFsbD5BcHJpbC8yMDEyIC0gU2VwdGVtYmVyLzIwMTI8L3NtYWxsPjwvaDM+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDx1bD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8bGk+RXhwZXJpZW5jZSB3aXRoIGNvbmZpZ3VyYXRpb24gb2YgM0QgcHJpbnRlcnM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8bGk+RXhwZXJpZW5jZSB3aXRoIDNEIHByaW50aW5nIHdpdGggb3BlbiBzb3VyY2UgdG9vbHM7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgICA8bGk+M0QgcHJvZ3JhbW1hdGljIG1vZGVsaW5nIHdpdGggT3BlbnNjYWQ7PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPC91bD5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgIDwvYXJ0aWNsZT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIpO3JldHVybiBfLmZsKCk7O30pO21vZHVsZS5leHBvcnRzID0geyAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7IHJldHVybiB0LnJlbmRlci5hcHBseSh0LCBhcmd1bWVudHMpOyB9LCAgcjogZnVuY3Rpb24gKCkgeyByZXR1cm4gdC5yLmFwcGx5KHQsIGFyZ3VtZW50cyk7IH0sICByaTogZnVuY3Rpb24gKCkgeyByZXR1cm4gdC5yaS5hcHBseSh0LCBhcmd1bWVudHMpOyB9fTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vdGVtcGxhdGVzL2N2Lmh0bWxcIixcIi8uLi90ZW1wbGF0ZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgdCA9IG5ldyAocmVxdWlyZSgnaG9nYW4uanMvbGliL3RlbXBsYXRlJykpLlRlbXBsYXRlKGZ1bmN0aW9uKGMscCxpKXt2YXIgXz10aGlzO18uYihpPWl8fFwiXCIpO18uYihcIjxkaXYgaWQ9XFxcImludHJvXFxcIiBjbGFzcz1cXFwiaGlkZGVuIGNvbnRlbnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGhlYWRlciBjbGFzcz1cXFwiY29udGFpbmVyIHB1bGwtbGVmdCBiaWctdGFibGVcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8ZGl2IGNsYXNzPVxcXCJyb3cgY2VudGVyLWNlbGxcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC1zbS0xMiBjZW50ZXJlZC1lbGVtZW50XFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoMT5NYXRldXMgWml0ZWxsaTwvaDE+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aDI+RnVsbCBzdGFjayB3ZWIgZGV2ZWxvcGVyIOKAoiBDYW5iZXJyYSwgQUNUIC0gQXVzdHJhbGlhPC9oMj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wteHMtNiBjb2wtc20tMyBjb2wtbGctMiB0ZXh0LWNlbnRlciBpbmZvXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxoMj5OYXZpZ2F0aW9uPC9oMj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxocj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx1bCBjbGFzcz1cXFwibGlzdC11bnN0eWxlZCBuYXZpZ2F0aW9uLWxpbmtzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgICAgPGxpPjxhIGhyZWY9XFxcIiNjdlxcXCI+Q3VycmljdWx1bTwvYT48L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiI3JlcG9zLWNvbnRlbnRcXFwiPk9wZW4tc291cmNlIHByb2plY3RzPC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC14cy02IGNvbC1zbS0zIGNvbC1sZy0yIHRleHQtY2VudGVyIGluZm9cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGgyPlNvY2lhbDwvaDI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8aHI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8dWwgY2xhc3M9XFxcImxpc3QtdW5zdHlsZWRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly90d2l0dGVyLmNvbS9NYXRldXNaaXRlbGxpXFxcIj5Ud2l0dGVyPC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL2dpdGh1Yi5jb20vTWF0ZXVzWml0ZWxsaVxcXCI+R2l0aHViPC9hPjwvbGk+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICA8L3VsPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC14cy02IGNvbC1zbS0zIGNvbC1sZy0yIHRleHQtY2VudGVyIGluZm9cXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgPGgyPkdldCBpbiBjb250YWN0PC9oMj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDxocj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDx1bCBjbGFzcz1cXFwibGlzdC11bnN0eWxlZFxcXCI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgICAgIDxsaSBpZD1cXFwiZW1haWwtYWRyZXNzXFxcIj48L2xpPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICAgICAgICA8bGkgaWQ9XFxcInBob25lLW51bWJlclxcXCI+PC9saT5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgICAgIDwvdWw+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDwvZGl2PlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPC9oZWFkZXI+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8aW1nIHNyYz1cXFwiaW1hZ2VzL2Rvd24tYXJyb3cuc3ZnXFxcIiBkYXRhLWRlc3RpbmF0aW9uPVxcXCIjcmVwb3MtY29udGVudFxcXCIgY2xhc3M9XFxcImRvd24tYXJyb3dcXFwiIGFsdD1cXFwiU2V0YSBwYXJhIHZlciBtYWlzXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8L2Rpdj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCI8ZGl2IGNsYXNzPVxcXCJoaWRkZW4gY29udGVudFxcXCIgaWQ9XFxcInJlcG9zLWNvbnRlbnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgPGFydGljbGUgY2xhc3M9XFxcImNvbnRhaW5lciBwdWxsLWxlZnRcXFwiPlwiKTtfLmIoXCJcXG5cIiArIGkpO18uYihcIiAgICA8aDE+TXkgR2l0SHViIHJlcG9zaXRvcmllczwvaDE+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICAgIDxkaXYgY2xhc3M9XFxcInJvd1xcXCIgaWQ9XFxcInJlcG9zXFxcIj5cIik7Xy5iKFwiXFxuXCIgKyBpKTtfLmIoXCIgICAgPC9kaXY+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiICA8L2FydGljbGU+XCIpO18uYihcIlxcblwiICsgaSk7Xy5iKFwiPC9kaXY+XCIpO18uYihcIlxcblwiKTtyZXR1cm4gXy5mbCgpOzt9KTttb2R1bGUuZXhwb3J0cyA9IHsgIHJlbmRlcjogZnVuY3Rpb24gKCkgeyByZXR1cm4gdC5yZW5kZXIuYXBwbHkodCwgYXJndW1lbnRzKTsgfSwgIHI6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHQuci5hcHBseSh0LCBhcmd1bWVudHMpOyB9LCAgcmk6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHQucmkuYXBwbHkodCwgYXJndW1lbnRzKTsgfX07XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL3RlbXBsYXRlcy9pbmRleC5odG1sXCIsXCIvLi4vdGVtcGxhdGVzXCIpIl19
