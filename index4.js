var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@sidewinder/contract/exception.js
var require_exception = __commonJS({
  "node_modules/@sidewinder/contract/exception.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Exception = void 0;
    var Exception = class extends Error {
      constructor(message, code, data) {
        super(message);
        this.code = code;
        this.data = data;
      }
    };
    exports.Exception = Exception;
  }
});

// node_modules/@sidewinder/type/type.js
var require_type = __commonJS({
  "node_modules/@sidewinder/type/type.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Type = exports.TypeBuilder = exports.Modifier = exports.Hint = exports.Kind = void 0;
    exports.Kind = Symbol.for("TypeBox.Kind");
    exports.Hint = Symbol.for("TypeBox.Hint");
    exports.Modifier = Symbol.for("TypeBox.Modifier");
    var TypeOrdinal = 0;
    var TypeBuilder = class {
      ReadonlyOptional(item) {
        return { [exports.Modifier]: "ReadonlyOptional", ...item };
      }
      Readonly(item) {
        return { [exports.Modifier]: "Readonly", ...item };
      }
      Optional(item) {
        return { [exports.Modifier]: "Optional", ...item };
      }
      Any(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Any" });
      }
      Array(items, options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Array", type: "array", items });
      }
      Boolean(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Boolean", type: "boolean" });
      }
      ConstructorParameters(schema, options = {}) {
        return this.Tuple([...schema.parameters], { ...options });
      }
      Constructor(parameters, returns, options = {}) {
        if (parameters[exports.Kind] === "Tuple") {
          const inner = parameters.items === void 0 ? [] : parameters.items;
          return this.Create({ ...options, [exports.Kind]: "Constructor", type: "object", instanceOf: "Constructor", parameters: inner, returns });
        } else if (globalThis.Array.isArray(parameters)) {
          return this.Create({ ...options, [exports.Kind]: "Constructor", type: "object", instanceOf: "Constructor", parameters, returns });
        } else {
          throw new Error("TypeBuilder.Constructor: Invalid parameters");
        }
      }
      Date(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Date", type: "object", instanceOf: "Date" });
      }
      Enum(item, options = {}) {
        const values = Object.keys(item).filter((key) => isNaN(key)).map((key) => item[key]);
        const anyOf = values.map((value) => typeof value === "string" ? { [exports.Kind]: "Literal", type: "string", const: value } : { [exports.Kind]: "Literal", type: "number", const: value });
        return this.Create({ ...options, [exports.Kind]: "Union", [exports.Hint]: "Enum", anyOf });
      }
      Function(parameters, returns, options = {}) {
        if (parameters[exports.Kind] === "Tuple") {
          const inner = parameters.items === void 0 ? [] : parameters.items;
          return this.Create({ ...options, [exports.Kind]: "Function", type: "object", instanceOf: "Function", parameters: inner, returns });
        } else if (globalThis.Array.isArray(parameters)) {
          return this.Create({ ...options, [exports.Kind]: "Function", type: "object", instanceOf: "Function", parameters, returns });
        } else {
          throw new Error("TypeBuilder.Function: Invalid parameters");
        }
      }
      InstanceType(schema, options = {}) {
        return { ...options, ...this.Clone(schema.returns) };
      }
      Integer(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Integer", type: "integer" });
      }
      Intersect(objects, options = {}) {
        const isOptional = (schema) => schema[exports.Modifier] && schema[exports.Modifier] === "Optional" || schema[exports.Modifier] === "ReadonlyOptional";
        const [required, optional] = [/* @__PURE__ */ new Set(), /* @__PURE__ */ new Set()];
        for (const object of objects) {
          for (const [key, schema] of Object.entries(object.properties)) {
            if (isOptional(schema))
              optional.add(key);
          }
        }
        for (const object of objects) {
          for (const key of Object.keys(object.properties)) {
            if (!optional.has(key))
              required.add(key);
          }
        }
        const properties = {};
        for (const object of objects) {
          for (const [key, schema] of Object.entries(object.properties)) {
            properties[key] = properties[key] === void 0 ? schema : { [exports.Kind]: "Union", anyOf: [properties[key], { ...schema }] };
          }
        }
        if (required.size > 0) {
          return this.Create({ ...options, [exports.Kind]: "Object", type: "object", properties, required: [...required] });
        } else {
          return this.Create({ ...options, [exports.Kind]: "Object", type: "object", properties });
        }
      }
      KeyOf(object, options = {}) {
        const items = Object.keys(object.properties).map((key) => this.Create({ ...options, [exports.Kind]: "Literal", type: "string", const: key }));
        return this.Create({ ...options, [exports.Kind]: "Union", [exports.Hint]: "KeyOf", anyOf: items });
      }
      Literal(value, options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Literal", const: value, type: typeof value });
      }
      Never(options = {}) {
        return this.Create({
          ...options,
          [exports.Kind]: "Never",
          allOf: [
            { type: "boolean", const: false },
            { type: "boolean", const: true }
          ]
        });
      }
      Null(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Null", type: "null" });
      }
      Number(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Number", type: "number" });
      }
      Object(properties, options = {}) {
        const property_names = Object.keys(properties);
        const optional = property_names.filter((name) => {
          const property = properties[name];
          const modifier = property[exports.Modifier];
          return modifier && (modifier === "Optional" || modifier === "ReadonlyOptional");
        });
        const required = property_names.filter((name) => !optional.includes(name));
        if (required.length > 0) {
          return this.Create({ ...options, [exports.Kind]: "Object", type: "object", properties, required });
        } else {
          return this.Create({ ...options, [exports.Kind]: "Object", type: "object", properties });
        }
      }
      Omit(schema, keys, options = {}) {
        const select = keys[exports.Kind] === "Union" ? keys.anyOf.map((schema2) => schema2.const) : keys;
        const next = { ...this.Clone(schema), ...options, [exports.Hint]: "Omit" };
        if (next.required) {
          next.required = next.required.filter((key) => !select.includes(key));
          if (next.required.length === 0)
            delete next.required;
        }
        for (const key of Object.keys(next.properties)) {
          if (select.includes(key))
            delete next.properties[key];
        }
        return this.Create(next);
      }
      Parameters(schema, options = {}) {
        return exports.Type.Tuple(schema.parameters, { ...options });
      }
      Partial(schema, options = {}) {
        const next = { ...this.Clone(schema), ...options, [exports.Hint]: "Partial" };
        delete next.required;
        for (const key of Object.keys(next.properties)) {
          const property = next.properties[key];
          const modifer = property[exports.Modifier];
          switch (modifer) {
            case "ReadonlyOptional":
              property[exports.Modifier] = "ReadonlyOptional";
              break;
            case "Readonly":
              property[exports.Modifier] = "ReadonlyOptional";
              break;
            case "Optional":
              property[exports.Modifier] = "Optional";
              break;
            default:
              property[exports.Modifier] = "Optional";
              break;
          }
        }
        return this.Create(next);
      }
      Pick(schema, keys, options = {}) {
        const select = keys[exports.Kind] === "Union" ? keys.anyOf.map((schema2) => schema2.const) : keys;
        const next = { ...this.Clone(schema), ...options, [exports.Hint]: "Pick" };
        if (next.required) {
          next.required = next.required.filter((key) => select.includes(key));
          if (next.required.length === 0)
            delete next.required;
        }
        for (const key of Object.keys(next.properties)) {
          if (!select.includes(key))
            delete next.properties[key];
        }
        return this.Create(next);
      }
      Promise(item, options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Promise", type: "object", instanceOf: "Promise", item });
      }
      Record(key, value, options = {}) {
        if (key[exports.Kind] === "Union") {
          return this.Object(key.anyOf.reduce((acc, literal) => {
            return { ...acc, [literal.const]: value };
          }, {}), { ...options, [exports.Hint]: "Record" });
        }
        const pattern = ["Integer", "Number"].includes(key[exports.Kind]) ? "^(0|[1-9][0-9]*)$" : key[exports.Kind] === "String" && key.pattern ? key.pattern : "^.*$";
        return this.Create({
          ...options,
          [exports.Kind]: "Record",
          type: "object",
          patternProperties: { [pattern]: value },
          additionalProperties: false
        });
      }
      Recursive(callback, options = {}) {
        if (options.$id === void 0)
          options.$id = `T${TypeOrdinal++}`;
        const self = callback({ [exports.Kind]: "Self", $ref: `${options.$id}` });
        self.$id = options.$id;
        return this.Create({ ...options, ...self });
      }
      Ref(schema, options = {}) {
        if (schema.$id === void 0)
          throw Error("TypeBuilder.Ref: Referenced schema must specify an $id");
        return this.Create({ ...options, [exports.Kind]: "Ref", $ref: schema.$id });
      }
      RegEx(regex, options = {}) {
        return this.Create({ ...options, [exports.Kind]: "String", type: "string", pattern: regex.source });
      }
      Required(schema, options = {}) {
        const next = { ...this.Clone(schema), ...options, [exports.Hint]: "Required" };
        next.required = Object.keys(next.properties);
        for (const key of Object.keys(next.properties)) {
          const property = next.properties[key];
          const modifier = property[exports.Modifier];
          switch (modifier) {
            case "ReadonlyOptional":
              property[exports.Modifier] = "Readonly";
              break;
            case "Readonly":
              property[exports.Modifier] = "Readonly";
              break;
            case "Optional":
              delete property[exports.Modifier];
              break;
            default:
              delete property[exports.Modifier];
              break;
          }
        }
        return this.Create(next);
      }
      ReturnType(schema, options = {}) {
        return { ...options, ...this.Clone(schema.returns) };
      }
      Strict(schema) {
        return JSON.parse(JSON.stringify(schema));
      }
      String(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "String", type: "string" });
      }
      Tuple(items, options = {}) {
        const additionalItems = false;
        const minItems = items.length;
        const maxItems = items.length;
        const schema = items.length > 0 ? { ...options, [exports.Kind]: "Tuple", type: "array", items, additionalItems, minItems, maxItems } : { ...options, [exports.Kind]: "Tuple", type: "array", minItems, maxItems };
        return this.Create(schema);
      }
      Undefined(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Undefined", type: "null", typeOf: "Undefined" });
      }
      Union(items, options = {}) {
        return items.length === 0 ? exports.Type.Never({ ...options }) : this.Create({ ...options, [exports.Kind]: "Union", anyOf: items });
      }
      Uint8Array(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Uint8Array", type: "object", instanceOf: "Uint8Array" });
      }
      Unknown(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Unknown" });
      }
      Unsafe(options = {}) {
        return this.Create({ ...options, [exports.Kind]: options[exports.Kind] || "Unsafe" });
      }
      Void(options = {}) {
        return this.Create({ ...options, [exports.Kind]: "Void", type: "null", typeOf: "Void" });
      }
      Create(schema) {
        return schema;
      }
      Clone(value) {
        const isObject = (object) => typeof object === "object" && object !== null && !Array.isArray(object);
        const isArray = (object) => typeof object === "object" && object !== null && Array.isArray(object);
        if (isObject(value)) {
          return Object.keys(value).reduce((acc, key) => ({
            ...acc,
            [key]: this.Clone(value[key])
          }), Object.getOwnPropertySymbols(value).reduce((acc, key) => ({
            ...acc,
            [key]: this.Clone(value[key])
          }), {}));
        } else if (isArray(value)) {
          return value.map((item) => this.Clone(item));
        } else {
          return value;
        }
      }
    };
    exports.TypeBuilder = TypeBuilder;
    exports.Type = new TypeBuilder();
  }
});

// node_modules/@sidewinder/type/index.js
var require_type2 = __commonJS({
  "node_modules/@sidewinder/type/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_type(), exports);
  }
});

// node_modules/@sidewinder/contract/type.js
var require_type3 = __commonJS({
  "node_modules/@sidewinder/contract/type.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Type = exports.ContractTypeBuilder = void 0;
    var type_1 = require_type2();
    __exportStar(require_type2(), exports);
    var ContractTypeBuilder = class extends type_1.TypeBuilder {
      Contract(options) {
        const format = options.format || "json";
        const server = options.server || {};
        const client = options.client || {};
        return this.Create({ type: "contract", [type_1.Kind]: "Contract", format, server, client });
      }
    };
    exports.ContractTypeBuilder = ContractTypeBuilder;
    exports.Type = new ContractTypeBuilder();
  }
});

// node_modules/@sidewinder/contract/index.js
var require_contract = __commonJS({
  "node_modules/@sidewinder/contract/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_exception(), exports);
    __exportStar(require_type3(), exports);
  }
});

// node_modules/@sidewinder/client/encoder/encoder.js
var require_encoder = __commonJS({
  "node_modules/@sidewinder/client/encoder/encoder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@sidewinder/client/encoder/json.js
var require_json = __commonJS({
  "node_modules/@sidewinder/client/encoder/json.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JsonEncoder = void 0;
    var JsonEncoder = class {
      constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
      }
      encode(data) {
        return this.encoder.encode(JSON.stringify(data));
      }
      decode(data) {
        return JSON.parse(this.decoder.decode(data));
      }
    };
    exports.JsonEncoder = JsonEncoder;
  }
});

// node_modules/@msgpack/msgpack/dist/utils/int.js
var require_int = __commonJS({
  "node_modules/@msgpack/msgpack/dist/utils/int.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUint64 = exports.getInt64 = exports.setInt64 = exports.setUint64 = exports.UINT32_MAX = void 0;
    exports.UINT32_MAX = 4294967295;
    function setUint64(view, offset, value) {
      const high = value / 4294967296;
      const low = value;
      view.setUint32(offset, high);
      view.setUint32(offset + 4, low);
    }
    exports.setUint64 = setUint64;
    function setInt64(view, offset, value) {
      const high = Math.floor(value / 4294967296);
      const low = value;
      view.setUint32(offset, high);
      view.setUint32(offset + 4, low);
    }
    exports.setInt64 = setInt64;
    function getInt64(view, offset) {
      const high = view.getInt32(offset);
      const low = view.getUint32(offset + 4);
      return high * 4294967296 + low;
    }
    exports.getInt64 = getInt64;
    function getUint64(view, offset) {
      const high = view.getUint32(offset);
      const low = view.getUint32(offset + 4);
      return high * 4294967296 + low;
    }
    exports.getUint64 = getUint64;
  }
});

// node_modules/@msgpack/msgpack/dist/utils/utf8.js
var require_utf8 = __commonJS({
  "node_modules/@msgpack/msgpack/dist/utils/utf8.js"(exports) {
    "use strict";
    var _a;
    var _b;
    var _c;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.utf8DecodeTD = exports.TEXT_DECODER_THRESHOLD = exports.utf8DecodeJs = exports.utf8EncodeTE = exports.TEXT_ENCODER_THRESHOLD = exports.utf8EncodeJs = exports.utf8Count = void 0;
    var int_1 = require_int();
    var TEXT_ENCODING_AVAILABLE = (typeof process === "undefined" || ((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a["TEXT_ENCODING"]) !== "never") && typeof TextEncoder !== "undefined" && typeof TextDecoder !== "undefined";
    function utf8Count(str) {
      const strLength = str.length;
      let byteLength = 0;
      let pos = 0;
      while (pos < strLength) {
        let value = str.charCodeAt(pos++);
        if ((value & 4294967168) === 0) {
          byteLength++;
          continue;
        } else if ((value & 4294965248) === 0) {
          byteLength += 2;
        } else {
          if (value >= 55296 && value <= 56319) {
            if (pos < strLength) {
              const extra = str.charCodeAt(pos);
              if ((extra & 64512) === 56320) {
                ++pos;
                value = ((value & 1023) << 10) + (extra & 1023) + 65536;
              }
            }
          }
          if ((value & 4294901760) === 0) {
            byteLength += 3;
          } else {
            byteLength += 4;
          }
        }
      }
      return byteLength;
    }
    exports.utf8Count = utf8Count;
    function utf8EncodeJs(str, output, outputOffset) {
      const strLength = str.length;
      let offset = outputOffset;
      let pos = 0;
      while (pos < strLength) {
        let value = str.charCodeAt(pos++);
        if ((value & 4294967168) === 0) {
          output[offset++] = value;
          continue;
        } else if ((value & 4294965248) === 0) {
          output[offset++] = value >> 6 & 31 | 192;
        } else {
          if (value >= 55296 && value <= 56319) {
            if (pos < strLength) {
              const extra = str.charCodeAt(pos);
              if ((extra & 64512) === 56320) {
                ++pos;
                value = ((value & 1023) << 10) + (extra & 1023) + 65536;
              }
            }
          }
          if ((value & 4294901760) === 0) {
            output[offset++] = value >> 12 & 15 | 224;
            output[offset++] = value >> 6 & 63 | 128;
          } else {
            output[offset++] = value >> 18 & 7 | 240;
            output[offset++] = value >> 12 & 63 | 128;
            output[offset++] = value >> 6 & 63 | 128;
          }
        }
        output[offset++] = value & 63 | 128;
      }
    }
    exports.utf8EncodeJs = utf8EncodeJs;
    var sharedTextEncoder = TEXT_ENCODING_AVAILABLE ? new TextEncoder() : void 0;
    exports.TEXT_ENCODER_THRESHOLD = !TEXT_ENCODING_AVAILABLE ? int_1.UINT32_MAX : typeof process !== "undefined" && ((_b = process === null || process === void 0 ? void 0 : process.env) === null || _b === void 0 ? void 0 : _b["TEXT_ENCODING"]) !== "force" ? 200 : 0;
    function utf8EncodeTEencode(str, output, outputOffset) {
      output.set(sharedTextEncoder.encode(str), outputOffset);
    }
    function utf8EncodeTEencodeInto(str, output, outputOffset) {
      sharedTextEncoder.encodeInto(str, output.subarray(outputOffset));
    }
    exports.utf8EncodeTE = (sharedTextEncoder === null || sharedTextEncoder === void 0 ? void 0 : sharedTextEncoder.encodeInto) ? utf8EncodeTEencodeInto : utf8EncodeTEencode;
    var CHUNK_SIZE = 4096;
    function utf8DecodeJs(bytes, inputOffset, byteLength) {
      let offset = inputOffset;
      const end = offset + byteLength;
      const units = [];
      let result = "";
      while (offset < end) {
        const byte1 = bytes[offset++];
        if ((byte1 & 128) === 0) {
          units.push(byte1);
        } else if ((byte1 & 224) === 192) {
          const byte2 = bytes[offset++] & 63;
          units.push((byte1 & 31) << 6 | byte2);
        } else if ((byte1 & 240) === 224) {
          const byte2 = bytes[offset++] & 63;
          const byte3 = bytes[offset++] & 63;
          units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
        } else if ((byte1 & 248) === 240) {
          const byte2 = bytes[offset++] & 63;
          const byte3 = bytes[offset++] & 63;
          const byte4 = bytes[offset++] & 63;
          let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
          if (unit > 65535) {
            unit -= 65536;
            units.push(unit >>> 10 & 1023 | 55296);
            unit = 56320 | unit & 1023;
          }
          units.push(unit);
        } else {
          units.push(byte1);
        }
        if (units.length >= CHUNK_SIZE) {
          result += String.fromCharCode(...units);
          units.length = 0;
        }
      }
      if (units.length > 0) {
        result += String.fromCharCode(...units);
      }
      return result;
    }
    exports.utf8DecodeJs = utf8DecodeJs;
    var sharedTextDecoder = TEXT_ENCODING_AVAILABLE ? new TextDecoder() : null;
    exports.TEXT_DECODER_THRESHOLD = !TEXT_ENCODING_AVAILABLE ? int_1.UINT32_MAX : typeof process !== "undefined" && ((_c = process === null || process === void 0 ? void 0 : process.env) === null || _c === void 0 ? void 0 : _c["TEXT_DECODER"]) !== "force" ? 200 : 0;
    function utf8DecodeTD(bytes, inputOffset, byteLength) {
      const stringBytes = bytes.subarray(inputOffset, inputOffset + byteLength);
      return sharedTextDecoder.decode(stringBytes);
    }
    exports.utf8DecodeTD = utf8DecodeTD;
  }
});

// node_modules/@msgpack/msgpack/dist/ExtData.js
var require_ExtData = __commonJS({
  "node_modules/@msgpack/msgpack/dist/ExtData.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtData = void 0;
    var ExtData = class {
      constructor(type2, data) {
        this.type = type2;
        this.data = data;
      }
    };
    exports.ExtData = ExtData;
  }
});

// node_modules/@msgpack/msgpack/dist/DecodeError.js
var require_DecodeError = __commonJS({
  "node_modules/@msgpack/msgpack/dist/DecodeError.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecodeError = void 0;
    var DecodeError = class extends Error {
      constructor(message) {
        super(message);
        const proto = Object.create(DecodeError.prototype);
        Object.setPrototypeOf(this, proto);
        Object.defineProperty(this, "name", {
          configurable: true,
          enumerable: false,
          value: DecodeError.name
        });
      }
    };
    exports.DecodeError = DecodeError;
  }
});

// node_modules/@msgpack/msgpack/dist/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/@msgpack/msgpack/dist/timestamp.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.timestampExtension = exports.decodeTimestampExtension = exports.decodeTimestampToTimeSpec = exports.encodeTimestampExtension = exports.encodeDateToTimeSpec = exports.encodeTimeSpecToTimestamp = exports.EXT_TIMESTAMP = void 0;
    var DecodeError_1 = require_DecodeError();
    var int_1 = require_int();
    exports.EXT_TIMESTAMP = -1;
    var TIMESTAMP32_MAX_SEC = 4294967296 - 1;
    var TIMESTAMP64_MAX_SEC = 17179869184 - 1;
    function encodeTimeSpecToTimestamp({ sec, nsec }) {
      if (sec >= 0 && nsec >= 0 && sec <= TIMESTAMP64_MAX_SEC) {
        if (nsec === 0 && sec <= TIMESTAMP32_MAX_SEC) {
          const rv = new Uint8Array(4);
          const view = new DataView(rv.buffer);
          view.setUint32(0, sec);
          return rv;
        } else {
          const secHigh = sec / 4294967296;
          const secLow = sec & 4294967295;
          const rv = new Uint8Array(8);
          const view = new DataView(rv.buffer);
          view.setUint32(0, nsec << 2 | secHigh & 3);
          view.setUint32(4, secLow);
          return rv;
        }
      } else {
        const rv = new Uint8Array(12);
        const view = new DataView(rv.buffer);
        view.setUint32(0, nsec);
        (0, int_1.setInt64)(view, 4, sec);
        return rv;
      }
    }
    exports.encodeTimeSpecToTimestamp = encodeTimeSpecToTimestamp;
    function encodeDateToTimeSpec(date) {
      const msec = date.getTime();
      const sec = Math.floor(msec / 1e3);
      const nsec = (msec - sec * 1e3) * 1e6;
      const nsecInSec = Math.floor(nsec / 1e9);
      return {
        sec: sec + nsecInSec,
        nsec: nsec - nsecInSec * 1e9
      };
    }
    exports.encodeDateToTimeSpec = encodeDateToTimeSpec;
    function encodeTimestampExtension(object) {
      if (object instanceof Date) {
        const timeSpec = encodeDateToTimeSpec(object);
        return encodeTimeSpecToTimestamp(timeSpec);
      } else {
        return null;
      }
    }
    exports.encodeTimestampExtension = encodeTimestampExtension;
    function decodeTimestampToTimeSpec(data) {
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      switch (data.byteLength) {
        case 4: {
          const sec = view.getUint32(0);
          const nsec = 0;
          return { sec, nsec };
        }
        case 8: {
          const nsec30AndSecHigh2 = view.getUint32(0);
          const secLow32 = view.getUint32(4);
          const sec = (nsec30AndSecHigh2 & 3) * 4294967296 + secLow32;
          const nsec = nsec30AndSecHigh2 >>> 2;
          return { sec, nsec };
        }
        case 12: {
          const sec = (0, int_1.getInt64)(view, 4);
          const nsec = view.getUint32(0);
          return { sec, nsec };
        }
        default:
          throw new DecodeError_1.DecodeError(`Unrecognized data size for timestamp (expected 4, 8, or 12): ${data.length}`);
      }
    }
    exports.decodeTimestampToTimeSpec = decodeTimestampToTimeSpec;
    function decodeTimestampExtension(data) {
      const timeSpec = decodeTimestampToTimeSpec(data);
      return new Date(timeSpec.sec * 1e3 + timeSpec.nsec / 1e6);
    }
    exports.decodeTimestampExtension = decodeTimestampExtension;
    exports.timestampExtension = {
      type: exports.EXT_TIMESTAMP,
      encode: encodeTimestampExtension,
      decode: decodeTimestampExtension
    };
  }
});

// node_modules/@msgpack/msgpack/dist/ExtensionCodec.js
var require_ExtensionCodec = __commonJS({
  "node_modules/@msgpack/msgpack/dist/ExtensionCodec.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionCodec = void 0;
    var ExtData_1 = require_ExtData();
    var timestamp_1 = require_timestamp();
    var ExtensionCodec = class {
      constructor() {
        this.builtInEncoders = [];
        this.builtInDecoders = [];
        this.encoders = [];
        this.decoders = [];
        this.register(timestamp_1.timestampExtension);
      }
      register({ type: type2, encode: encode2, decode: decode2 }) {
        if (type2 >= 0) {
          this.encoders[type2] = encode2;
          this.decoders[type2] = decode2;
        } else {
          const index = 1 + type2;
          this.builtInEncoders[index] = encode2;
          this.builtInDecoders[index] = decode2;
        }
      }
      tryToEncode(object, context) {
        for (let i = 0; i < this.builtInEncoders.length; i++) {
          const encodeExt = this.builtInEncoders[i];
          if (encodeExt != null) {
            const data = encodeExt(object, context);
            if (data != null) {
              const type2 = -1 - i;
              return new ExtData_1.ExtData(type2, data);
            }
          }
        }
        for (let i = 0; i < this.encoders.length; i++) {
          const encodeExt = this.encoders[i];
          if (encodeExt != null) {
            const data = encodeExt(object, context);
            if (data != null) {
              const type2 = i;
              return new ExtData_1.ExtData(type2, data);
            }
          }
        }
        if (object instanceof ExtData_1.ExtData) {
          return object;
        }
        return null;
      }
      decode(data, type2, context) {
        const decodeExt = type2 < 0 ? this.builtInDecoders[-1 - type2] : this.decoders[type2];
        if (decodeExt) {
          return decodeExt(data, type2, context);
        } else {
          return new ExtData_1.ExtData(type2, data);
        }
      }
    };
    exports.ExtensionCodec = ExtensionCodec;
    ExtensionCodec.defaultCodec = new ExtensionCodec();
  }
});

// node_modules/@msgpack/msgpack/dist/utils/typedArrays.js
var require_typedArrays = __commonJS({
  "node_modules/@msgpack/msgpack/dist/utils/typedArrays.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDataView = exports.ensureUint8Array = void 0;
    function ensureUint8Array(buffer) {
      if (buffer instanceof Uint8Array) {
        return buffer;
      } else if (ArrayBuffer.isView(buffer)) {
        return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      } else if (buffer instanceof ArrayBuffer) {
        return new Uint8Array(buffer);
      } else {
        return Uint8Array.from(buffer);
      }
    }
    exports.ensureUint8Array = ensureUint8Array;
    function createDataView(buffer) {
      if (buffer instanceof ArrayBuffer) {
        return new DataView(buffer);
      }
      const bufferView = ensureUint8Array(buffer);
      return new DataView(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
    }
    exports.createDataView = createDataView;
  }
});

// node_modules/@msgpack/msgpack/dist/Encoder.js
var require_Encoder = __commonJS({
  "node_modules/@msgpack/msgpack/dist/Encoder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Encoder = exports.DEFAULT_INITIAL_BUFFER_SIZE = exports.DEFAULT_MAX_DEPTH = void 0;
    var utf8_1 = require_utf8();
    var ExtensionCodec_1 = require_ExtensionCodec();
    var int_1 = require_int();
    var typedArrays_1 = require_typedArrays();
    exports.DEFAULT_MAX_DEPTH = 100;
    exports.DEFAULT_INITIAL_BUFFER_SIZE = 2048;
    var Encoder = class {
      constructor(extensionCodec = ExtensionCodec_1.ExtensionCodec.defaultCodec, context = void 0, maxDepth = exports.DEFAULT_MAX_DEPTH, initialBufferSize = exports.DEFAULT_INITIAL_BUFFER_SIZE, sortKeys = false, forceFloat32 = false, ignoreUndefined = false, forceIntegerToFloat = false) {
        this.extensionCodec = extensionCodec;
        this.context = context;
        this.maxDepth = maxDepth;
        this.initialBufferSize = initialBufferSize;
        this.sortKeys = sortKeys;
        this.forceFloat32 = forceFloat32;
        this.ignoreUndefined = ignoreUndefined;
        this.forceIntegerToFloat = forceIntegerToFloat;
        this.pos = 0;
        this.view = new DataView(new ArrayBuffer(this.initialBufferSize));
        this.bytes = new Uint8Array(this.view.buffer);
      }
      reinitializeState() {
        this.pos = 0;
      }
      encodeSharedRef(object) {
        this.reinitializeState();
        this.doEncode(object, 1);
        return this.bytes.subarray(0, this.pos);
      }
      encode(object) {
        this.reinitializeState();
        this.doEncode(object, 1);
        return this.bytes.slice(0, this.pos);
      }
      doEncode(object, depth) {
        if (depth > this.maxDepth) {
          throw new Error(`Too deep objects in depth ${depth}`);
        }
        if (object == null) {
          this.encodeNil();
        } else if (typeof object === "boolean") {
          this.encodeBoolean(object);
        } else if (typeof object === "number") {
          this.encodeNumber(object);
        } else if (typeof object === "string") {
          this.encodeString(object);
        } else {
          this.encodeObject(object, depth);
        }
      }
      ensureBufferSizeToWrite(sizeToWrite) {
        const requiredSize = this.pos + sizeToWrite;
        if (this.view.byteLength < requiredSize) {
          this.resizeBuffer(requiredSize * 2);
        }
      }
      resizeBuffer(newSize) {
        const newBuffer = new ArrayBuffer(newSize);
        const newBytes = new Uint8Array(newBuffer);
        const newView = new DataView(newBuffer);
        newBytes.set(this.bytes);
        this.view = newView;
        this.bytes = newBytes;
      }
      encodeNil() {
        this.writeU8(192);
      }
      encodeBoolean(object) {
        if (object === false) {
          this.writeU8(194);
        } else {
          this.writeU8(195);
        }
      }
      encodeNumber(object) {
        if (Number.isSafeInteger(object) && !this.forceIntegerToFloat) {
          if (object >= 0) {
            if (object < 128) {
              this.writeU8(object);
            } else if (object < 256) {
              this.writeU8(204);
              this.writeU8(object);
            } else if (object < 65536) {
              this.writeU8(205);
              this.writeU16(object);
            } else if (object < 4294967296) {
              this.writeU8(206);
              this.writeU32(object);
            } else {
              this.writeU8(207);
              this.writeU64(object);
            }
          } else {
            if (object >= -32) {
              this.writeU8(224 | object + 32);
            } else if (object >= -128) {
              this.writeU8(208);
              this.writeI8(object);
            } else if (object >= -32768) {
              this.writeU8(209);
              this.writeI16(object);
            } else if (object >= -2147483648) {
              this.writeU8(210);
              this.writeI32(object);
            } else {
              this.writeU8(211);
              this.writeI64(object);
            }
          }
        } else {
          if (this.forceFloat32) {
            this.writeU8(202);
            this.writeF32(object);
          } else {
            this.writeU8(203);
            this.writeF64(object);
          }
        }
      }
      writeStringHeader(byteLength) {
        if (byteLength < 32) {
          this.writeU8(160 + byteLength);
        } else if (byteLength < 256) {
          this.writeU8(217);
          this.writeU8(byteLength);
        } else if (byteLength < 65536) {
          this.writeU8(218);
          this.writeU16(byteLength);
        } else if (byteLength < 4294967296) {
          this.writeU8(219);
          this.writeU32(byteLength);
        } else {
          throw new Error(`Too long string: ${byteLength} bytes in UTF-8`);
        }
      }
      encodeString(object) {
        const maxHeaderSize = 1 + 4;
        const strLength = object.length;
        if (strLength > utf8_1.TEXT_ENCODER_THRESHOLD) {
          const byteLength = (0, utf8_1.utf8Count)(object);
          this.ensureBufferSizeToWrite(maxHeaderSize + byteLength);
          this.writeStringHeader(byteLength);
          (0, utf8_1.utf8EncodeTE)(object, this.bytes, this.pos);
          this.pos += byteLength;
        } else {
          const byteLength = (0, utf8_1.utf8Count)(object);
          this.ensureBufferSizeToWrite(maxHeaderSize + byteLength);
          this.writeStringHeader(byteLength);
          (0, utf8_1.utf8EncodeJs)(object, this.bytes, this.pos);
          this.pos += byteLength;
        }
      }
      encodeObject(object, depth) {
        const ext = this.extensionCodec.tryToEncode(object, this.context);
        if (ext != null) {
          this.encodeExtension(ext);
        } else if (Array.isArray(object)) {
          this.encodeArray(object, depth);
        } else if (ArrayBuffer.isView(object)) {
          this.encodeBinary(object);
        } else if (typeof object === "object") {
          this.encodeMap(object, depth);
        } else {
          throw new Error(`Unrecognized object: ${Object.prototype.toString.apply(object)}`);
        }
      }
      encodeBinary(object) {
        const size = object.byteLength;
        if (size < 256) {
          this.writeU8(196);
          this.writeU8(size);
        } else if (size < 65536) {
          this.writeU8(197);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(198);
          this.writeU32(size);
        } else {
          throw new Error(`Too large binary: ${size}`);
        }
        const bytes = (0, typedArrays_1.ensureUint8Array)(object);
        this.writeU8a(bytes);
      }
      encodeArray(object, depth) {
        const size = object.length;
        if (size < 16) {
          this.writeU8(144 + size);
        } else if (size < 65536) {
          this.writeU8(220);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(221);
          this.writeU32(size);
        } else {
          throw new Error(`Too large array: ${size}`);
        }
        for (const item of object) {
          this.doEncode(item, depth + 1);
        }
      }
      countWithoutUndefined(object, keys) {
        let count = 0;
        for (const key of keys) {
          if (object[key] !== void 0) {
            count++;
          }
        }
        return count;
      }
      encodeMap(object, depth) {
        const keys = Object.keys(object);
        if (this.sortKeys) {
          keys.sort();
        }
        const size = this.ignoreUndefined ? this.countWithoutUndefined(object, keys) : keys.length;
        if (size < 16) {
          this.writeU8(128 + size);
        } else if (size < 65536) {
          this.writeU8(222);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(223);
          this.writeU32(size);
        } else {
          throw new Error(`Too large map object: ${size}`);
        }
        for (const key of keys) {
          const value = object[key];
          if (!(this.ignoreUndefined && value === void 0)) {
            this.encodeString(key);
            this.doEncode(value, depth + 1);
          }
        }
      }
      encodeExtension(ext) {
        const size = ext.data.length;
        if (size === 1) {
          this.writeU8(212);
        } else if (size === 2) {
          this.writeU8(213);
        } else if (size === 4) {
          this.writeU8(214);
        } else if (size === 8) {
          this.writeU8(215);
        } else if (size === 16) {
          this.writeU8(216);
        } else if (size < 256) {
          this.writeU8(199);
          this.writeU8(size);
        } else if (size < 65536) {
          this.writeU8(200);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(201);
          this.writeU32(size);
        } else {
          throw new Error(`Too large extension object: ${size}`);
        }
        this.writeI8(ext.type);
        this.writeU8a(ext.data);
      }
      writeU8(value) {
        this.ensureBufferSizeToWrite(1);
        this.view.setUint8(this.pos, value);
        this.pos++;
      }
      writeU8a(values) {
        const size = values.length;
        this.ensureBufferSizeToWrite(size);
        this.bytes.set(values, this.pos);
        this.pos += size;
      }
      writeI8(value) {
        this.ensureBufferSizeToWrite(1);
        this.view.setInt8(this.pos, value);
        this.pos++;
      }
      writeU16(value) {
        this.ensureBufferSizeToWrite(2);
        this.view.setUint16(this.pos, value);
        this.pos += 2;
      }
      writeI16(value) {
        this.ensureBufferSizeToWrite(2);
        this.view.setInt16(this.pos, value);
        this.pos += 2;
      }
      writeU32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setUint32(this.pos, value);
        this.pos += 4;
      }
      writeI32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setInt32(this.pos, value);
        this.pos += 4;
      }
      writeF32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setFloat32(this.pos, value);
        this.pos += 4;
      }
      writeF64(value) {
        this.ensureBufferSizeToWrite(8);
        this.view.setFloat64(this.pos, value);
        this.pos += 8;
      }
      writeU64(value) {
        this.ensureBufferSizeToWrite(8);
        (0, int_1.setUint64)(this.view, this.pos, value);
        this.pos += 8;
      }
      writeI64(value) {
        this.ensureBufferSizeToWrite(8);
        (0, int_1.setInt64)(this.view, this.pos, value);
        this.pos += 8;
      }
    };
    exports.Encoder = Encoder;
  }
});

// node_modules/@msgpack/msgpack/dist/encode.js
var require_encode = __commonJS({
  "node_modules/@msgpack/msgpack/dist/encode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.encode = void 0;
    var Encoder_1 = require_Encoder();
    var defaultEncodeOptions = {};
    function encode2(value, options = defaultEncodeOptions) {
      const encoder2 = new Encoder_1.Encoder(options.extensionCodec, options.context, options.maxDepth, options.initialBufferSize, options.sortKeys, options.forceFloat32, options.ignoreUndefined, options.forceIntegerToFloat);
      return encoder2.encodeSharedRef(value);
    }
    exports.encode = encode2;
  }
});

// node_modules/@msgpack/msgpack/dist/utils/prettyByte.js
var require_prettyByte = __commonJS({
  "node_modules/@msgpack/msgpack/dist/utils/prettyByte.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prettyByte = void 0;
    function prettyByte(byte) {
      return `${byte < 0 ? "-" : ""}0x${Math.abs(byte).toString(16).padStart(2, "0")}`;
    }
    exports.prettyByte = prettyByte;
  }
});

// node_modules/@msgpack/msgpack/dist/CachedKeyDecoder.js
var require_CachedKeyDecoder = __commonJS({
  "node_modules/@msgpack/msgpack/dist/CachedKeyDecoder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachedKeyDecoder = void 0;
    var utf8_1 = require_utf8();
    var DEFAULT_MAX_KEY_LENGTH = 16;
    var DEFAULT_MAX_LENGTH_PER_KEY = 16;
    var CachedKeyDecoder = class {
      constructor(maxKeyLength = DEFAULT_MAX_KEY_LENGTH, maxLengthPerKey = DEFAULT_MAX_LENGTH_PER_KEY) {
        this.maxKeyLength = maxKeyLength;
        this.maxLengthPerKey = maxLengthPerKey;
        this.hit = 0;
        this.miss = 0;
        this.caches = [];
        for (let i = 0; i < this.maxKeyLength; i++) {
          this.caches.push([]);
        }
      }
      canBeCached(byteLength) {
        return byteLength > 0 && byteLength <= this.maxKeyLength;
      }
      find(bytes, inputOffset, byteLength) {
        const records = this.caches[byteLength - 1];
        FIND_CHUNK:
          for (const record of records) {
            const recordBytes = record.bytes;
            for (let j = 0; j < byteLength; j++) {
              if (recordBytes[j] !== bytes[inputOffset + j]) {
                continue FIND_CHUNK;
              }
            }
            return record.str;
          }
        return null;
      }
      store(bytes, value) {
        const records = this.caches[bytes.length - 1];
        const record = { bytes, str: value };
        if (records.length >= this.maxLengthPerKey) {
          records[Math.random() * records.length | 0] = record;
        } else {
          records.push(record);
        }
      }
      decode(bytes, inputOffset, byteLength) {
        const cachedValue = this.find(bytes, inputOffset, byteLength);
        if (cachedValue != null) {
          this.hit++;
          return cachedValue;
        }
        this.miss++;
        const str = (0, utf8_1.utf8DecodeJs)(bytes, inputOffset, byteLength);
        const slicedCopyOfBytes = Uint8Array.prototype.slice.call(bytes, inputOffset, inputOffset + byteLength);
        this.store(slicedCopyOfBytes, str);
        return str;
      }
    };
    exports.CachedKeyDecoder = CachedKeyDecoder;
  }
});

// node_modules/@msgpack/msgpack/dist/Decoder.js
var require_Decoder = __commonJS({
  "node_modules/@msgpack/msgpack/dist/Decoder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Decoder = exports.DataViewIndexOutOfBoundsError = void 0;
    var prettyByte_1 = require_prettyByte();
    var ExtensionCodec_1 = require_ExtensionCodec();
    var int_1 = require_int();
    var utf8_1 = require_utf8();
    var typedArrays_1 = require_typedArrays();
    var CachedKeyDecoder_1 = require_CachedKeyDecoder();
    var DecodeError_1 = require_DecodeError();
    var isValidMapKeyType = (key) => {
      const keyType = typeof key;
      return keyType === "string" || keyType === "number";
    };
    var HEAD_BYTE_REQUIRED = -1;
    var EMPTY_VIEW = new DataView(new ArrayBuffer(0));
    var EMPTY_BYTES = new Uint8Array(EMPTY_VIEW.buffer);
    exports.DataViewIndexOutOfBoundsError = (() => {
      try {
        EMPTY_VIEW.getInt8(0);
      } catch (e) {
        return e.constructor;
      }
      throw new Error("never reached");
    })();
    var MORE_DATA = new exports.DataViewIndexOutOfBoundsError("Insufficient data");
    var sharedCachedKeyDecoder = new CachedKeyDecoder_1.CachedKeyDecoder();
    var Decoder = class {
      constructor(extensionCodec = ExtensionCodec_1.ExtensionCodec.defaultCodec, context = void 0, maxStrLength = int_1.UINT32_MAX, maxBinLength = int_1.UINT32_MAX, maxArrayLength = int_1.UINT32_MAX, maxMapLength = int_1.UINT32_MAX, maxExtLength = int_1.UINT32_MAX, keyDecoder = sharedCachedKeyDecoder) {
        this.extensionCodec = extensionCodec;
        this.context = context;
        this.maxStrLength = maxStrLength;
        this.maxBinLength = maxBinLength;
        this.maxArrayLength = maxArrayLength;
        this.maxMapLength = maxMapLength;
        this.maxExtLength = maxExtLength;
        this.keyDecoder = keyDecoder;
        this.totalPos = 0;
        this.pos = 0;
        this.view = EMPTY_VIEW;
        this.bytes = EMPTY_BYTES;
        this.headByte = HEAD_BYTE_REQUIRED;
        this.stack = [];
      }
      reinitializeState() {
        this.totalPos = 0;
        this.headByte = HEAD_BYTE_REQUIRED;
        this.stack.length = 0;
      }
      setBuffer(buffer) {
        this.bytes = (0, typedArrays_1.ensureUint8Array)(buffer);
        this.view = (0, typedArrays_1.createDataView)(this.bytes);
        this.pos = 0;
      }
      appendBuffer(buffer) {
        if (this.headByte === HEAD_BYTE_REQUIRED && !this.hasRemaining(1)) {
          this.setBuffer(buffer);
        } else {
          const remainingData = this.bytes.subarray(this.pos);
          const newData = (0, typedArrays_1.ensureUint8Array)(buffer);
          const newBuffer = new Uint8Array(remainingData.length + newData.length);
          newBuffer.set(remainingData);
          newBuffer.set(newData, remainingData.length);
          this.setBuffer(newBuffer);
        }
      }
      hasRemaining(size) {
        return this.view.byteLength - this.pos >= size;
      }
      createExtraByteError(posToShow) {
        const { view, pos } = this;
        return new RangeError(`Extra ${view.byteLength - pos} of ${view.byteLength} byte(s) found at buffer[${posToShow}]`);
      }
      decode(buffer) {
        this.reinitializeState();
        this.setBuffer(buffer);
        const object = this.doDecodeSync();
        if (this.hasRemaining(1)) {
          throw this.createExtraByteError(this.pos);
        }
        return object;
      }
      *decodeMulti(buffer) {
        this.reinitializeState();
        this.setBuffer(buffer);
        while (this.hasRemaining(1)) {
          yield this.doDecodeSync();
        }
      }
      async decodeAsync(stream) {
        let decoded = false;
        let object;
        for await (const buffer of stream) {
          if (decoded) {
            throw this.createExtraByteError(this.totalPos);
          }
          this.appendBuffer(buffer);
          try {
            object = this.doDecodeSync();
            decoded = true;
          } catch (e) {
            if (!(e instanceof exports.DataViewIndexOutOfBoundsError)) {
              throw e;
            }
          }
          this.totalPos += this.pos;
        }
        if (decoded) {
          if (this.hasRemaining(1)) {
            throw this.createExtraByteError(this.totalPos);
          }
          return object;
        }
        const { headByte, pos, totalPos } = this;
        throw new RangeError(`Insufficient data in parsing ${(0, prettyByte_1.prettyByte)(headByte)} at ${totalPos} (${pos} in the current buffer)`);
      }
      decodeArrayStream(stream) {
        return this.decodeMultiAsync(stream, true);
      }
      decodeStream(stream) {
        return this.decodeMultiAsync(stream, false);
      }
      async *decodeMultiAsync(stream, isArray) {
        let isArrayHeaderRequired = isArray;
        let arrayItemsLeft = -1;
        for await (const buffer of stream) {
          if (isArray && arrayItemsLeft === 0) {
            throw this.createExtraByteError(this.totalPos);
          }
          this.appendBuffer(buffer);
          if (isArrayHeaderRequired) {
            arrayItemsLeft = this.readArraySize();
            isArrayHeaderRequired = false;
            this.complete();
          }
          try {
            while (true) {
              yield this.doDecodeSync();
              if (--arrayItemsLeft === 0) {
                break;
              }
            }
          } catch (e) {
            if (!(e instanceof exports.DataViewIndexOutOfBoundsError)) {
              throw e;
            }
          }
          this.totalPos += this.pos;
        }
      }
      doDecodeSync() {
        DECODE:
          while (true) {
            const headByte = this.readHeadByte();
            let object;
            if (headByte >= 224) {
              object = headByte - 256;
            } else if (headByte < 192) {
              if (headByte < 128) {
                object = headByte;
              } else if (headByte < 144) {
                const size = headByte - 128;
                if (size !== 0) {
                  this.pushMapState(size);
                  this.complete();
                  continue DECODE;
                } else {
                  object = {};
                }
              } else if (headByte < 160) {
                const size = headByte - 144;
                if (size !== 0) {
                  this.pushArrayState(size);
                  this.complete();
                  continue DECODE;
                } else {
                  object = [];
                }
              } else {
                const byteLength = headByte - 160;
                object = this.decodeUtf8String(byteLength, 0);
              }
            } else if (headByte === 192) {
              object = null;
            } else if (headByte === 194) {
              object = false;
            } else if (headByte === 195) {
              object = true;
            } else if (headByte === 202) {
              object = this.readF32();
            } else if (headByte === 203) {
              object = this.readF64();
            } else if (headByte === 204) {
              object = this.readU8();
            } else if (headByte === 205) {
              object = this.readU16();
            } else if (headByte === 206) {
              object = this.readU32();
            } else if (headByte === 207) {
              object = this.readU64();
            } else if (headByte === 208) {
              object = this.readI8();
            } else if (headByte === 209) {
              object = this.readI16();
            } else if (headByte === 210) {
              object = this.readI32();
            } else if (headByte === 211) {
              object = this.readI64();
            } else if (headByte === 217) {
              const byteLength = this.lookU8();
              object = this.decodeUtf8String(byteLength, 1);
            } else if (headByte === 218) {
              const byteLength = this.lookU16();
              object = this.decodeUtf8String(byteLength, 2);
            } else if (headByte === 219) {
              const byteLength = this.lookU32();
              object = this.decodeUtf8String(byteLength, 4);
            } else if (headByte === 220) {
              const size = this.readU16();
              if (size !== 0) {
                this.pushArrayState(size);
                this.complete();
                continue DECODE;
              } else {
                object = [];
              }
            } else if (headByte === 221) {
              const size = this.readU32();
              if (size !== 0) {
                this.pushArrayState(size);
                this.complete();
                continue DECODE;
              } else {
                object = [];
              }
            } else if (headByte === 222) {
              const size = this.readU16();
              if (size !== 0) {
                this.pushMapState(size);
                this.complete();
                continue DECODE;
              } else {
                object = {};
              }
            } else if (headByte === 223) {
              const size = this.readU32();
              if (size !== 0) {
                this.pushMapState(size);
                this.complete();
                continue DECODE;
              } else {
                object = {};
              }
            } else if (headByte === 196) {
              const size = this.lookU8();
              object = this.decodeBinary(size, 1);
            } else if (headByte === 197) {
              const size = this.lookU16();
              object = this.decodeBinary(size, 2);
            } else if (headByte === 198) {
              const size = this.lookU32();
              object = this.decodeBinary(size, 4);
            } else if (headByte === 212) {
              object = this.decodeExtension(1, 0);
            } else if (headByte === 213) {
              object = this.decodeExtension(2, 0);
            } else if (headByte === 214) {
              object = this.decodeExtension(4, 0);
            } else if (headByte === 215) {
              object = this.decodeExtension(8, 0);
            } else if (headByte === 216) {
              object = this.decodeExtension(16, 0);
            } else if (headByte === 199) {
              const size = this.lookU8();
              object = this.decodeExtension(size, 1);
            } else if (headByte === 200) {
              const size = this.lookU16();
              object = this.decodeExtension(size, 2);
            } else if (headByte === 201) {
              const size = this.lookU32();
              object = this.decodeExtension(size, 4);
            } else {
              throw new DecodeError_1.DecodeError(`Unrecognized type byte: ${(0, prettyByte_1.prettyByte)(headByte)}`);
            }
            this.complete();
            const stack = this.stack;
            while (stack.length > 0) {
              const state = stack[stack.length - 1];
              if (state.type === 0) {
                state.array[state.position] = object;
                state.position++;
                if (state.position === state.size) {
                  stack.pop();
                  object = state.array;
                } else {
                  continue DECODE;
                }
              } else if (state.type === 1) {
                if (!isValidMapKeyType(object)) {
                  throw new DecodeError_1.DecodeError("The type of key must be string or number but " + typeof object);
                }
                if (object === "__proto__") {
                  throw new DecodeError_1.DecodeError("The key __proto__ is not allowed");
                }
                state.key = object;
                state.type = 2;
                continue DECODE;
              } else {
                state.map[state.key] = object;
                state.readCount++;
                if (state.readCount === state.size) {
                  stack.pop();
                  object = state.map;
                } else {
                  state.key = null;
                  state.type = 1;
                  continue DECODE;
                }
              }
            }
            return object;
          }
      }
      readHeadByte() {
        if (this.headByte === HEAD_BYTE_REQUIRED) {
          this.headByte = this.readU8();
        }
        return this.headByte;
      }
      complete() {
        this.headByte = HEAD_BYTE_REQUIRED;
      }
      readArraySize() {
        const headByte = this.readHeadByte();
        switch (headByte) {
          case 220:
            return this.readU16();
          case 221:
            return this.readU32();
          default: {
            if (headByte < 160) {
              return headByte - 144;
            } else {
              throw new DecodeError_1.DecodeError(`Unrecognized array type byte: ${(0, prettyByte_1.prettyByte)(headByte)}`);
            }
          }
        }
      }
      pushMapState(size) {
        if (size > this.maxMapLength) {
          throw new DecodeError_1.DecodeError(`Max length exceeded: map length (${size}) > maxMapLengthLength (${this.maxMapLength})`);
        }
        this.stack.push({
          type: 1,
          size,
          key: null,
          readCount: 0,
          map: {}
        });
      }
      pushArrayState(size) {
        if (size > this.maxArrayLength) {
          throw new DecodeError_1.DecodeError(`Max length exceeded: array length (${size}) > maxArrayLength (${this.maxArrayLength})`);
        }
        this.stack.push({
          type: 0,
          size,
          array: new Array(size),
          position: 0
        });
      }
      decodeUtf8String(byteLength, headerOffset) {
        var _a;
        if (byteLength > this.maxStrLength) {
          throw new DecodeError_1.DecodeError(`Max length exceeded: UTF-8 byte length (${byteLength}) > maxStrLength (${this.maxStrLength})`);
        }
        if (this.bytes.byteLength < this.pos + headerOffset + byteLength) {
          throw MORE_DATA;
        }
        const offset = this.pos + headerOffset;
        let object;
        if (this.stateIsMapKey() && ((_a = this.keyDecoder) === null || _a === void 0 ? void 0 : _a.canBeCached(byteLength))) {
          object = this.keyDecoder.decode(this.bytes, offset, byteLength);
        } else if (byteLength > utf8_1.TEXT_DECODER_THRESHOLD) {
          object = (0, utf8_1.utf8DecodeTD)(this.bytes, offset, byteLength);
        } else {
          object = (0, utf8_1.utf8DecodeJs)(this.bytes, offset, byteLength);
        }
        this.pos += headerOffset + byteLength;
        return object;
      }
      stateIsMapKey() {
        if (this.stack.length > 0) {
          const state = this.stack[this.stack.length - 1];
          return state.type === 1;
        }
        return false;
      }
      decodeBinary(byteLength, headOffset) {
        if (byteLength > this.maxBinLength) {
          throw new DecodeError_1.DecodeError(`Max length exceeded: bin length (${byteLength}) > maxBinLength (${this.maxBinLength})`);
        }
        if (!this.hasRemaining(byteLength + headOffset)) {
          throw MORE_DATA;
        }
        const offset = this.pos + headOffset;
        const object = this.bytes.subarray(offset, offset + byteLength);
        this.pos += headOffset + byteLength;
        return object;
      }
      decodeExtension(size, headOffset) {
        if (size > this.maxExtLength) {
          throw new DecodeError_1.DecodeError(`Max length exceeded: ext length (${size}) > maxExtLength (${this.maxExtLength})`);
        }
        const extType = this.view.getInt8(this.pos + headOffset);
        const data = this.decodeBinary(size, headOffset + 1);
        return this.extensionCodec.decode(data, extType, this.context);
      }
      lookU8() {
        return this.view.getUint8(this.pos);
      }
      lookU16() {
        return this.view.getUint16(this.pos);
      }
      lookU32() {
        return this.view.getUint32(this.pos);
      }
      readU8() {
        const value = this.view.getUint8(this.pos);
        this.pos++;
        return value;
      }
      readI8() {
        const value = this.view.getInt8(this.pos);
        this.pos++;
        return value;
      }
      readU16() {
        const value = this.view.getUint16(this.pos);
        this.pos += 2;
        return value;
      }
      readI16() {
        const value = this.view.getInt16(this.pos);
        this.pos += 2;
        return value;
      }
      readU32() {
        const value = this.view.getUint32(this.pos);
        this.pos += 4;
        return value;
      }
      readI32() {
        const value = this.view.getInt32(this.pos);
        this.pos += 4;
        return value;
      }
      readU64() {
        const value = (0, int_1.getUint64)(this.view, this.pos);
        this.pos += 8;
        return value;
      }
      readI64() {
        const value = (0, int_1.getInt64)(this.view, this.pos);
        this.pos += 8;
        return value;
      }
      readF32() {
        const value = this.view.getFloat32(this.pos);
        this.pos += 4;
        return value;
      }
      readF64() {
        const value = this.view.getFloat64(this.pos);
        this.pos += 8;
        return value;
      }
    };
    exports.Decoder = Decoder;
  }
});

// node_modules/@msgpack/msgpack/dist/decode.js
var require_decode = __commonJS({
  "node_modules/@msgpack/msgpack/dist/decode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeMulti = exports.decode = exports.defaultDecodeOptions = void 0;
    var Decoder_1 = require_Decoder();
    exports.defaultDecodeOptions = {};
    function decode2(buffer, options = exports.defaultDecodeOptions) {
      const decoder2 = new Decoder_1.Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
      return decoder2.decode(buffer);
    }
    exports.decode = decode2;
    function decodeMulti(buffer, options = exports.defaultDecodeOptions) {
      const decoder2 = new Decoder_1.Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
      return decoder2.decodeMulti(buffer);
    }
    exports.decodeMulti = decodeMulti;
  }
});

// node_modules/@msgpack/msgpack/dist/utils/stream.js
var require_stream = __commonJS({
  "node_modules/@msgpack/msgpack/dist/utils/stream.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ensureAsyncIterable = exports.asyncIterableFromStream = exports.isAsyncIterable = void 0;
    function isAsyncIterable(object) {
      return object[Symbol.asyncIterator] != null;
    }
    exports.isAsyncIterable = isAsyncIterable;
    function assertNonNull(value) {
      if (value == null) {
        throw new Error("Assertion Failure: value must not be null nor undefined");
      }
    }
    async function* asyncIterableFromStream(stream) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            return;
          }
          assertNonNull(value);
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    }
    exports.asyncIterableFromStream = asyncIterableFromStream;
    function ensureAsyncIterable(streamLike) {
      if (isAsyncIterable(streamLike)) {
        return streamLike;
      } else {
        return asyncIterableFromStream(streamLike);
      }
    }
    exports.ensureAsyncIterable = ensureAsyncIterable;
  }
});

// node_modules/@msgpack/msgpack/dist/decodeAsync.js
var require_decodeAsync = __commonJS({
  "node_modules/@msgpack/msgpack/dist/decodeAsync.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeStream = exports.decodeMultiStream = exports.decodeArrayStream = exports.decodeAsync = void 0;
    var Decoder_1 = require_Decoder();
    var stream_1 = require_stream();
    var decode_1 = require_decode();
    async function decodeAsync(streamLike, options = decode_1.defaultDecodeOptions) {
      const stream = (0, stream_1.ensureAsyncIterable)(streamLike);
      const decoder2 = new Decoder_1.Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
      return decoder2.decodeAsync(stream);
    }
    exports.decodeAsync = decodeAsync;
    function decodeArrayStream(streamLike, options = decode_1.defaultDecodeOptions) {
      const stream = (0, stream_1.ensureAsyncIterable)(streamLike);
      const decoder2 = new Decoder_1.Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
      return decoder2.decodeArrayStream(stream);
    }
    exports.decodeArrayStream = decodeArrayStream;
    function decodeMultiStream(streamLike, options = decode_1.defaultDecodeOptions) {
      const stream = (0, stream_1.ensureAsyncIterable)(streamLike);
      const decoder2 = new Decoder_1.Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
      return decoder2.decodeStream(stream);
    }
    exports.decodeMultiStream = decodeMultiStream;
    function decodeStream(streamLike, options = decode_1.defaultDecodeOptions) {
      return decodeMultiStream(streamLike, options);
    }
    exports.decodeStream = decodeStream;
  }
});

// node_modules/@msgpack/msgpack/dist/index.js
var require_dist = __commonJS({
  "node_modules/@msgpack/msgpack/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeTimestampExtension = exports.encodeTimestampExtension = exports.decodeTimestampToTimeSpec = exports.encodeTimeSpecToTimestamp = exports.encodeDateToTimeSpec = exports.EXT_TIMESTAMP = exports.ExtData = exports.ExtensionCodec = exports.Encoder = exports.DataViewIndexOutOfBoundsError = exports.DecodeError = exports.Decoder = exports.decodeStream = exports.decodeMultiStream = exports.decodeArrayStream = exports.decodeAsync = exports.decodeMulti = exports.decode = exports.encode = void 0;
    var encode_1 = require_encode();
    Object.defineProperty(exports, "encode", { enumerable: true, get: function() {
      return encode_1.encode;
    } });
    var decode_1 = require_decode();
    Object.defineProperty(exports, "decode", { enumerable: true, get: function() {
      return decode_1.decode;
    } });
    Object.defineProperty(exports, "decodeMulti", { enumerable: true, get: function() {
      return decode_1.decodeMulti;
    } });
    var decodeAsync_1 = require_decodeAsync();
    Object.defineProperty(exports, "decodeAsync", { enumerable: true, get: function() {
      return decodeAsync_1.decodeAsync;
    } });
    Object.defineProperty(exports, "decodeArrayStream", { enumerable: true, get: function() {
      return decodeAsync_1.decodeArrayStream;
    } });
    Object.defineProperty(exports, "decodeMultiStream", { enumerable: true, get: function() {
      return decodeAsync_1.decodeMultiStream;
    } });
    Object.defineProperty(exports, "decodeStream", { enumerable: true, get: function() {
      return decodeAsync_1.decodeStream;
    } });
    var Decoder_1 = require_Decoder();
    Object.defineProperty(exports, "Decoder", { enumerable: true, get: function() {
      return Decoder_1.Decoder;
    } });
    Object.defineProperty(exports, "DataViewIndexOutOfBoundsError", { enumerable: true, get: function() {
      return Decoder_1.DataViewIndexOutOfBoundsError;
    } });
    var DecodeError_1 = require_DecodeError();
    Object.defineProperty(exports, "DecodeError", { enumerable: true, get: function() {
      return DecodeError_1.DecodeError;
    } });
    var Encoder_1 = require_Encoder();
    Object.defineProperty(exports, "Encoder", { enumerable: true, get: function() {
      return Encoder_1.Encoder;
    } });
    var ExtensionCodec_1 = require_ExtensionCodec();
    Object.defineProperty(exports, "ExtensionCodec", { enumerable: true, get: function() {
      return ExtensionCodec_1.ExtensionCodec;
    } });
    var ExtData_1 = require_ExtData();
    Object.defineProperty(exports, "ExtData", { enumerable: true, get: function() {
      return ExtData_1.ExtData;
    } });
    var timestamp_1 = require_timestamp();
    Object.defineProperty(exports, "EXT_TIMESTAMP", { enumerable: true, get: function() {
      return timestamp_1.EXT_TIMESTAMP;
    } });
    Object.defineProperty(exports, "encodeDateToTimeSpec", { enumerable: true, get: function() {
      return timestamp_1.encodeDateToTimeSpec;
    } });
    Object.defineProperty(exports, "encodeTimeSpecToTimestamp", { enumerable: true, get: function() {
      return timestamp_1.encodeTimeSpecToTimestamp;
    } });
    Object.defineProperty(exports, "decodeTimestampToTimeSpec", { enumerable: true, get: function() {
      return timestamp_1.decodeTimestampToTimeSpec;
    } });
    Object.defineProperty(exports, "encodeTimestampExtension", { enumerable: true, get: function() {
      return timestamp_1.encodeTimestampExtension;
    } });
    Object.defineProperty(exports, "decodeTimestampExtension", { enumerable: true, get: function() {
      return timestamp_1.decodeTimestampExtension;
    } });
  }
});

// node_modules/@sidewinder/client/encoder/msgpack.js
var require_msgpack = __commonJS({
  "node_modules/@sidewinder/client/encoder/msgpack.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MsgPackEncoder = void 0;
    var msgpack = __importStar(require_dist());
    var MsgPackEncoder = class {
      encode(data) {
        return msgpack.encode(data);
      }
      decode(data) {
        return msgpack.decode(data);
      }
    };
    exports.MsgPackEncoder = MsgPackEncoder;
  }
});

// node_modules/@sidewinder/client/encoder/index.js
var require_encoder2 = __commonJS({
  "node_modules/@sidewinder/client/encoder/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_encoder(), exports);
    __exportStar(require_json(), exports);
    __exportStar(require_msgpack(), exports);
  }
});

// node_modules/@sidewinder/client/methods/protocol.js
var require_protocol = __commonJS({
  "node_modules/@sidewinder/client/methods/protocol.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RpcProtocol = exports.RpcRequestOrResponse = exports.RpcResponse = exports.RpcError = exports.RpcRequest = exports.RpcErrorCode = void 0;
    var contract_1 = require_contract();
    var RpcErrorCode;
    (function(RpcErrorCode2) {
      RpcErrorCode2[RpcErrorCode2["ParseError"] = -32700] = "ParseError";
      RpcErrorCode2[RpcErrorCode2["InvalidRequest"] = -32600] = "InvalidRequest";
      RpcErrorCode2[RpcErrorCode2["MethodNotFound"] = -32601] = "MethodNotFound";
      RpcErrorCode2[RpcErrorCode2["InvalidParams"] = -32602] = "InvalidParams";
      RpcErrorCode2[RpcErrorCode2["InternalError"] = -32603] = "InternalError";
      RpcErrorCode2[RpcErrorCode2["InternalServerError"] = -32001] = "InternalServerError";
    })(RpcErrorCode || (exports.RpcErrorCode = RpcErrorCode = {}));
    function Nullable(schema) {
      return contract_1.Type.Union([schema, contract_1.Type.Null()]);
    }
    exports.RpcRequest = contract_1.Type.Object({
      jsonrpc: contract_1.Type.Literal("2.0"),
      method: contract_1.Type.String(),
      params: contract_1.Type.Array(contract_1.Type.Unknown()),
      id: contract_1.Type.Optional(Nullable(contract_1.Type.String()))
    });
    exports.RpcError = contract_1.Type.Object({
      code: contract_1.Type.Integer(),
      message: contract_1.Type.String(),
      data: contract_1.Type.Optional(contract_1.Type.Unknown())
    });
    exports.RpcResponse = contract_1.Type.Object({
      jsonrpc: contract_1.Type.Literal("2.0"),
      result: contract_1.Type.Optional(contract_1.Type.Unknown()),
      error: contract_1.Type.Optional(exports.RpcError),
      id: contract_1.Type.String()
    });
    exports.RpcRequestOrResponse = contract_1.Type.Union([exports.RpcRequest, exports.RpcResponse]);
    var RpcProtocol;
    (function(RpcProtocol2) {
      function encodeRequest(id, method, params) {
        return { id, jsonrpc: "2.0", method, params };
      }
      RpcProtocol2.encodeRequest = encodeRequest;
      function encodeResult(id, result) {
        return { jsonrpc: "2.0", id, result };
      }
      RpcProtocol2.encodeResult = encodeResult;
      function encodeError(id, error) {
        return { jsonrpc: "2.0", id, error };
      }
      RpcProtocol2.encodeError = encodeError;
      function decodeAny2(request) {
        const object = request;
        return object["method"] ? { type: "request", data: object } : { type: "response", data: object };
      }
      RpcProtocol2.decodeAny = decodeAny2;
    })(RpcProtocol || (exports.RpcProtocol = RpcProtocol = {}));
  }
});

// node_modules/@sidewinder/client/methods/methods.js
var require_methods = __commonJS({
  "node_modules/@sidewinder/client/methods/methods.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClientMethods = void 0;
    var contract_1 = require_contract();
    var protocol_1 = require_protocol();
    var ClientMethods = class {
      constructor() {
        this.methods = /* @__PURE__ */ new Map();
      }
      register(method, schema, callback) {
        this.methods.set(method, { callback, schema });
      }
      async execute(method, params) {
        this.validateMethodExists(method);
        const entry = this.methods.get(method);
        this.validateMethodParameters(entry, method, params);
        const output = await entry.callback(...params);
        const result = output === void 0 ? null : output;
        this.validateMethodReturnType(entry, method, result);
        return result;
      }
      validateMethodExists(method) {
        if (!this.methods.has(method)) {
          throw new contract_1.Exception(`Method not found`, protocol_1.RpcErrorCode.MethodNotFound, {});
        }
      }
      validateMethodParameters(entry, method, params) {
      }
      validateMethodReturnType(entry, method, result) {
      }
    };
    exports.ClientMethods = ClientMethods;
  }
});

// node_modules/uuid/dist/esm-browser/rng.js
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== "undefined" && typeof msCrypto.getRandomValues === "function" && msCrypto.getRandomValues.bind(msCrypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
var getRandomValues, rnds8;
var init_rng = __esm({
  "node_modules/uuid/dist/esm-browser/rng.js"() {
    rnds8 = new Uint8Array(16);
  }
});

// node_modules/uuid/dist/esm-browser/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/uuid/dist/esm-browser/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// node_modules/uuid/dist/esm-browser/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/uuid/dist/esm-browser/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// node_modules/uuid/dist/esm-browser/stringify.js
function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, i, stringify_default;
var init_stringify = __esm({
  "node_modules/uuid/dist/esm-browser/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).substr(1));
    }
    stringify_default = stringify;
  }
});

// node_modules/uuid/dist/esm-browser/v1.js
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || new Array(16);
  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
  if (node == null || clockseq == null) {
    var seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  var msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  var nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  var tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  var tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || stringify_default(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "node_modules/uuid/dist/esm-browser/v1.js"() {
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    v1_default = v1;
  }
});

// node_modules/uuid/dist/esm-browser/parse.js
function parse2(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  var v;
  var arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "node_modules/uuid/dist/esm-browser/parse.js"() {
    init_validate();
    parse_default = parse2;
  }
});

// node_modules/uuid/dist/esm-browser/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  var bytes = [];
  for (var i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35_default(name, version2, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (namespace.length !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    var bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version2;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (var i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return stringify_default(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}
var DNS, URL2;
var init_v35 = __esm({
  "node_modules/uuid/dist/esm-browser/v35.js"() {
    init_stringify();
    init_parse();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// node_modules/uuid/dist/esm-browser/md5.js
function md5(bytes) {
  if (typeof bytes === "string") {
    var msg = unescape(encodeURIComponent(bytes));
    bytes = new Uint8Array(msg.length);
    for (var i = 0; i < msg.length; ++i) {
      bytes[i] = msg.charCodeAt(i);
    }
  }
  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
function md5ToHexEncodedArray(input) {
  var output = [];
  var length32 = input.length * 32;
  var hexTab = "0123456789abcdef";
  for (var i = 0; i < length32; i += 8) {
    var x = input[i >> 5] >>> i % 32 & 255;
    var hex = parseInt(hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(x & 15), 16);
    output.push(hex);
  }
  return output;
}
function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
function wordsToMd5(x, len) {
  x[len >> 5] |= 128 << len % 32;
  x[getOutputLength(len) - 1] = len;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;
  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}
function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }
  var length8 = input.length * 8;
  var output = new Uint32Array(getOutputLength(length8));
  for (var i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 255) << i % 32;
  }
  return output;
}
function safeAdd(x, y) {
  var lsw = (x & 65535) + (y & 65535);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
var md5_default;
var init_md5 = __esm({
  "node_modules/uuid/dist/esm-browser/md5.js"() {
    md5_default = md5;
  }
});

// node_modules/uuid/dist/esm-browser/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "node_modules/uuid/dist/esm-browser/v3.js"() {
    init_v35();
    init_md5();
    v3 = v35_default("v3", 48, md5_default);
    v3_default = v3;
  }
});

// node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify_default(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/uuid/dist/esm-browser/v4.js"() {
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/uuid/dist/esm-browser/sha1.js
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;
    case 1:
      return x ^ y ^ z;
    case 2:
      return x & y ^ x & z ^ y & z;
    case 3:
      return x ^ y ^ z;
  }
}
function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}
function sha1(bytes) {
  var K = [1518500249, 1859775393, 2400959708, 3395469782];
  var H = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  if (typeof bytes === "string") {
    var msg = unescape(encodeURIComponent(bytes));
    bytes = [];
    for (var i = 0; i < msg.length; ++i) {
      bytes.push(msg.charCodeAt(i));
    }
  } else if (!Array.isArray(bytes)) {
    bytes = Array.prototype.slice.call(bytes);
  }
  bytes.push(128);
  var l = bytes.length / 4 + 2;
  var N = Math.ceil(l / 16);
  var M = new Array(N);
  for (var _i = 0; _i < N; ++_i) {
    var arr = new Uint32Array(16);
    for (var j = 0; j < 16; ++j) {
      arr[j] = bytes[_i * 64 + j * 4] << 24 | bytes[_i * 64 + j * 4 + 1] << 16 | bytes[_i * 64 + j * 4 + 2] << 8 | bytes[_i * 64 + j * 4 + 3];
    }
    M[_i] = arr;
  }
  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
  for (var _i2 = 0; _i2 < N; ++_i2) {
    var W = new Uint32Array(80);
    for (var t = 0; t < 16; ++t) {
      W[t] = M[_i2][t];
    }
    for (var _t = 16; _t < 80; ++_t) {
      W[_t] = ROTL(W[_t - 3] ^ W[_t - 8] ^ W[_t - 14] ^ W[_t - 16], 1);
    }
    var a = H[0];
    var b = H[1];
    var c = H[2];
    var d = H[3];
    var e = H[4];
    for (var _t2 = 0; _t2 < 80; ++_t2) {
      var s = Math.floor(_t2 / 20);
      var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[_t2] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }
    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }
  return [H[0] >> 24 & 255, H[0] >> 16 & 255, H[0] >> 8 & 255, H[0] & 255, H[1] >> 24 & 255, H[1] >> 16 & 255, H[1] >> 8 & 255, H[1] & 255, H[2] >> 24 & 255, H[2] >> 16 & 255, H[2] >> 8 & 255, H[2] & 255, H[3] >> 24 & 255, H[3] >> 16 & 255, H[3] >> 8 & 255, H[3] & 255, H[4] >> 24 & 255, H[4] >> 16 & 255, H[4] >> 8 & 255, H[4] & 255];
}
var sha1_default;
var init_sha1 = __esm({
  "node_modules/uuid/dist/esm-browser/sha1.js"() {
    sha1_default = sha1;
  }
});

// node_modules/uuid/dist/esm-browser/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "node_modules/uuid/dist/esm-browser/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35_default("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// node_modules/uuid/dist/esm-browser/nil.js
var nil_default;
var init_nil = __esm({
  "node_modules/uuid/dist/esm-browser/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// node_modules/uuid/dist/esm-browser/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.substr(14, 1), 16);
}
var version_default;
var init_version = __esm({
  "node_modules/uuid/dist/esm-browser/version.js"() {
    init_validate();
    version_default = version;
  }
});

// node_modules/uuid/dist/esm-browser/index.js
var esm_browser_exports = {};
__export(esm_browser_exports, {
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_browser = __esm({
  "node_modules/uuid/dist/esm-browser/index.js"() {
    init_v1();
    init_v3();
    init_v4();
    init_v5();
    init_nil();
    init_version();
    init_validate();
    init_stringify();
    init_parse();
  }
});

// node_modules/@sidewinder/client/methods/responder.js
var require_responder = __commonJS({
  "node_modules/@sidewinder/client/methods/responder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Responder = void 0;
    var uuid_1 = (init_esm_browser(), __toCommonJS(esm_browser_exports));
    var Responder = class {
      constructor() {
        this.entries = /* @__PURE__ */ new Map();
      }
      register(context) {
        let resolve2;
        let reject;
        const promise = new Promise((_resolve, _reject) => {
          resolve2 = _resolve;
          reject = _reject;
        });
        const handle = (0, uuid_1.v4)();
        this.entries.set(handle, { context, promise, resolve: resolve2, reject });
        return handle;
      }
      async wait(handle) {
        if (!this.entries.has(handle))
          throw Error("Response");
        const entry = this.entries.get(handle);
        try {
          const result = await entry.promise;
          this.entries.delete(handle);
          return result;
        } catch (error) {
          this.entries.delete(handle);
          throw error;
        }
      }
      resolve(handle, result) {
        if (!this.entries.has(handle))
          return;
        const deferred = this.entries.get(handle);
        deferred.resolve(result);
      }
      reject(handle, error) {
        if (!this.entries.has(handle))
          return;
        const deferred = this.entries.get(handle);
        deferred.reject(error);
      }
      rejectFor(context, error) {
        for (const deferred of this.entries.values()) {
          if (deferred.context === context) {
            deferred.reject(error);
          }
        }
      }
    };
    exports.Responder = Responder;
  }
});

// node_modules/@sidewinder/client/methods/index.js
var require_methods2 = __commonJS({
  "node_modules/@sidewinder/client/methods/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_methods(), exports);
    __exportStar(require_protocol(), exports);
    __exportStar(require_responder(), exports);
  }
});

// node_modules/@sidewinder/client/proxy.js
var require_proxy = __commonJS({
  "node_modules/@sidewinder/client/proxy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebProxy = void 0;
    function WebProxy(client) {
      return new Proxy(client, {
        get: (target, method) => (...params) => target.call(method, ...params)
      });
    }
    exports.WebProxy = WebProxy;
  }
});

// node_modules/@sidewinder/platform/platform.js
var require_platform = __commonJS({
  "node_modules/@sidewinder/platform/platform.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Platform = void 0;
    var Platform;
    (function(Platform2) {
      function dynamicRequire(name) {
        return new Function("require", "name", "return require(name)")(__require, name);
      }
      Platform2.dynamicRequire = dynamicRequire;
      function dynamicImport(name) {
        return new Function("name", "return import(name)")(name);
      }
      Platform2.dynamicImport = dynamicImport;
      function platform() {
        return typeof window === "undefined" ? "node" : "browser";
      }
      Platform2.platform = platform;
      let _version;
      function version2() {
        if (_version)
          return _version;
        if (platform() === "node") {
          const [_major, _minor, revision] = process.version.split(".");
          const major = parseInt(_major.replace("v", ""));
          const minor = parseInt(_minor.replace("v", ""));
          _version = { major, minor, revision };
          return _version;
        } else {
          _version = { major: 0, minor: 0, revision: "" };
          return _version;
        }
      }
      Platform2.version = version2;
    })(Platform || (exports.Platform = Platform = {}));
  }
});

// node_modules/@sidewinder/platform/index.js
var require_platform2 = __commonJS({
  "node_modules/@sidewinder/platform/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_platform(), exports);
  }
});

// node_modules/@sidewinder/web/fetch/fetch.js
var require_fetch = __commonJS({
  "node_modules/@sidewinder/web/fetch/fetch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fetch = void 0;
    var platform_1 = require_platform2();
    async function fetch3(input, init) {
      if (platform_1.Platform.platform() === "browser") {
        return globalThis.fetch(input, init);
      } else {
        const fetch4 = await platform_1.Platform.dynamicImport("node-fetch");
        return fetch4.default(input, init);
      }
    }
    exports.fetch = fetch3;
  }
});

// node_modules/@sidewinder/web/fetch/index.js
var require_fetch2 = __commonJS({
  "node_modules/@sidewinder/web/fetch/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_fetch(), exports);
  }
});

// node_modules/@sidewinder/events/events.js
var require_events = __commonJS({
  "node_modules/@sidewinder/events/events.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Events = exports.Event = exports.EventListener = void 0;
    var EventListener2 = class {
      constructor(callback) {
        this.callback = callback;
      }
      dispose() {
        this.callback();
      }
    };
    exports.EventListener = EventListener2;
    var Event2 = class {
      constructor() {
        this.subscriptions = /* @__PURE__ */ new Set();
      }
      on(handler) {
        const subscription = [false, handler];
        this.subscriptions.add(subscription);
        return new EventListener2(() => this.subscriptions.delete(subscription));
      }
      once(handler) {
        const subscription = [true, handler];
        this.subscriptions.add(subscription);
        return new EventListener2(() => this.subscriptions.delete(subscription));
      }
      send(value) {
        for (const subscriber of this.subscriptions) {
          const [once, handler] = subscriber;
          if (once)
            this.subscriptions.delete(subscriber);
          handler(value);
        }
      }
      dispose() {
        this.subscriptions.clear();
      }
    };
    exports.Event = Event2;
    var Events2 = class {
      constructor() {
        this.events = /* @__PURE__ */ new Map();
      }
      on(name, handler) {
        if (!this.events.has(name))
          this.events.set(name, new Event2());
        const event = this.events.get(name);
        return event.on(handler);
      }
      once(name, handler) {
        if (!this.events.has(name))
          this.events.set(name, new Event2());
        const event = this.events.get(name);
        return event.once(handler);
      }
      send(name, value) {
        if (!this.events.has(name))
          return;
        const event = this.events.get(name);
        event.send(value);
      }
      dispose() {
        for (const [key, event] of this.events) {
          this.events.delete(key);
          event.dispose();
        }
      }
    };
    exports.Events = Events2;
  }
});

// node_modules/@sidewinder/events/index.js
var require_events2 = __commonJS({
  "node_modules/@sidewinder/events/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_events(), exports);
  }
});

// node_modules/@sidewinder/async/barrier.js
var require_barrier = __commonJS({
  "node_modules/@sidewinder/async/barrier.js"(exports) {
    "use strict";
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f2) {
      if (kind === "a" && !f2)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
    };
    var _Barrier_instances;
    var _Barrier_dispatch;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Barrier = void 0;
    var Barrier2 = class {
      constructor(paused = true) {
        _Barrier_instances.add(this);
        this.resolvers = [];
        this.paused = true;
        this.paused = paused;
      }
      pause() {
        this.paused = true;
      }
      resume() {
        this.paused = false;
        __classPrivateFieldGet(this, _Barrier_instances, "m", _Barrier_dispatch).call(this);
      }
      wait() {
        return this.paused ? new Promise((resolve2) => this.resolvers.push(resolve2)) : Promise.resolve(void 0);
      }
    };
    exports.Barrier = Barrier2;
    _Barrier_instances = /* @__PURE__ */ new WeakSet(), _Barrier_dispatch = async function _Barrier_dispatch2() {
      while (!this.paused && this.resolvers.length > 0) {
        const resolve2 = this.resolvers.shift();
        resolve2();
      }
    };
  }
});

// node_modules/@sidewinder/async/debounce.js
var require_debounce = __commonJS({
  "node_modules/@sidewinder/async/debounce.js"(exports) {
    "use strict";
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f2) {
      if (kind === "a" && !f2)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
    };
    var _Debounce_instances;
    var _Debounce_runDeferred;
    var _Debounce_runDefault;
    var _Debounce_execute;
    var _Debounce_delay;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Debounce = void 0;
    var Debounce = class {
      constructor(millisecond, deferred = false) {
        _Debounce_instances.add(this);
        this.millisecond = millisecond;
        this.deferred = deferred;
        this.callback = null;
        this.waiting = false;
      }
      run(callback, errorCallback = () => {
      }) {
        if (this.deferred) {
          __classPrivateFieldGet(this, _Debounce_instances, "m", _Debounce_runDeferred).call(this, callback, errorCallback);
        } else {
          __classPrivateFieldGet(this, _Debounce_instances, "m", _Debounce_runDefault).call(this, callback, errorCallback);
        }
      }
    };
    exports.Debounce = Debounce;
    _Debounce_instances = /* @__PURE__ */ new WeakSet(), _Debounce_runDeferred = async function _Debounce_runDeferred2(callback, errorCallback) {
      if (this.waiting) {
        this.callback = callback;
        return;
      }
      this.waiting = true;
      __classPrivateFieldGet(this, _Debounce_instances, "m", _Debounce_execute).call(this, callback).catch(errorCallback);
      await __classPrivateFieldGet(this, _Debounce_instances, "m", _Debounce_delay).call(this);
      while (this.callback !== null) {
        __classPrivateFieldGet(this, _Debounce_instances, "m", _Debounce_execute).call(this, this.callback).catch(errorCallback);
        this.callback = null;
        await __classPrivateFieldGet(this, _Debounce_instances, "m", _Debounce_delay).call(this);
      }
      this.waiting = false;
    }, _Debounce_runDefault = async function _Debounce_runDefault2(callback, errorCallback) {
      if (this.waiting)
        return;
      this.waiting = true;
      __classPrivateFieldGet(this, _Debounce_instances, "m", _Debounce_execute).call(this, callback).catch(errorCallback);
      await __classPrivateFieldGet(this, _Debounce_instances, "m", _Debounce_delay).call(this);
      this.waiting = false;
    }, _Debounce_execute = async function _Debounce_execute2(callback) {
      await callback();
    }, _Debounce_delay = function _Debounce_delay2() {
      return new Promise((resolve2) => setTimeout(resolve2, this.millisecond));
    };
  }
});

// node_modules/@sidewinder/async/deferred.js
var require_deferred = __commonJS({
  "node_modules/@sidewinder/async/deferred.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Deferred = void 0;
    var Deferred2 = class {
      constructor() {
        this.awaiter = new Promise((resolve2, reject) => {
          this.resolveFunction = resolve2;
          this.rejectFunction = reject;
        });
      }
      promise() {
        return this.awaiter;
      }
      resolve(value) {
        this.resolveFunction(value);
      }
      reject(error) {
        this.rejectFunction(error);
      }
    };
    exports.Deferred = Deferred2;
  }
});

// node_modules/@sidewinder/async/delay.js
var require_delay = __commonJS({
  "node_modules/@sidewinder/async/delay.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Delay = void 0;
    var Delay;
    (function(Delay2) {
      function wait(millisecond) {
        return new Promise((resolve2) => setTimeout(resolve2, millisecond));
      }
      Delay2.wait = wait;
    })(Delay || (exports.Delay = Delay = {}));
  }
});

// node_modules/@sidewinder/async/lock.js
var require_lock = __commonJS({
  "node_modules/@sidewinder/async/lock.js"(exports) {
    "use strict";
    var __classPrivateFieldSet = exports && exports.__classPrivateFieldSet || function(receiver, state, value, kind, f2) {
      if (kind === "m")
        throw new TypeError("Private method is not writable");
      if (kind === "a" && !f2)
        throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f2.call(receiver, value) : f2 ? f2.value = value : state.set(receiver, value), value;
    };
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f2) {
      if (kind === "a" && !f2)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
    };
    var _Lock_disposeCallback;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Lock = void 0;
    var Lock2 = class {
      constructor(disposeCallback) {
        _Lock_disposeCallback.set(this, void 0);
        __classPrivateFieldSet(this, _Lock_disposeCallback, disposeCallback, "f");
      }
      dispose() {
        __classPrivateFieldGet(this, _Lock_disposeCallback, "f").call(this);
      }
    };
    exports.Lock = Lock2;
    _Lock_disposeCallback = /* @__PURE__ */ new WeakMap();
  }
});

// node_modules/@sidewinder/async/mutex.js
var require_mutex = __commonJS({
  "node_modules/@sidewinder/async/mutex.js"(exports) {
    "use strict";
    var __classPrivateFieldSet = exports && exports.__classPrivateFieldSet || function(receiver, state, value, kind, f2) {
      if (kind === "m")
        throw new TypeError("Private method is not writable");
      if (kind === "a" && !f2)
        throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f2.call(receiver, value) : f2 ? f2.value = value : state.set(receiver, value), value;
    };
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f2) {
      if (kind === "a" && !f2)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
    };
    var _Mutex_instances;
    var _Mutex_queue;
    var _Mutex_running;
    var _Mutex_condition;
    var _Mutex_dispatch;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Mutex = void 0;
    var lock_1 = require_lock();
    var deferred_1 = require_deferred();
    var Mutex2 = class {
      constructor() {
        _Mutex_instances.add(this);
        _Mutex_queue.set(this, void 0);
        _Mutex_running.set(this, void 0);
        __classPrivateFieldSet(this, _Mutex_running, false, "f");
        __classPrivateFieldSet(this, _Mutex_queue, [], "f");
      }
      async lock() {
        const deferred = new deferred_1.Deferred();
        __classPrivateFieldGet(this, _Mutex_queue, "f").push(deferred);
        __classPrivateFieldGet(this, _Mutex_instances, "m", _Mutex_dispatch).call(this);
        return deferred.promise();
      }
    };
    exports.Mutex = Mutex2;
    _Mutex_queue = /* @__PURE__ */ new WeakMap(), _Mutex_running = /* @__PURE__ */ new WeakMap(), _Mutex_instances = /* @__PURE__ */ new WeakSet(), _Mutex_condition = function _Mutex_condition2() {
      return __classPrivateFieldGet(this, _Mutex_running, "f") === false && __classPrivateFieldGet(this, _Mutex_queue, "f").length > 0;
    }, _Mutex_dispatch = function _Mutex_dispatch2() {
      if (!__classPrivateFieldGet(this, _Mutex_instances, "m", _Mutex_condition).call(this))
        return;
      __classPrivateFieldSet(this, _Mutex_running, true, "f");
      const next = __classPrivateFieldGet(this, _Mutex_queue, "f").shift();
      const lock = new lock_1.Lock(() => {
        __classPrivateFieldSet(this, _Mutex_running, false, "f");
        __classPrivateFieldGet(this, _Mutex_instances, "m", _Mutex_dispatch2).call(this);
      });
      next.resolve(lock);
    };
  }
});

// node_modules/@sidewinder/async/retry.js
var require_retry = __commonJS({
  "node_modules/@sidewinder/async/retry.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Retry = exports.RetryError = void 0;
    var delay_1 = require_delay();
    var RetryError = class extends Error {
      constructor(message) {
        super(message);
      }
    };
    exports.RetryError = RetryError;
    var Retry;
    (function(Retry2) {
      function defaults(options) {
        options.attempts = options.attempts === void 0 ? Infinity : options.attempts;
        options.delay = options.delay === void 0 ? 1e3 : options.delay;
        options.multiplier = options.multiplier === void 0 ? 1 : options.multiplier;
        options.maximumDelay = options.maximumDelay === void 0 ? Infinity : options.maximumDelay;
        options.minimumDelay = options.minimumDelay === void 0 ? 0 : options.minimumDelay;
        return options;
      }
      function assert(options) {
        if (options.delay < 0)
          throw new RetryError("Minimum delay is 0");
        if (options.attempts < 1)
          throw new RetryError(`Minimum retry attempts must be greater than 1`);
        if (options.multiplier < 0)
          throw new RetryError("Multiplier must be a non-negative number");
        if (options.maximumDelay < 0)
          throw new RetryError("MaximumDelay must be a non-negative number");
        if (options.minimumDelay < 0)
          throw new RetryError("MinimumDelay must be a non-negative number");
        if (options.maximumDelay < options.minimumDelay)
          throw new RetryError("MinimumDelay must be less than MaximumDelay");
        return options;
      }
      async function run(callback, options = {}) {
        const resolved = assert(defaults(options));
        let [delay2, exception] = [options.delay, null];
        for (let attempt = 0; attempt < resolved.attempts; attempt++) {
          try {
            return await callback(attempt);
          } catch (error) {
            exception = error;
            await delay_1.Delay.wait(delay2);
            delay2 = delay2 * resolved.multiplier;
            delay2 = delay2 > resolved.maximumDelay ? resolved.maximumDelay : delay2;
            delay2 = delay2 < resolved.minimumDelay ? resolved.minimumDelay : delay2;
          }
        }
        throw exception;
      }
      Retry2.run = run;
    })(Retry || (exports.Retry = Retry = {}));
  }
});

// node_modules/@sidewinder/async/semaphore.js
var require_semaphore = __commonJS({
  "node_modules/@sidewinder/async/semaphore.js"(exports) {
    "use strict";
    var __classPrivateFieldGet = exports && exports.__classPrivateFieldGet || function(receiver, state, kind, f2) {
      if (kind === "a" && !f2)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f2 : kind === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
    };
    var _Semaphore_instances;
    var _Semaphore_increment;
    var _Semaphore_decrement;
    var _Semaphore_resume;
    var _Semaphore_dispatch;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Semaphore = void 0;
    var Semaphore = class {
      constructor(concurrency = 1, delay2 = 0) {
        _Semaphore_instances.add(this);
        this.concurrency = concurrency;
        this.delay = delay2;
        this.awaiters = [];
        this.running = 0;
      }
      run(executor) {
        return new Promise((resolve2, reject) => {
          this.awaiters.push({ executor, resolve: resolve2, reject });
          __classPrivateFieldGet(this, _Semaphore_instances, "m", _Semaphore_dispatch).call(this);
        });
      }
    };
    exports.Semaphore = Semaphore;
    _Semaphore_instances = /* @__PURE__ */ new WeakSet(), _Semaphore_increment = function _Semaphore_increment2() {
      this.running += 1;
    }, _Semaphore_decrement = function _Semaphore_decrement2() {
      this.running -= 1;
    }, _Semaphore_resume = function _Semaphore_resume2() {
      setTimeout(() => {
        __classPrivateFieldGet(this, _Semaphore_instances, "m", _Semaphore_decrement).call(this);
        __classPrivateFieldGet(this, _Semaphore_instances, "m", _Semaphore_dispatch).call(this);
      }, this.delay);
    }, _Semaphore_dispatch = async function _Semaphore_dispatch2() {
      if (this.awaiters.length === 0 || this.running >= this.concurrency) {
        return;
      }
      const awaiter = this.awaiters.shift();
      __classPrivateFieldGet(this, _Semaphore_instances, "m", _Semaphore_increment).call(this);
      try {
        awaiter.resolve(await awaiter.executor());
      } catch (error) {
        awaiter.reject(error);
      }
      __classPrivateFieldGet(this, _Semaphore_instances, "m", _Semaphore_resume).call(this);
    };
  }
});

// node_modules/@sidewinder/async/timeout.js
var require_timeout = __commonJS({
  "node_modules/@sidewinder/async/timeout.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Timeout = void 0;
    var Timeout;
    (function(Timeout2) {
      function timeout(error, milliseconds) {
        return new Promise((_, reject) => setTimeout(() => reject(error), milliseconds));
      }
      async function run(callback, milliseconds, error = new Error("Timeout")) {
        const action = Promise.resolve(callback());
        const failed = timeout(error, milliseconds);
        return await Promise.race([action, failed]);
      }
      Timeout2.run = run;
    })(Timeout || (exports.Timeout = Timeout = {}));
  }
});

// node_modules/@sidewinder/async/index.js
var require_async = __commonJS({
  "node_modules/@sidewinder/async/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_barrier(), exports);
    __exportStar(require_debounce(), exports);
    __exportStar(require_deferred(), exports);
    __exportStar(require_delay(), exports);
    __exportStar(require_lock(), exports);
    __exportStar(require_mutex(), exports);
    __exportStar(require_retry(), exports);
    __exportStar(require_semaphore(), exports);
    __exportStar(require_timeout(), exports);
  }
});

// node_modules/@sidewinder/web/websocket/socket.js
var require_socket = __commonJS({
  "node_modules/@sidewinder/web/websocket/socket.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebSocket = void 0;
    var platform_1 = require_platform2();
    var events_1 = require_events2();
    var WebSocket = class {
      constructor(endpoint, options = {
        binaryType: "blob"
      }) {
        this.endpoint = endpoint;
        this.options = options;
        this.events = new events_1.Events();
        if (platform_1.Platform.platform() === "browser") {
          this.socket = new globalThis.WebSocket(this.endpoint);
          this.socket.binaryType = this.options.binaryType;
          this.socket.addEventListener("open", () => this.onOpen());
          this.socket.addEventListener("message", (event) => this.onMessage(event));
          this.socket.addEventListener("error", (event) => this.onError(event));
          this.socket.addEventListener("close", (event) => this.onClose(event));
        } else {
          const Imported = platform_1.Platform.dynamicRequire("ws");
          const WebSocket2 = Imported.WebSocket === void 0 ? Imported : Imported.WebSocket;
          this.socket = new WebSocket2(this.endpoint);
          this.socket.binaryType = this.options.binaryType;
          this.socket.addEventListener("open", () => this.onOpen());
          this.socket.addEventListener("message", (event) => this.onMessage(event));
          this.socket.addEventListener("error", (event) => this.onError(event));
          this.socket.addEventListener("close", (event) => this.onClose(event));
          this.socket.on("ping", () => this.onPing());
          this.socket.on("pong", () => this.onPong());
        }
      }
      get binaryType() {
        return this.socket.binaryType;
      }
      set binaryType(value) {
        this.socket.binaryType = value;
      }
      on(event, func) {
        return this.events.on(event, func);
      }
      once(event, func) {
        return this.events.once(event, func);
      }
      ping(data, mask) {
        if (platform_1.Platform.platform() === "browser")
          return;
        const socket = this.socket;
        socket.ping(data, mask);
      }
      pong(data, mask) {
        if (platform_1.Platform.platform() === "browser")
          return;
        const socket = this.socket;
        socket.pong(data, mask);
      }
      send(data) {
        this.socket.send(data);
      }
      close(code, reason) {
        this.socket.close(code, reason);
      }
      onOpen() {
        this.events.send("open", void 0);
      }
      onMessage(event) {
        this.events.send("message", event);
      }
      onError(event) {
        this.events.send("error", event);
      }
      onPing() {
        this.events.send("ping", void 0);
      }
      onPong() {
        this.events.send("pong", void 0);
      }
      onClose(event) {
        this.events.send("close", event);
      }
    };
    exports.WebSocket = WebSocket;
  }
});

// node_modules/@sidewinder/web/websocket/retry.js
var require_retry2 = __commonJS({
  "node_modules/@sidewinder/web/websocket/retry.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RetryWebSocket = void 0;
    var events_1 = require_events2();
    var async_1 = require_async();
    var socket_1 = require_socket();
    var RetryWebSocket = class {
      constructor(endpoint, options = {
        binaryType: "blob",
        autoReconnectTimeout: 2e3,
        autoReconnectBuffer: false
      }) {
        this.endpoint = endpoint;
        this.options = options;
        this.barrier = new async_1.Barrier();
        this.events = new events_1.Events();
        this.explicitClosed = false;
        this.socket = null;
        this.establish();
      }
      on(event, func) {
        return this.events.on(event, func);
      }
      once(event, func) {
        return this.events.once(event, func);
      }
      async send(data) {
        if (this.explicitClosed) {
          throw new Error("Socket has been closed");
        }
        if (this.socket === null && this.options.autoReconnectBuffer === false) {
          throw Error("Socket is not currently connected. Consider setting autoReconnectBuffer to true to buffer messages while disconnected.");
        }
        await this.barrier.wait();
        this.socket.send(data);
      }
      async close(code, reason) {
        this.explicitClosed = true;
        if (this.socket)
          this.socket.close(code, reason);
        this.events.send("close", void 0);
      }
      async establish() {
        while (true) {
          if (this.explicitClosed)
            return;
          if (this.socket !== null) {
            await async_1.Delay.wait(this.options.autoReconnectTimeout);
            continue;
          }
          try {
            this.socket = await this.connect();
            this.events.send("open", void 0);
            this.socket.on("message", (event) => {
              this.events.send("message", event);
            });
            this.socket.on("error", (event) => {
              this.events.send("error", event);
            });
            this.socket.on("close", (event) => {
              this.events.send("close", event);
              this.barrier.pause();
              this.socket = null;
            });
            this.barrier.resume();
          } catch (error) {
            this.events.send("error", error);
            await async_1.Delay.wait(this.options.autoReconnectTimeout);
          }
        }
      }
      async connect() {
        return new Promise((resolve2, reject) => {
          const socket = new socket_1.WebSocket(this.endpoint);
          socket.binaryType = this.options.binaryType;
          socket.once("open", () => resolve2(socket));
          socket.once("error", () => {
          });
          socket.once("close", () => reject(new Error("Socket unexpectedly closed")));
        });
      }
    };
    exports.RetryWebSocket = RetryWebSocket;
  }
});

// node_modules/@sidewinder/web/websocket/index.js
var require_websocket = __commonJS({
  "node_modules/@sidewinder/web/websocket/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_retry2(), exports);
    __exportStar(require_socket(), exports);
  }
});

// node_modules/@sidewinder/web/index.js
var require_web = __commonJS({
  "node_modules/@sidewinder/web/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_fetch2(), exports);
    __exportStar(require_websocket(), exports);
  }
});

// node_modules/@sidewinder/client/request/request.js
var require_request = __commonJS({
  "node_modules/@sidewinder/client/request/request.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Request = void 0;
    var web_1 = require_web();
    var Request3;
    (function(Request4) {
      function createRequiredHeader(contract, body) {
        const contentType = contract.format === "json" ? "application/json" : "application/x-msgpack";
        return { "Content-Type": contentType, "Content-Length": body.length.toString() };
      }
      function assertResponseType(contract, endpoint, contentType) {
        const expectedContentType = contract.format === "json" ? "application/json" : "application/x-msgpack";
        if (contentType !== expectedContentType) {
          throw Error(`Endpoint '${endpoint}' responded with an invalid Content-Type header. Expected '${expectedContentType}' but received '${contentType}'`);
        }
      }
      async function call(contract, endpoint, additionalHeaders, body) {
        const requiredHeaders = createRequiredHeader(contract, body);
        const headers = { ...additionalHeaders, ...requiredHeaders };
        const response = await (0, web_1.fetch)(endpoint, { method: "POST", body, headers });
        assertResponseType(contract, endpoint, response.headers.get("Content-Type"));
        const arraybuffer = await response.arrayBuffer();
        return new Uint8Array(arraybuffer);
      }
      Request4.call = call;
    })(Request3 || (exports.Request = Request3 = {}));
  }
});

// node_modules/@sidewinder/client/request/index.js
var require_request2 = __commonJS({
  "node_modules/@sidewinder/client/request/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_request(), exports);
  }
});

// node_modules/@sidewinder/client/web.js
var require_web2 = __commonJS({
  "node_modules/@sidewinder/client/web.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebClient = void 0;
    var contract_1 = require_contract();
    var index_1 = require_methods2();
    var index_2 = require_encoder2();
    var index_3 = require_request2();
    var WebClient = class {
      constructor(contract, endpoint, additionalHeaders = {}) {
        this.contract = contract;
        this.endpoint = endpoint;
        this.additionalHeaders = additionalHeaders;
        this.encoder = contract.format === "json" ? new index_2.JsonEncoder() : new index_2.MsgPackEncoder();
      }
      async call(method, ...params) {
        this.assertMethodExists(method);
        const request = index_1.RpcProtocol.encodeRequest("unknown", method, params);
        const encoded = this.encoder.encode(request);
        const decoded = this.encoder.decode(await index_3.Request.call(this.contract, this.endpoint, this.additionalHeaders, encoded));
        const message = index_1.RpcProtocol.decodeAny(decoded);
        if (message === void 0)
          throw Error("Unable to decode response");
        if (message.type !== "response")
          throw Error("Server responded with an invalid protocol response");
        const response = message.data;
        if (response.result !== void 0) {
          return response.result;
        } else if (response.error) {
          const { message: message2, code, data } = response.error;
          throw new contract_1.Exception(message2, code, data);
        }
        throw Error("Unreachable");
      }
      send(method, ...params) {
        this.assertMethodExists(method);
        const request = index_1.RpcProtocol.encodeRequest("unknown", method, params);
        const encoded = this.encoder.encode(request);
        index_3.Request.call(this.contract, this.endpoint, this.additionalHeaders, encoded).catch(() => {
        });
      }
      assertMethodExists(method) {
        if (!Object.keys(this.contract.server).includes(method))
          throw new Error(`Method '${method}' not defined in contract`);
      }
    };
    exports.WebClient = WebClient;
  }
});

// node_modules/@sidewinder/client/websocket.js
var require_websocket2 = __commonJS({
  "node_modules/@sidewinder/client/websocket.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebSocketClient = void 0;
    var web_1 = require_web();
    var contract_1 = require_contract();
    var index_1 = require_methods2();
    var index_2 = require_encoder2();
    var async_1 = require_async();
    function defaultClientOptions(partial) {
      const options = { autoReconnectEnabled: false, autoReconnectBuffer: false, autoReconnectTimeout: 4e3 };
      if (partial.autoReconnectEnabled !== void 0)
        options.autoReconnectEnabled = partial.autoReconnectEnabled;
      if (partial.autoReconnectBuffer !== void 0)
        options.autoReconnectBuffer = partial.autoReconnectBuffer;
      if (partial.autoReconnectTimeout !== void 0)
        options.autoReconnectTimeout = partial.autoReconnectTimeout;
      return options;
    }
    function into(callback) {
      callback();
    }
    var WebSocketClient2 = class {
      constructor(contract, endpoint, options = {}) {
        this.contract = contract;
        this.endpoint = endpoint;
        this.onConnectCallback = () => {
        };
        this.onErrorCallback = () => {
        };
        this.onCloseCallback = () => {
        };
        this.options = defaultClientOptions(options);
        this.onConnectCallback = () => {
        };
        this.onErrorCallback = () => {
        };
        this.onCloseCallback = () => {
        };
        this.encoder = this.contract.format === "json" ? new index_2.JsonEncoder() : new index_2.MsgPackEncoder();
        this.methods = new index_1.ClientMethods();
        this.barrier = new async_1.Barrier();
        this.responder = new index_1.Responder();
        this.socket = this.options.autoReconnectEnabled ? new web_1.RetryWebSocket(this.endpoint, {
          binaryType: "arraybuffer",
          autoReconnectBuffer: this.options.autoReconnectBuffer,
          autoReconnectTimeout: this.options.autoReconnectTimeout
        }) : new web_1.WebSocket(this.endpoint, {
          binaryType: "arraybuffer"
        });
        this.socket.on("open", () => this.onOpen());
        this.socket.on("message", (event) => this.onMessage(event));
        this.socket.on("error", (event) => this.onError(event));
        this.socket.on("close", (event) => this.onClose(event));
        this.closed = false;
        this.setupNotImplemented();
      }
      event(event, callback) {
        switch (event) {
          case "connect": {
            this.onConnectCallback = callback;
            break;
          }
          case "error": {
            this.onErrorCallback = callback;
            break;
          }
          case "close": {
            this.onCloseCallback = callback;
            break;
          }
          default:
            throw Error(`Unknown event '${event}'`);
        }
        return callback;
      }
      method(method, callback) {
        const target = this.contract.client[method];
        if (target === void 0)
          throw Error(`Cannot define method '${method}' as it does not exist in contract`);
        this.methods.register(method, target, callback);
        return async (...params) => await this.methods.execute(method, params);
      }
      async call(method, ...params) {
        await this.barrier.wait();
        this.assertMethodExists(method);
        this.assertCanSend();
        const handle = this.responder.register("client");
        const request = index_1.RpcProtocol.encodeRequest(handle, method, params);
        const message = this.encoder.encode(request);
        this.socketSendInternal(message).catch((error) => this.responder.reject(handle, error));
        return await this.responder.wait(handle);
      }
      send(method, ...params) {
        this.assertMethodExists(method);
        into(async () => {
          try {
            await this.barrier.wait();
            this.assertCanSend();
            const request = index_1.RpcProtocol.encodeRequest(void 0, method, params);
            const message = this.encoder.encode(request);
            await this.socketSendInternal(message);
          } catch (error) {
            this.onErrorCallback(error);
          }
        });
      }
      close(code, reason) {
        this.socket.close(code, reason);
      }
      async sendResponseWithResult(rpcRequest, result) {
        if (rpcRequest.id === void 0 || rpcRequest.id === null)
          return;
        const response = index_1.RpcProtocol.encodeResult(rpcRequest.id, result);
        const buffer = this.encoder.encode(response);
        await this.socketSendInternal(buffer);
      }
      async sendResponseWithError(rpcRequest, error) {
        if (rpcRequest.id === void 0 || rpcRequest.id === null)
          return;
        if (error instanceof contract_1.Exception) {
          const response = index_1.RpcProtocol.encodeError(rpcRequest.id, { code: error.code, message: error.message, data: error.data });
          const buffer = this.encoder.encode(response);
          await this.socketSendInternal(buffer);
        } else {
          const code = index_1.RpcErrorCode.InternalServerError;
          const message = "Internal Server Error";
          const data = {};
          const response = index_1.RpcProtocol.encodeError(rpcRequest.id, { code, message, data });
          const buffer = this.encoder.encode(response);
          await this.socketSendInternal(buffer);
        }
      }
      async executeRequest(rpcRequest) {
        try {
          const result = await this.methods.execute(rpcRequest.method, rpcRequest.params);
          await this.sendResponseWithResult(rpcRequest, result);
        } catch (error) {
          await this.sendResponseWithError(rpcRequest, error);
        }
      }
      executeResponse(rpcResponse) {
        if (rpcResponse.result !== void 0) {
          this.responder.resolve(rpcResponse.id, rpcResponse.result);
        } else if (rpcResponse.error) {
          const { message, code, data } = rpcResponse.error;
          this.responder.reject(rpcResponse.id, new contract_1.Exception(message, code, data));
        }
      }
      async socketSendInternal(message) {
        return await this.socket.send(message);
      }
      onOpen() {
        this.onConnectCallback();
        this.barrier.resume();
      }
      async onMessage(event) {
        try {
          const message = index_1.RpcProtocol.decodeAny(this.encoder.decode(event.data));
          if (message === void 0)
            return;
          if (message.type === "request") {
            await this.executeRequest(message.data);
          } else if (message.type === "response") {
            await this.executeResponse(message.data);
          } else {
          }
        } catch (error) {
          this.onErrorCallback(error);
        }
      }
      onError(event) {
        this.onErrorCallback(event);
      }
      onClose(event) {
        if (!this.options.autoReconnectEnabled)
          this.closed = true;
        this.responder.rejectFor("client", new Error("Unable to communicate with server"));
        this.onCloseCallback(event);
        this.barrier.resume();
      }
      assertMethodExists(method) {
        if (!Object.keys(this.contract.server).includes(method))
          throw new Error(`Method '${method}' not defined in contract`);
      }
      assertCanSend() {
        if (this.closed) {
          throw new Error("WebSocket has closed");
        }
      }
      setupNotImplemented() {
        for (const [name, schema] of Object.entries(this.contract.client)) {
          this.methods.register(name, schema, () => {
            throw new contract_1.Exception(`Method '${name}' not implemented`, index_1.RpcErrorCode.InternalServerError, {});
          });
        }
      }
    };
    exports.WebSocketClient = WebSocketClient2;
  }
});

// node_modules/@sidewinder/client/index.js
var require_client = __commonJS({
  "node_modules/@sidewinder/client/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_contract(), exports);
    __exportStar(require_encoder2(), exports);
    __exportStar(require_methods2(), exports);
    __exportStar(require_proxy(), exports);
    __exportStar(require_web2(), exports);
    __exportStar(require_websocket2(), exports);
  }
});

// node_modules/@sinclair/smoke/async/barrier.mjs
var Barrier = class {
  #resolvers = [];
  #paused = true;
  constructor(options) {
    this.#paused = options.paused;
  }
  pause() {
    this.#paused = true;
  }
  resume() {
    this.#paused = false;
    this.#dispatch();
  }
  wait() {
    return this.#paused ? new Promise((resolve2) => this.#resolvers.push(resolve2)) : Promise.resolve(void 0);
  }
  async #dispatch() {
    while (!this.#paused && this.#resolvers.length > 0) {
      const resolve2 = this.#resolvers.shift();
      resolve2();
    }
  }
};

// node_modules/@sinclair/smoke/async/deferred.mjs
var Deferred = class {
  #resolveFunction;
  #rejectFunction;
  #awaiter;
  constructor() {
    this.#awaiter = new Promise((resolve2, reject) => {
      this.#resolveFunction = resolve2;
      this.#rejectFunction = reject;
    });
  }
  promise() {
    return this.#awaiter;
  }
  resolve(value) {
    this.#resolveFunction(value);
  }
  reject(error) {
    this.#rejectFunction(error);
  }
};

// node_modules/@sinclair/smoke/async/lock.mjs
var Lock = class {
  #resolve;
  constructor(resolve2) {
    this.#resolve = resolve2;
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#resolve();
  }
};

// node_modules/@sinclair/smoke/async/mutex.mjs
var Mutex = class {
  #queue;
  #running;
  constructor() {
    this.#running = false;
    this.#queue = [];
  }
  async lock() {
    const deferred = new Deferred();
    this.#queue.push(deferred);
    this.#dispatch();
    return deferred.promise();
  }
  #condition() {
    return this.#running === false && this.#queue.length > 0;
  }
  #dispatch() {
    if (!this.#condition())
      return;
    this.#running = true;
    const next = this.#queue.shift();
    const lock = new Lock(() => {
      this.#running = false;
      this.#dispatch();
    });
    next.resolve(lock);
  }
};

// node_modules/@sinclair/smoke/buffer/buffer.mjs
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function equals(bufferA, bufferB) {
  if (bufferA.length !== bufferB.length)
    return false;
  for (let i = 0; i < bufferA.length; i++) {
    if (bufferA[i] !== bufferB[i])
      return false;
  }
  return true;
}
function encode(input) {
  return encoder.encode(input);
}
function decode(input, options) {
  return decoder.decode(input, options);
}
function concat(buffers) {
  const length = buffers.reduce((acc, c) => acc + c.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const buffer of buffers) {
    output.set(buffer, offset);
    offset += buffer.length;
  }
  return output;
}

// node_modules/@sinclair/smoke/buffer/reader.mjs
var Reader = class {
  #buffer;
  #index;
  constructor(buffer) {
    this.#buffer = buffer;
    this.#index = 0;
  }
  read(length) {
    const buffer = this.#buffer.subarray(this.#index, this.#index + length);
    this.#index += length;
    return buffer.length > 0 ? buffer : null;
  }
};

// node_modules/@sinclair/smoke/channel/queue.mjs
var Queue = class {
  #enqueues;
  #dequeues;
  constructor() {
    this.#enqueues = [];
    this.#dequeues = [];
  }
  get buffered() {
    return this.#dequeues.length;
  }
  enqueue(value) {
    if (this.#enqueues.length > 0) {
      const deferred = this.#enqueues.shift();
      deferred.resolve(value);
    } else {
      const deferred = new Deferred();
      deferred.resolve(value);
      this.#dequeues.push(deferred.promise());
    }
  }
  dequeue() {
    if (this.#dequeues.length > 0) {
      const promise = this.#dequeues.shift();
      return promise;
    } else {
      const deferred = new Deferred();
      this.#enqueues.push(deferred);
      return deferred.promise();
    }
  }
};

// node_modules/@sinclair/smoke/channel/transform.mjs
var MessageType;
(function(MessageType3) {
  MessageType3[MessageType3["Next"] = 0] = "Next";
  MessageType3[MessageType3["Error"] = 1] = "Error";
  MessageType3[MessageType3["End"] = 2] = "End";
})(MessageType || (MessageType = {}));
var TransformChannel = class {
  #transformFunction;
  #queue;
  #ended;
  constructor(transformFunction) {
    this.#transformFunction = transformFunction;
    this.#queue = new Queue();
    this.#ended = false;
  }
  get buffered() {
    return this.#queue.buffered;
  }
  async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await this.next();
      if (next === null)
        return;
      yield next;
    }
  }
  async next() {
    if (this.#ended && this.#queue.buffered === 0)
      return null;
    const message = await this.#queue.dequeue();
    switch (message.type) {
      case MessageType.Next:
        return await this.#transformFunction(message.value);
      case MessageType.Error:
        throw message.error;
      case MessageType.End: {
        return null;
      }
    }
  }
  send(value) {
    if (this.#ended)
      return;
    this.#queue.enqueue({ type: MessageType.Next, value });
  }
  error(error) {
    if (this.#ended)
      return;
    this.#ended = true;
    this.#queue.enqueue({ type: MessageType.Error, error });
    this.#queue.enqueue({ type: MessageType.End });
  }
  end() {
    if (this.#ended)
      return;
    this.#ended = true;
    this.#queue.enqueue({ type: MessageType.End });
  }
};

// node_modules/@sinclair/smoke/channel/channel.mjs
var Channel = class extends TransformChannel {
  constructor() {
    super((value) => value);
  }
};

// node_modules/@sinclair/smoke/crypto/crypto.mjs
function randomUUID() {
  return globalThis.crypto.randomUUID();
}
var subtle = globalThis.crypto.subtle;

// node_modules/@sinclair/smoke/events/listener.mjs
var EventListener = class {
  #disposeCallback;
  constructor(disposeCallback) {
    this.#disposeCallback = disposeCallback;
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#disposeCallback();
  }
};

// node_modules/@sinclair/smoke/events/event.mjs
var Event = class {
  #subscriptions;
  constructor() {
    this.#subscriptions = /* @__PURE__ */ new Set();
  }
  on(handler) {
    const subscription = [false, handler];
    this.#subscriptions.add(subscription);
    return new EventListener(() => this.#subscriptions.delete(subscription));
  }
  once(handler) {
    const subscription = [true, handler];
    this.#subscriptions.add(subscription);
    return new EventListener(() => this.#subscriptions.delete(subscription));
  }
  send(value) {
    for (const subscriber of this.#subscriptions) {
      const [once, handler] = subscriber;
      if (once)
        this.#subscriptions.delete(subscriber);
      handler(value);
    }
  }
  count() {
    return this.#subscriptions.size;
  }
  dispose() {
    this.#subscriptions.clear();
  }
};

// node_modules/@sinclair/smoke/events/events.mjs
var Events = class {
  #events;
  constructor() {
    this.#events = /* @__PURE__ */ new Map();
  }
  on(name, handler) {
    const key = name;
    if (!this.#events.has(key))
      this.#events.set(key, new Event());
    const current = this.#events.get(key);
    return current.on(handler);
  }
  once(name, handler) {
    const key = name;
    if (!this.#events.has(key))
      this.#events.set(key, new Event());
    const current = this.#events.get(key);
    return current.once(handler);
  }
  send(name, value) {
    const key = name;
    if (!this.#events.has(key))
      return;
    const current = this.#events.get(key);
    current.send(value);
  }
  count(name) {
    const key = name;
    if (!this.#events.has(key))
      return 0;
    const current = this.#events.get(key);
    return current.count();
  }
  dispose() {
    for (const [key, event] of this.#events) {
      this.#events.delete(key);
      event.dispose();
    }
  }
};

// node_modules/@sinclair/smoke/os/os.mjs
function type() {
  const userAgent = globalThis.navigator.userAgent.toLowerCase();
  return userAgent.includes("windows") ? "win32" : userAgent.includes("linux") ? "linux" : userAgent.includes("darwin") ? "darwin" : "unknown";
}

// node_modules/@sinclair/smoke/path/path-util.mjs
var PathUtil;
(function(PathUtil2) {
  PathUtil2.CHAR_UPPERCASE_A = 65;
  PathUtil2.CHAR_LOWERCASE_A = 97;
  PathUtil2.CHAR_UPPERCASE_Z = 90;
  PathUtil2.CHAR_LOWERCASE_Z = 122;
  PathUtil2.CHAR_DOT = 46;
  PathUtil2.CHAR_FORWARD_SLASH = 47;
  PathUtil2.CHAR_BACKWARD_SLASH = 92;
  PathUtil2.CHAR_COLON = 58;
  PathUtil2.CHAR_QUESTION_MARK = 63;
  PathUtil2.platformIsWin32 = type() === "win32";
  function isPathSeparator(code) {
    return code === PathUtil2.CHAR_FORWARD_SLASH || code === PathUtil2.CHAR_BACKWARD_SLASH;
  }
  PathUtil2.isPathSeparator = isPathSeparator;
  function isPosixPathSeparator(code) {
    return code === PathUtil2.CHAR_FORWARD_SLASH;
  }
  PathUtil2.isPosixPathSeparator = isPosixPathSeparator;
  function isWindowsDeviceRoot(code) {
    return code >= PathUtil2.CHAR_UPPERCASE_A && code <= PathUtil2.CHAR_UPPERCASE_Z || code >= PathUtil2.CHAR_LOWERCASE_A && code <= PathUtil2.CHAR_LOWERCASE_Z;
  }
  PathUtil2.isWindowsDeviceRoot = isWindowsDeviceRoot;
  function normalizeString(path, allowAboveRoot, separator, isPathSeparator2) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code = 0;
    for (let i = 0; i <= path.length; ++i) {
      if (i < path.length)
        code = path.charCodeAt(i);
      else if (isPathSeparator2(code))
        break;
      else
        code = PathUtil2.CHAR_FORWARD_SLASH;
      if (isPathSeparator2(code)) {
        if (lastSlash === i - 1 || dots === 1) {
        } else if (dots === 2) {
          if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== PathUtil2.CHAR_DOT || res.charCodeAt(res.length - 2) !== PathUtil2.CHAR_DOT) {
            if (res.length > 2) {
              const lastSlashIndex = res.lastIndexOf(separator);
              if (lastSlashIndex === -1) {
                res = "";
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
              }
              lastSlash = i;
              dots = 0;
              continue;
            } else if (res.length !== 0) {
              res = "";
              lastSegmentLength = 0;
              lastSlash = i;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            res += res.length > 0 ? `${separator}..` : "..";
            lastSegmentLength = 2;
          }
        } else {
          if (res.length > 0)
            res += `${separator}${path.slice(lastSlash + 1, i)}`;
          else
            res = path.slice(lastSlash + 1, i);
          lastSegmentLength = i - lastSlash - 1;
        }
        lastSlash = i;
        dots = 0;
      } else if (code === PathUtil2.CHAR_DOT && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  }
  PathUtil2.normalizeString = normalizeString;
  function format(sep2, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || `${pathObject.name || ""}${pathObject.ext || ""}`;
    if (!dir) {
      return base;
    }
    return dir === pathObject.root ? `${dir}${base}` : `${dir}${sep2}${base}`;
  }
  PathUtil2.format = format;
})(PathUtil || (PathUtil = {}));

// node_modules/@sinclair/smoke/path/path.mjs
function normalize(path) {
  if (path.length === 0)
    return ".";
  const isAbsolute = path.charCodeAt(0) === PathUtil.CHAR_FORWARD_SLASH;
  const trailingSeparator = path.charCodeAt(path.length - 1) === PathUtil.CHAR_FORWARD_SLASH;
  path = PathUtil.normalizeString(path, !isAbsolute, "/", PathUtil.isPosixPathSeparator);
  if (path.length === 0) {
    if (isAbsolute)
      return "/";
    return trailingSeparator ? "./" : ".";
  }
  if (trailingSeparator)
    path += "/";
  return isAbsolute ? `/${path}` : path;
}
function join(...args) {
  if (args.length === 0)
    return ".";
  let joined;
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];
    if (arg.length > 0) {
      if (joined === void 0)
        joined = arg;
      else
        joined += `/${arg}`;
    }
  }
  if (joined === void 0)
    return ".";
  return normalize(joined);
}
function dirname(path) {
  if (path.length === 0)
    return ".";
  const hasRoot = path.charCodeAt(0) === PathUtil.CHAR_FORWARD_SLASH;
  let end = -1;
  let matchedSlash = true;
  for (let i = path.length - 1; i >= 1; --i) {
    if (path.charCodeAt(i) === PathUtil.CHAR_FORWARD_SLASH) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else {
      matchedSlash = false;
    }
  }
  if (end === -1)
    return hasRoot ? "/" : ".";
  if (hasRoot && end === 1)
    return "//";
  return path.slice(0, end);
}
function basename(path, ext) {
  let start = 0;
  let end = -1;
  let matchedSlash = true;
  if (ext !== void 0 && ext.length > 0 && ext.length <= path.length) {
    if (ext === path)
      return "";
    let extIdx = ext.length - 1;
    let firstNonSlashEnd = -1;
    for (let i = path.length - 1; i >= 0; --i) {
      const code = path.charCodeAt(i);
      if (code === PathUtil.CHAR_FORWARD_SLASH) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else {
        if (firstNonSlashEnd === -1) {
          matchedSlash = false;
          firstNonSlashEnd = i + 1;
        }
        if (extIdx >= 0) {
          if (code === ext.charCodeAt(extIdx)) {
            if (--extIdx === -1) {
              end = i;
            }
          } else {
            extIdx = -1;
            end = firstNonSlashEnd;
          }
        }
      }
    }
    if (start === end)
      end = firstNonSlashEnd;
    else if (end === -1)
      end = path.length;
    return path.slice(start, end);
  }
  for (let i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === PathUtil.CHAR_FORWARD_SLASH) {
      if (!matchedSlash) {
        start = i + 1;
        break;
      }
    } else if (end === -1) {
      matchedSlash = false;
      end = i + 1;
    }
  }
  if (end === -1)
    return "";
  return path.slice(start, end);
}

// node_modules/@sinclair/smoke/filesystem/util.mjs
function resolvePath(directory, path) {
  path = path.replaceAll("\\", "/");
  path = path.startsWith("/") ? path : `/${path}`;
  path = path.endsWith("/") && path.length !== 1 ? path.slice(0, path.length - 1) : path;
  if (path.includes(".."))
    throw Error("Path cannot contain double .. characters");
  if (path.includes("//"))
    throw Error("Path cannot contain double // characters");
  if (path.includes("~"))
    throw Error("Path cannot contain ~ characters");
  return join(directory, path);
}
function assertReadRange(start = 0, end = Number.MAX_SAFE_INTEGER) {
  if (start > end)
    throw Error("Invalid start and end range. The start is index is less than end");
  if (start < 0)
    throw Error("Invalid start and end range. The start index must be greater or equal to 0");
}

// node_modules/@sinclair/smoke/filesystem/events.mjs
var FileSystemEvents = class {
  #receiver;
  #sender;
  #events;
  constructor(database) {
    const channel = `filesystem::${database}`;
    this.#events = /* @__PURE__ */ new Map();
    this.#sender = new BroadcastChannel(channel);
    this.#receiver = new BroadcastChannel(channel);
    this.#receiver.addEventListener("messageerror", (event) => this.#onMessageError(event));
    this.#receiver.addEventListener("message", (event) => this.#onMessage(event));
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    for (const event of this.#events.values())
      event.dispose();
    this.#events.clear();
    this.#receiver.close();
    this.#sender.close();
  }
  send(event) {
    this.#sender.postMessage(event);
  }
  once(path, handler) {
    if (!this.#events.has(path))
      this.#events.set(path, new Event());
    const event = this.#events.get(path);
    return event.on(handler);
  }
  on(path, handler) {
    if (!this.#events.has(path))
      this.#events.set(path, new Event());
    const event = this.#events.get(path);
    return event.on(handler);
  }
  #onMessage(message) {
    for (const [key, event] of this.#events) {
      if (!message.data.path.startsWith(key))
        continue;
      event.send(message.data);
    }
  }
  #onMessageError(message) {
    console.error(message);
  }
};

// node_modules/@sinclair/smoke/filesystem/filesystem.mjs
var FileSystem = class {
  #database;
  #events;
  #blobsize;
  #readsize;
  constructor(database) {
    this.#events = new FileSystemEvents(database.name);
    this.#database = database;
    this.#blobsize = 1e6;
    this.#readsize = 65536;
  }
  get name() {
    return this.#database.name;
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#events.dispose();
    this.#database.close();
  }
  watch(path, handler) {
    return this.#events.on(path, handler);
  }
  readable(path, start, end) {
    assertReadRange(start, end);
    let [blob, skip, take] = [new Blob([]), 0, this.#readsize];
    let [_, filePath] = this.#resolvePath(path);
    return new ReadableStream({
      start: async (controller) => {
        if (await this.#isFileExists(path)) {
          const transaction = this.#database.transaction(["blob"], "readonly");
          const blobStore = await transaction.objectStore("blob");
          const blobIndex = blobStore.index("parent");
          const blobRecords = await blobIndex.getAll(filePath);
          blob = new Blob(blobRecords.map((record) => record.blob));
          blob = blob.slice(start, end);
        } else {
          controller.close();
        }
      },
      pull: async (controller) => {
        const slice = blob.slice(skip, skip + take);
        skip += take;
        if (slice.size > 0) {
          const buffer = await slice.arrayBuffer();
          controller.enqueue(new Uint8Array(buffer));
        } else {
          controller.close();
        }
      }
    });
  }
  writable(path) {
    let blob = new Blob([]);
    const [folderPath, filePath] = this.#resolvePath(path);
    return new WritableStream({
      start: async (controller) => {
        const error = await this.#assertCanWriteFile(filePath).catch((error2) => error2);
        if (error !== void 0)
          return controller.error(error);
        await this.#deleteFileIfExists(path);
        await this.#createDependentFolderPaths(path);
        const transaction = this.#database.transaction(["file"], "readwrite");
        const fileStore = transaction.objectStore("file");
        await fileStore.add({ parent: folderPath, path: filePath, created: Date.now() });
        transaction.commit();
      },
      write: async (value, controller) => {
        const transaction = this.#database.transaction(["blob"], "readwrite");
        const blobStore = transaction.objectStore("blob");
        try {
          blob = new Blob([blob, value]);
          while (blob.size > this.#blobsize) {
            await blobStore.add({ parent: filePath, blob: blob.slice(0, this.#blobsize) });
            blob = blob.slice(this.#blobsize);
          }
        } catch (error) {
          transaction.abort();
          controller.error(error);
        }
        this.#sendCreated(filePath);
        transaction.commit();
      },
      close: async () => {
        const transaction = this.#database.transaction(["blob"], "readwrite");
        const blobStore = transaction.objectStore("blob");
        await blobStore.add({ parent: filePath, blob });
        transaction.commit();
      }
    });
  }
  async mkdir(path) {
    if (await this.#isFolderExists(path))
      return;
    await this.#assertCanMakeFolder(path);
    const [folderPath, filePath] = this.#resolvePath(path);
    await this.#createDependentFolderPaths(path);
    const transaction = this.#database.transaction(["folder"], "readwrite");
    const folderStore = transaction.objectStore("folder");
    await folderStore.add({ path: filePath, parent: folderPath, created: Date.now() });
    transaction.commit();
    this.#sendCreated(filePath);
  }
  async readdir(path) {
    const [_, filePath] = this.#resolvePath(path);
    const transaction = this.#database.transaction(["folder", "file"], "readonly");
    const folderStore = transaction.objectStore("folder");
    const fileStore = transaction.objectStore("file");
    const folderIndex = folderStore.index("parent");
    const fileIndex = fileStore.index("parent");
    const folderPaths = await folderIndex.getAllKeys(filePath);
    const filePaths = await fileIndex.getAllKeys(filePath);
    return [...folderPaths, ...filePaths].map((path2) => basename(path2)).filter((path2) => path2.length > 0);
  }
  async exists(path) {
    const [_, filePath] = this.#resolvePath(path);
    const transaction = this.#database.transaction(["folder", "file"], "readonly");
    const folderStore = transaction.objectStore("folder");
    const fileStore = transaction.objectStore("file");
    const folderKeys = await folderStore.getAllKeys(filePath);
    const fileKeys = await fileStore.getAllKeys(filePath);
    return fileKeys.length + folderKeys.length > 0;
  }
  async stat(path) {
    const [_, filePath] = this.#resolvePath(path);
    const transaction = this.#database.transaction(["folder", "file", "blob"], "readonly");
    const folderStore = transaction.objectStore("folder");
    const folderRecord = await folderStore.get(filePath);
    if (folderRecord !== void 0) {
      return { type: "directory", path: filePath };
    }
    const fileStore = transaction.objectStore("file");
    const blobStore = transaction.objectStore("blob");
    const blobIndex = blobStore.index("parent");
    const fileRecord = await fileStore.get(filePath);
    if (fileRecord !== void 0) {
      const blobRecords = await blobIndex.getAll(filePath);
      const size = blobRecords.reduce((acc, c) => acc + c.blob.size, 0);
      return { type: "file", path: filePath, created: fileRecord.created, size };
    }
    throw Error(`No such path '${filePath}'`);
  }
  async delete(path) {
    const [_, filePath] = this.#resolvePath(path);
    this.#assertNotRoot("delete", filePath);
    const transaction = this.#database.transaction(["folder", "file", "blob"], "readwrite");
    const folderStore = transaction.objectStore("folder");
    const fileStore = transaction.objectStore("file");
    const blobStore = transaction.objectStore("blob");
    const blobIndex = blobStore.index("parent");
    const fileKeys = await fileStore.getAllKeys();
    for (const fileKey of fileKeys) {
      if (!fileKey.startsWith(filePath))
        continue;
      for (const blobKey of await blobIndex.getAllKeys(fileKey)) {
        await blobStore.delete(blobKey);
      }
      await fileStore.delete(fileKey);
      this.#sendDeleted(fileKey);
    }
    const folderKeys = (await folderStore.getAllKeys()).reverse();
    for (const folderKey of folderKeys) {
      if (!(folderKey === filePath || folderKey.startsWith(`${filePath}/`)))
        continue;
      await folderStore.delete(folderKey);
      this.#sendDeleted(folderKey);
    }
    transaction.commit();
  }
  #directoryCopyTargetPath(sourceDirectoryPath, sourcePath, targetDirectory) {
    const parentPath = dirname(sourceDirectoryPath);
    const truncatedPath = sourcePath.replace(parentPath, "");
    return join(targetDirectory, truncatedPath);
  }
  async #copyDirectory(sourcePath, targetDirectoryPath) {
    await this.mkdir(targetDirectoryPath);
    const transaction = this.#database.transaction(["folder", "file", "blob"], "readwrite");
    const folderStore = transaction.objectStore("folder");
    const fileStore = transaction.objectStore("file");
    const blobStore = transaction.objectStore("blob");
    const fileIndex = fileStore.index("parent");
    const blobIndex = blobStore.index("parent");
    for (const folderRecord of await folderStore.getAll()) {
      if (!folderRecord.path.startsWith(sourcePath))
        continue;
      const folderPath = this.#directoryCopyTargetPath(sourcePath, folderRecord.path, targetDirectoryPath);
      await folderStore.add({ parent: dirname(folderPath), path: folderPath, created: Date.now() });
      this.#sendCreated(folderPath);
      for (const fileRecord of await fileIndex.getAll(folderRecord.path)) {
        const filePath = this.#directoryCopyTargetPath(sourcePath, fileRecord.path, targetDirectoryPath);
        await fileStore.add({ parent: dirname(filePath), path: filePath, created: Date.now() });
        this.#sendCreated(filePath);
        for (const blobRecord of await blobIndex.getAll(fileRecord.path)) {
          await blobStore.add({ parent: filePath, blob: blobRecord.blob });
        }
      }
    }
    transaction.commit();
  }
  async #copyFile(sourcePath, targetDirectoryPath) {
    await this.mkdir(targetDirectoryPath);
    const transaction = this.#database.transaction(["file", "blob"], "readwrite");
    const fileStore = transaction.objectStore("file");
    const blobStore = transaction.objectStore("blob");
    const blobIndex = blobStore.index("parent");
    const fileRecord = await fileStore.get(sourcePath);
    this.#assertDefined(fileRecord);
    const filePath = join(targetDirectoryPath, basename(sourcePath));
    const parentPath = dirname(filePath);
    await fileStore.add({ parent: parentPath, path: filePath, created: Date.now() });
    for (const blobRecord of await blobIndex.getAll(sourcePath)) {
      await blobStore.add({ parent: filePath, blob: blobRecord.blob });
    }
    this.#sendCreated(filePath);
    transaction.commit();
  }
  async copy(path, directory) {
    const [_0, sourcePath] = this.#resolvePath(path);
    const [_1, targetDirectoryPath] = this.#resolvePath(directory);
    this.#assertNotRoot("copy", sourcePath);
    if (!await this.exists(sourcePath))
      return;
    const stat = await this.stat(sourcePath);
    if (stat.type === "directory")
      return await this.#copyDirectory(sourcePath, targetDirectoryPath);
    if (stat.type === "file")
      return await this.#copyFile(sourcePath, targetDirectoryPath);
  }
  async move(path, directory) {
    await this.copy(path, directory);
    await this.delete(path);
  }
  async blob(path) {
    const [_0, filePath] = this.#resolvePath(path);
    const transaction = this.#database.transaction(["file", "blob"], "readonly");
    const fileStore = transaction.objectStore("file");
    const blobStore = transaction.objectStore("blob");
    const blobIndex = blobStore.index("parent");
    const fileRecord = await fileStore.get(filePath);
    if (fileRecord === void 0)
      return new Blob([]);
    const blobRecords = await blobIndex.getAll(filePath);
    const blobs = blobRecords.map((record) => record.blob);
    return new Blob(blobs);
  }
  async #renameFolder(sourcePath, targetPath) {
    const transaction = this.#database.transaction(["folder", "file", "blob"], "readwrite");
    const folderStore = transaction.objectStore("folder");
    const fileStore = transaction.objectStore("file");
    const blobStore = transaction.objectStore("blob");
    const blobIndex = blobStore.index("parent");
    for (const folderRecord of await folderStore.getAll()) {
      if (!folderRecord.path.startsWith(sourcePath))
        continue;
      const folderPath = folderRecord.path.replace(sourcePath, targetPath);
      const parentPath = dirname(folderPath);
      await folderStore.add({ parent: parentPath, path: folderPath, created: Date.now() });
      this.#sendCreated(folderPath);
    }
    for (const fileRecord of await fileStore.getAll()) {
      if (!fileRecord.path.startsWith(sourcePath))
        continue;
      const filePath = fileRecord.path.replace(sourcePath, targetPath);
      const parentPath = dirname(filePath);
      await fileStore.add({ parent: parentPath, path: filePath, created: Date.now() });
      this.#sendCreated(filePath);
      for (const blobRecord of await blobIndex.getAll(fileRecord.path)) {
        await blobStore.add({ parent: filePath, blob: blobRecord.blob });
      }
    }
    for (const folderRecord of await folderStore.getAll()) {
      if (!folderRecord.path.startsWith(sourcePath))
        continue;
      await folderStore.delete(folderRecord.path);
      this.#sendDeleted(folderRecord.path);
    }
    for (const fileRecord of await fileStore.getAll()) {
      if (!fileRecord.path.startsWith(sourcePath))
        continue;
      await fileStore.delete(fileRecord.path);
      for (const blobKey of await blobIndex.getAllKeys(fileRecord.path)) {
        await blobStore.delete(blobKey);
      }
    }
    transaction.commit();
  }
  async #renameFile(sourcePath, targetPath) {
    const transaction = this.#database.transaction(["file", "blob"], "readwrite");
    const fileStore = transaction.objectStore("file");
    const blobStore = transaction.objectStore("blob");
    const fileRecord = await fileStore.get(sourcePath);
    this.#assertDefined(fileRecord);
    await fileStore.add({ parent: fileRecord.parent, path: targetPath, created: Date.now() });
    this.#sendCreated(targetPath);
    const blobIndex = blobStore.index("parent");
    for (const blobRecord of await blobIndex.getAll(sourcePath)) {
      await blobStore.add({ parent: targetPath, blob: blobRecord.blob });
    }
    await fileStore.delete(sourcePath);
    this.#sendDeleted(sourcePath);
    for (const blobRecordKey of await blobIndex.getAllKeys(sourcePath)) {
      await blobStore.delete(blobRecordKey);
    }
    transaction.commit();
  }
  async rename(path, newname) {
    const [_, sourcePath] = this.#resolvePath(path);
    const targetPath = join(dirname(sourcePath), newname);
    this.#assertNotRoot("rename", sourcePath);
    await this.#assertPathExists(sourcePath);
    await this.#assertPathDoesNotExist(targetPath);
    const stat = await this.stat(sourcePath);
    if (stat.type === "directory")
      return await this.#renameFolder(sourcePath, targetPath);
    if (stat.type === "file")
      return await this.#renameFile(sourcePath, targetPath);
  }
  async readText(path) {
    return decode(await this.read(path));
  }
  async read(path, start, end) {
    const buffers = [];
    const reader = this.readable(path, start, end).getReader();
    while (true) {
      const next = await reader.read();
      if (next.value !== void 0) {
        buffers.push(next.value);
      }
      if (next.done) {
        break;
      }
    }
    return concat(buffers);
  }
  async writeText(path, text) {
    return await this.write(path, encode(text));
  }
  async write(path, value) {
    const writer = this.writable(path).getWriter();
    await writer.write(value);
    await writer.close();
  }
  #resolvePath(path) {
    const resolvedPath = resolvePath("/", path);
    return [dirname(resolvedPath), resolvedPath];
  }
  async #isFolderExists(path) {
    const [_, filePath] = this.#resolvePath(path);
    const transaction = this.#database.transaction(["folder"], "readonly");
    const folderStore = transaction.objectStore("folder");
    const folderKeys = await folderStore.getAllKeys(filePath);
    return folderKeys.length === 1;
  }
  async #isFileExists(path) {
    const [_, filePath] = this.#resolvePath(path);
    const transaction = this.#database.transaction(["file"], "readonly");
    const fileStore = transaction.objectStore("file");
    const fileKeys = await fileStore.getAllKeys(filePath);
    return fileKeys.length === 1;
  }
  async #deleteFileIfExists(path) {
    const [_, filePath] = this.#resolvePath(path);
    const transaction = this.#database.transaction(["file", "blob"], "readwrite");
    const fileStore = transaction.objectStore("file");
    const blobStore = transaction.objectStore("blob");
    const blobIndex = blobStore.index("parent");
    const fileRecord = await fileStore.get(filePath);
    if (fileRecord === void 0)
      return transaction.abort();
    for (const blobKey of await blobIndex.getAllKeys(filePath)) {
      await blobStore.delete(blobKey);
    }
    await fileStore.delete(filePath);
    transaction.commit();
    this.#sendDeleted(path);
  }
  #resolveDependentFolderPaths(path) {
    path = path.startsWith("/") ? path : `/${path}`;
    const paths = [];
    while (path !== "/") {
      path = dirname(path);
      paths.unshift(path);
    }
    return paths;
  }
  async #createDependentFolderPaths(path) {
    const folderPaths = this.#resolveDependentFolderPaths(path);
    for (const folderPath of folderPaths) {
      await this.#assertCanMakeFolder(folderPath);
    }
    const transaction = this.#database.transaction(["folder"], "readwrite");
    const folderStore = transaction.objectStore("folder");
    for (const folderPath of folderPaths) {
      const existing = await folderStore.get(folderPath);
      if (existing)
        continue;
      await folderStore.add({ parent: dirname(folderPath), path: folderPath, created: Date.now() });
      this.#sendCreated(folderPath);
    }
    transaction.commit();
  }
  #sendCreated(path) {
    this.#events.send({ type: "created", path });
  }
  #sendUpdated(path) {
    this.#events.send({ type: "updated", path });
  }
  #sendDeleted(path) {
    this.#events.send({ type: "deleted", path });
  }
  #assertDefined(value) {
    if (value === void 0)
      this.#throw("Value undefined");
  }
  #assertNotRoot(operation, path) {
    if (path === "/")
      this.#throw(`Cannot perform ${operation} operation on root`);
  }
  async #assertCanMakeFolder(path) {
    const exists = await this.exists(path);
    if (!exists)
      return;
    const stat = await this.stat(path);
    if (stat.type === "directory")
      return;
    this.#throw(`Cannot make directory '${path}' because a file exists at this location`);
  }
  async #assertCanWriteFile(path) {
    const exists = await this.exists(path);
    if (!exists)
      return;
    const stat = await this.stat(path);
    if (stat.type === "file")
      return;
    this.#throw(`Cannot write file '${path}' because a directory exists at this location`);
  }
  async #assertPathExists(path) {
    const exists = await this.exists(path);
    if (!exists)
      this.#throw(`This path '${path}' does not exist`);
  }
  async #assertPathDoesNotExist(path) {
    const exists = await this.exists(path);
    if (exists)
      this.#throw(`This path '${path}' already exists`);
  }
  #throw(message) {
    throw new Error(message);
  }
};

// node_modules/@sinclair/smoke/indexeddb/request.mjs
function hasError(event) {
  return event.target !== null && "error" in event.target && typeof event.target.error === "object" && event.target.error !== null && typeof event.target.toString === "function";
}
function Request2(request) {
  return new Promise((resolve2, reject) => {
    request.addEventListener("success", () => resolve2(request.result));
    request.addEventListener("error", (event) => {
      event.stopPropagation();
      return hasError(event) ? reject(new Error(event.target.error.toString())) : reject(event);
    });
  });
}

// node_modules/@sinclair/smoke/indexeddb/cursor.mjs
var Record = class {
  cursor;
  constructor(cursor) {
    this.cursor = cursor;
  }
  get key() {
    return this.cursor.key;
  }
  async delete() {
    return await Request2(this.cursor.delete());
  }
  async update(value) {
    return await Request2(this.cursor.update(value));
  }
};
var Cursor = class {
  request;
  constructor(request) {
    this.request = request;
  }
  async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await Request2(this.request);
      if (next === null)
        return;
      yield new Record(next);
      next.continue();
    }
  }
};
var RecordWithValue = class {
  cursor;
  constructor(cursor) {
    this.cursor = cursor;
  }
  get key() {
    return this.cursor.key;
  }
  get value() {
    return this.cursor.value;
  }
  async delete() {
    return await Request2(this.cursor.delete());
  }
  async update(value) {
    return await Request2(this.cursor.update(value));
  }
};
var CursorWithValue = class {
  request;
  constructor(request) {
    this.request = request;
  }
  async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await Request2(this.request);
      if (next === null)
        return;
      yield new RecordWithValue(next);
      next.continue();
    }
  }
};

// node_modules/@sinclair/smoke/indexeddb/transaction.mjs
var Transaction = class {
  transaction;
  _aborted;
  _completed;
  _errored;
  constructor(transaction) {
    this.transaction = transaction;
    this._aborted = new Deferred();
    this._completed = new Deferred();
    this._errored = new Deferred();
    this.transaction.addEventListener("abort", () => this._aborted.resolve());
    this.transaction.addEventListener("complete", () => this._completed.resolve());
    this.transaction.addEventListener("error", (event) => this._errored.reject(event));
  }
  get aborted() {
    return this._aborted.promise();
  }
  get completed() {
    return this._completed.promise();
  }
  get errored() {
    return this._errored.promise();
  }
  abort() {
    this.transaction.abort();
  }
  commit() {
    this.transaction.commit();
  }
  get db() {
    return new Database(this.transaction.db);
  }
  get error() {
    return this.transaction.error;
  }
  get mode() {
    return this.transaction.mode;
  }
  objectStore(name) {
    return new ObjectStore(this.transaction.objectStore(name));
  }
  get objectStoreNames() {
    return this.transaction.objectStoreNames;
  }
};

// node_modules/@sinclair/smoke/indexeddb/indexed.mjs
var Index = class {
  index;
  constructor(index) {
    this.index = index;
  }
  async count(query) {
    return await Request2(this.index.count(query));
  }
  async get(query) {
    return await Request2(this.index.get(query));
  }
  async getAll(query, count) {
    return await Request2(this.index.getAll(query, count));
  }
  async getAllKeys(query, count) {
    return await Request2(this.index.getAllKeys(query, count));
  }
  async getKey(query) {
    return await Request2(this.index.getKey(query));
  }
  get keyPath() {
    return this.index.keyPath;
  }
  get multiEntry() {
    return this.index.multiEntry;
  }
  get name() {
    return this.index.name;
  }
  get objectStore() {
    return new ObjectStore(this.index.objectStore);
  }
  openCursor(query, direction) {
    return new CursorWithValue(this.index.openCursor(query, direction));
  }
  openKeyCursor(query, direction) {
    return new Cursor(this.index.openKeyCursor(query, direction));
  }
  get unique() {
    return this.index.unique;
  }
};

// node_modules/@sinclair/smoke/indexeddb/object-store.mjs
var ObjectStore = class {
  objectStore;
  constructor(objectStore) {
    this.objectStore = objectStore;
  }
  get autoIncrement() {
    return this.objectStore.autoIncrement;
  }
  async add(value, key) {
    const request = this.objectStore.add(value, key);
    return await Request2(request);
  }
  async count(query) {
    return await Request2(this.objectStore.count(query));
  }
  async clear() {
    return await Request2(this.objectStore.clear());
  }
  createIndex(name, keyPath, options) {
    return new Index(this.objectStore.createIndex(name, keyPath, options));
  }
  async delete(query) {
    return await Request2(this.objectStore.delete(query));
  }
  deleteIndex(name) {
    return this.objectStore.deleteIndex(name);
  }
  async get(query) {
    return await Request2(this.objectStore.get(query));
  }
  async getAll(query, count) {
    return await Request2(this.objectStore.getAll(query, count));
  }
  async getAllKeys(query, count) {
    return await Request2(this.objectStore.getAllKeys(query, count));
  }
  async getKey(query) {
    return await Request2(this.objectStore.getKey(query));
  }
  index(name) {
    return new Index(this.objectStore.index(name));
  }
  get indexNames() {
    return this.objectStore.indexNames;
  }
  get keyPath() {
    return this.objectStore.keyPath;
  }
  get name() {
    return this.objectStore.name;
  }
  async put(value, key) {
    return await Request2(this.objectStore.put(value, key));
  }
  openCursor(query, direction) {
    return new CursorWithValue(this.objectStore.openCursor(query, direction));
  }
  openKeyCursor(query, direction) {
    return new Cursor(this.objectStore.openKeyCursor(query, direction));
  }
  get transaction() {
    return new Transaction(this.objectStore.transaction);
  }
};

// node_modules/@sinclair/smoke/indexeddb/database.mjs
var Database = class {
  database;
  constructor(database) {
    this.database = database;
  }
  createObjectStore(name, options) {
    return new ObjectStore(this.database.createObjectStore(name, options));
  }
  deleteObjectStore(name) {
    return this.database.deleteObjectStore(name);
  }
  close() {
    return this.database.close();
  }
  get name() {
    return this.database.name;
  }
  get objectStoreNames() {
    return this.database.objectStoreNames;
  }
  get version() {
    return this.database.version;
  }
  transaction(storeNames, mode) {
    return new Transaction(this.database.transaction(storeNames, mode));
  }
};

// node_modules/@sinclair/smoke/indexeddb/factory.mjs
var Factory;
(function(Factory2) {
  async function open(name, upgrade, version2 = 1) {
    return new Promise((resolve2, reject) => {
      const request = window.indexedDB.open(name, version2);
      request.addEventListener("success", () => resolve2(new Database(request.result)));
      request.addEventListener("upgradeneeded", (event) => upgrade(new Database(request.result)));
      request.addEventListener("blocked", (event) => reject(new Error("Database blocked")));
      request.addEventListener("error", (event) => reject(event));
    });
  }
  Factory2.open = open;
  async function deleteDatabase(name) {
    return new Promise((resolve2, reject) => {
      const request = window.indexedDB.deleteDatabase(name);
      request.addEventListener("success", () => resolve2(void 0));
      request.addEventListener("upgradeneeded", (event) => reject(new Error("Unexpected upgradedneeded on database delete")));
      request.addEventListener("blocked", (event) => reject(new Error("Database blocked")));
      request.addEventListener("error", (event) => reject(event));
    });
  }
  Factory2.deleteDatabase = deleteDatabase;
  function cmp(first, second) {
    return window.indexedDB.cmp(first, second);
  }
  Factory2.cmp = cmp;
  async function databases() {
    return await window.indexedDB.databases();
  }
  Factory2.databases = databases;
})(Factory || (Factory = {}));

// node_modules/@sinclair/smoke/hubs/private.mjs
var Private = class {
  #sendChannel;
  #receiveChannel;
  #events;
  #config;
  #address;
  constructor() {
    this.#sendChannel = new globalThis.BroadcastChannel("default-network-interface");
    this.#receiveChannel = new globalThis.BroadcastChannel("default-network-interface");
    this.#receiveChannel.addEventListener("message", (event) => this.#onMessage(event));
    this.#events = new Events();
    this.#config = { iceServers: [] };
    this.#address = randomUUID();
  }
  async configuration() {
    return this.#config;
  }
  async address() {
    return this.#address;
  }
  send(message) {
    this.#sendChannel.postMessage(JSON.stringify({ from: this.#address, ...message }));
  }
  receive(handler) {
    this.#events.on("message", handler);
  }
  dispose() {
    this.#events.dispose();
  }
  #onMessage(event) {
    const message = JSON.parse(event.data);
    if (message.to !== this.#address)
      return;
    this.#events.send("message", message);
  }
};

// node_modules/@sinclair/smoke/stream/frames/reader.mjs
var FrameReaderError = class extends Error {
  constructor(message) {
    super(message);
  }
};
var FrameReader = class {
  #mutex;
  #read;
  #buffers;
  #ordinal;
  constructor(read) {
    this.#mutex = new Mutex();
    this.#read = read;
    this.#ordinal = 0;
    this.#buffers = [];
  }
  async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await this.read();
      if (next === null)
        return;
      yield next;
    }
  }
  async read() {
    const lock = await this.#mutex.lock();
    try {
      const header = await this.#readHeader();
      if (header === null)
        return null;
      const [ordinal, length] = header;
      await this.#checkOrdinal(ordinal);
      return await this.#readFrame(length);
    } finally {
      lock.dispose();
    }
  }
  async close() {
    const lock = await this.#mutex.lock();
    try {
      await this.#read.close();
    } finally {
      lock.dispose();
    }
  }
  async #readHeader() {
    const size = 8;
    while (this.#countBytes() < size) {
      const buffer = await this.#read.read();
      if (buffer === null)
        return null;
      this.#pushBuffer(buffer);
    }
    const reduce = this.#reduceBuffers();
    const dataview = new DataView(reduce.buffer);
    const ordinal = dataview.getUint32(0);
    const length = dataview.getUint32(4);
    this.#pushBuffer(reduce.slice(size));
    return [ordinal, length];
  }
  async #checkOrdinal(ordinal) {
    if (this.#ordinal === ordinal) {
      this.#ordinal = ordinal + 1;
    } else {
      await this.#read.close();
      this.#throw("FrameReader received unexpected ordinal");
    }
  }
  async #readFrame(length) {
    while (this.#countBytes() < length) {
      const buffer = await this.#read.read();
      if (buffer === null)
        return null;
      this.#pushBuffer(buffer);
    }
    const reduce = this.#reduceBuffers();
    this.#pushBuffer(reduce.slice(length));
    return reduce.slice(0, length);
  }
  #countBytes() {
    return this.#buffers.reduce((acc, c) => acc + c.length, 0);
  }
  #reduceBuffers() {
    const reduced = concat(this.#buffers);
    while (this.#buffers.length > 0)
      this.#buffers.shift();
    return reduced;
  }
  #pushBuffer(buffer) {
    this.#buffers.push(buffer);
  }
  #throw(message) {
    throw new FrameReaderError(message);
  }
};

// node_modules/@sinclair/smoke/stream/frames/writer.mjs
var FrameWriter = class {
  #write;
  #mutex;
  #header;
  #view;
  #ordinal;
  constructor(write) {
    this.#header = new Uint8Array(8);
    this.#view = new DataView(this.#header.buffer);
    this.#ordinal = 0;
    this.#mutex = new Mutex();
    this.#write = write;
  }
  async write(value) {
    const lock = await this.#mutex.lock();
    try {
      this.#view.setUint32(0, this.#ordinal);
      this.#view.setUint32(4, value.length);
      this.#ordinal += 1;
      const buffer = concat([this.#header, value]);
      await this.#write.write(buffer);
    } finally {
      lock.dispose();
    }
  }
  async close() {
    const lock = await this.#mutex.lock();
    try {
      await this.#write.close();
    } finally {
      lock.dispose();
    }
  }
};

// node_modules/@sinclair/smoke/stream/frames/duplex.mjs
var FrameDuplex = class {
  #reader;
  #writer;
  constructor(duplex) {
    this.#reader = new FrameReader(duplex);
    this.#writer = new FrameWriter(duplex);
  }
  async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await this.read();
      if (next === null)
        return;
      yield next;
    }
  }
  async read() {
    return await this.#reader.read();
  }
  async write(value) {
    return await this.#writer.write(value);
  }
  async close() {
    await this.#writer.close();
    await this.#reader.close();
  }
};

// node_modules/@sinclair/smoke/url/parse.mjs
function parseProtocol(href) {
  for (let i = 0; i < href.length; i++) {
    if (href.charAt(i) === ":") {
      const next0 = href.charAt(i + 1);
      const next1 = href.charAt(i + 2);
      if (next0 === "/" && next1 === "/") {
        return [href.slice(0, i + 1), href.slice(i + 3)];
      }
    }
  }
  return [null, href];
}
function parseAuth(s) {
  for (let i = 0; i < s.length; i++) {
    if (s.charAt(i) === "/") {
      return [null, s];
    }
    if (s.charAt(i) === "@") {
      return [s.slice(0, i), s.slice(i + 1)];
    }
  }
  return [null, s];
}
function parseHostname(s) {
  for (let i = 0; i < s.length; i++) {
    const next = s.charAt(i);
    if (next === "/" || next === "?" || next === "#") {
      return [s.slice(0, i), s.slice(i)];
    }
  }
  return [s, ""];
}
function parseHost(hostname) {
  for (let i = 0; i < hostname.length; i++) {
    const next = hostname.charAt(i);
    if (next === ":") {
      return [hostname.slice(0, i), hostname.slice(i)];
    }
  }
  return [hostname, ""];
}
function parsePort(hostname) {
  for (let i = 0; i < hostname.length; i++) {
    if (hostname.charAt(i) === ":") {
      return [hostname.slice(i + 1), ""];
    }
  }
  return [null, hostname];
}
function parsePath(s) {
  if (s.length === 0) {
    return ["/", ""];
  }
  return [s, ""];
}
function parsePathname(path) {
  for (let i = 0; i < path.length; i++) {
    const next = path.charAt(i);
    if (next === "?" || next === "#") {
      return [path.slice(0, i), path.slice(i)];
    }
  }
  return [path, ""];
}
function parseHash(path) {
  for (let i = 0; i < path.length; i++) {
    const next = path.charAt(i);
    if (next === "#") {
      return [path.slice(i), path.slice(0, i)];
    }
  }
  return [null, path];
}
function parseSearch(path) {
  for (let i = 0; i < path.length; i++) {
    const next = path.charAt(i);
    if (next === "?") {
      return [path.slice(i), path.slice(0, i)];
    }
  }
  return ["", path];
}
function parseQuery(search) {
  for (let i = 0; i < search.length; i++) {
    const next = search.charAt(i);
    if (next === "?") {
      return [search.slice(i + 1), search.slice(0, i)];
    }
  }
  return ["", search];
}
function parse(href) {
  const [protocol, r0] = parseProtocol(href);
  if (protocol) {
    const [auth, r1] = parseAuth(r0);
    const [hostname, r2] = parseHostname(r1);
    const [host, r3] = parseHost(hostname);
    const [port, r4] = parsePort(hostname);
    const [path, r5] = parsePath(r2);
    const [pathname, r6] = parsePathname(path);
    const [hash, r7] = parseHash(path);
    const [search, r8] = parseSearch(r7);
    const [query, r9] = parseQuery(search);
    return { protocol, auth, hash, host, hostname, href, path, pathname, port, query, search };
  } else {
    const auth = null;
    const hostname = null;
    const host = null;
    const port = null;
    const [path, r5] = parsePath(r0);
    const [pathname, r6] = parsePathname(path);
    const [hash, r7] = parseHash(path);
    const [search, r8] = parseSearch(r7);
    const [query, r9] = parseQuery(search);
    return { protocol, auth, hash, host, hostname, href, path, pathname, port, query, search };
  }
}

// node_modules/@sinclair/smoke/http/signal.mjs
var RESPONSE = encode("---RESPONSE---");
var WEBSOCKET = encode("---SOCKET---");
var REQUEST_END = encode("---REQUEST_END---");

// node_modules/@sinclair/smoke/http/websocket/protocol.mjs
var MessageType2;
(function(MessageType3) {
  MessageType3[MessageType3["MessageText"] = 0] = "MessageText";
  MessageType3[MessageType3["MessageData"] = 1] = "MessageData";
  MessageType3[MessageType3["Ping"] = 2] = "Ping";
  MessageType3[MessageType3["Pong"] = 3] = "Pong";
})(MessageType2 || (MessageType2 = {}));
var MESSAGE_TEXT = new Uint8Array([MessageType2.MessageText]);
var MESSAGE_DATA = new Uint8Array([MessageType2.MessageData]);
var PING = new Uint8Array([MessageType2.Ping]);
var PONG = new Uint8Array([MessageType2.Pong]);
function encodeMessageDataType(value) {
  if (value instanceof Uint8Array)
    return value;
  if (value instanceof ArrayBuffer)
    return new Uint8Array(value);
  if (typeof value === "string")
    return encode(value);
  throw Error("Unable to send data type");
}
function encodeMessage(value) {
  const type2 = typeof value === "string" ? MESSAGE_TEXT : MESSAGE_DATA;
  const data = encodeMessageDataType(value);
  return concat([type2, data]);
}
function encodePing(value) {
  const data = encodeMessageDataType(value);
  return concat([PING, data]);
}
function encodePong(value) {
  const data = encodeMessageDataType(value);
  return concat([PONG, data]);
}
function decodeAny(value) {
  if (value.length === 0)
    throw Error("Unable to encode empty buffer");
  const [type2, data] = [value[0], value.slice(1)];
  switch (type2) {
    case MessageType2.MessageData:
      return [MessageType2.MessageData, data.buffer];
    case MessageType2.MessageText:
      return [MessageType2.MessageText, data];
    case MessageType2.Ping:
      return [MessageType2.Ping, data];
    case MessageType2.Pong:
      return [MessageType2.Pong, data];
    default:
      throw Error("Unknown protocol type");
  }
}

// node_modules/@sinclair/smoke/http/websocket/client.mjs
var HttpWebSocketState;
(function(HttpWebSocketState2) {
  HttpWebSocketState2[HttpWebSocketState2["CONNECTING"] = 0] = "CONNECTING";
  HttpWebSocketState2[HttpWebSocketState2["CONNECTED"] = 1] = "CONNECTED";
  HttpWebSocketState2[HttpWebSocketState2["CLOSED"] = 2] = "CLOSED";
})(HttpWebSocketState || (HttpWebSocketState = {}));
var HttpWebSocket = class {
  #events;
  #socket;
  #stream;
  #endpoint;
  #state;
  constructor(socket, endpoint) {
    this.#socket = socket;
    this.#stream = new FrameDuplex(this.#socket);
    this.#endpoint = endpoint;
    this.#events = new Events();
    this.#state = HttpWebSocketState.CONNECTING;
    this.#startSocket().catch(console.error);
  }
  on(event, handler) {
    return this.#events.on(event, handler);
  }
  get binaryType() {
    return "arraybuffer";
  }
  send(value) {
    if (this.#state === HttpWebSocketState.CLOSED)
      return;
    if (this.#state === HttpWebSocketState.CONNECTING)
      throw Error("Socket is still connecting");
    this.#stream.write(encodeMessage(value));
  }
  close(code) {
    if (this.#state === HttpWebSocketState.CLOSED)
      return;
    this.#state = HttpWebSocketState.CLOSED;
    this.#stream.close();
  }
  async #checkResponseSignal() {
    const buffer = await this.#stream.read();
    return buffer !== null && equals(buffer, WEBSOCKET);
  }
  async #sendListenerRequestInit(urlObject, requestInit) {
    const headers = requestInit.headers ?? {};
    const method = requestInit.method ?? "GET";
    const url = urlObject.path ?? "/";
    const init = { headers, method, url };
    await this.#stream.write(encode(JSON.stringify(init)));
  }
  async #startSocket() {
    await this.#sendListenerRequestInit(parse(this.#endpoint), {});
    if (await this.#checkResponseSignal() === false) {
      await this.#stream.close();
      this.#events.send("error", new Error("Unexpected protocol response"));
      this.#events.send("close", void 0);
      return;
    }
    if (this.#state === HttpWebSocketState.CLOSED) {
      return;
    }
    this.#state = HttpWebSocketState.CONNECTED;
    this.#events.send("open", void 0);
    await this.#readInternal();
  }
  async #readInternal() {
    for await (const message of this.#stream) {
      this.#dispatchProtocolMessage(message);
    }
    this.#events.send("close", void 0);
  }
  #dispatchProtocolMessage(message) {
    const [type2, data] = decodeAny(message);
    switch (type2) {
      case MessageType2.MessageText: {
        const event = new MessageEvent("message", { data: decode(new Uint8Array(data)) });
        return this.#events.send("message", event);
      }
      case MessageType2.MessageData: {
        const event = new MessageEvent("message", { data });
        return this.#events.send("message", event);
      }
      case MessageType2.Ping: {
        return this.#stream.write(encodePong(data));
      }
    }
  }
};

// node_modules/@sinclair/smoke/http/websocket/server.mjs
var HttpServerWebSocket = class {
  #stream;
  #events;
  constructor(stream) {
    this.#stream = stream;
    this.#events = new Events();
    this.#readInternal().catch((error) => console.error(error));
  }
  on(event, handler) {
    return this.#events.on(event, handler);
  }
  get binaryType() {
    return "arraybuffer";
  }
  send(value) {
    this.#stream.write(encodeMessage(value));
  }
  ping(value = "") {
    this.#stream.write(encodePing(value));
  }
  pong(value = "") {
    this.#stream.write(encodePong(value));
  }
  close(code) {
    this.#stream.close();
  }
  async #readInternal() {
    for await (const message of this.#stream) {
      this.#dispatchProtocolMessage(message);
    }
    this.#events.send("close", void 0);
  }
  #dispatchProtocolMessage(message) {
    const [type2, data] = decodeAny(message);
    switch (type2) {
      case MessageType2.MessageText: {
        const event = new MessageEvent("message", { data: decode(new Uint8Array(data)) });
        return this.#events.send("message", event);
      }
      case MessageType2.MessageData: {
        const event = new MessageEvent("message", { data });
        return this.#events.send("message", event);
      }
      case MessageType2.Ping: {
        const event = new MessageEvent("ping", { data });
        return this.#events.send("ping", event);
      }
      case MessageType2.Pong: {
        const event = new MessageEvent("pong", { data });
        return this.#events.send("pong", event);
      }
    }
  }
};

// node_modules/@sinclair/smoke/http/listener.mjs
var UpgradeMap = /* @__PURE__ */ new WeakMap();
var HttpListener = class {
  #listener;
  #accept;
  #options;
  constructor(net, options, accept) {
    this.#listener = net.listen({ port: options.port }, (socket) => this.#onSocket(socket));
    this.#options = options;
    this.#accept = accept;
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#listener.dispose();
  }
  #onSocket(socket) {
    this.#onRequest(socket);
  }
  async #readListenerRequestInit(stream) {
    const buffer = await stream.read();
    if (buffer === null)
      return null;
    const decoded = decode(buffer);
    const init = JSON.parse(decoded);
    return typeof init.url === "string" && typeof init.method === "string" && typeof init.headers === "object" && init.headers !== null ? init : null;
  }
  async #sendResponse(response, stream) {
    const headerData = JSON.stringify({
      headers: Object.fromEntries(response.headers.entries()),
      status: response.status,
      statusText: response.statusText
    });
    const headerEncoded = encode(headerData);
    await stream.write(headerEncoded);
    if (response.body === null) {
      return await stream.close();
    }
    const reader = response.body.getReader();
    while (true) {
      const next = await reader.read();
      if (next.value !== void 0)
        await stream.write(next.value);
      if (next.done)
        break;
    }
    await stream.close();
  }
  #createReadableFromRequestInit(listenerRequestInit, stream) {
    if (["HEAD", "GET"].includes(listenerRequestInit.method))
      return null;
    return new ReadableStream({
      pull: async (controller) => {
        const next = await stream.read();
        if (next === null || equals(next, REQUEST_END)) {
          return controller.close();
        } else {
          controller.enqueue(next);
        }
      }
    });
  }
  async #onRequest(socket) {
    const stream = new FrameDuplex(socket);
    const listenerRequestInit = await this.#readListenerRequestInit(stream);
    if (listenerRequestInit === null)
      return await stream.close();
    const url = new URL(`http://${socket.local.hostname}:${socket.local.port}${listenerRequestInit.url}`);
    const headers = new Headers(listenerRequestInit.headers);
    const body = this.#createReadableFromRequestInit(listenerRequestInit, stream);
    const request = new Request(url, {
      method: listenerRequestInit.method,
      headers,
      body,
      duplex: "half"
    });
    const info = { local: socket.local, remote: socket.remote };
    const response = await this.#accept(request, info);
    if (UpgradeMap.has(request)) {
      const callback = UpgradeMap.get(request);
      await stream.write(WEBSOCKET);
      callback(new HttpServerWebSocket(stream));
    } else {
      await stream.write(RESPONSE);
      await this.#sendResponse(response, stream);
    }
  }
};

// node_modules/@sinclair/smoke/http/fetch.mjs
function resolveHostnameAndPort(input) {
  const url = parse(input);
  return [url.host ?? "localhost", url.port === null ? 80 : parseInt(url.port)];
}
async function sendListenerRequestInit(duplex, urlObject, requestInit) {
  const headers = requestInit.headers ?? {};
  const method = requestInit.method ?? "GET";
  const url = urlObject.path ?? "/";
  const init = { headers, method, url };
  await duplex.write(encode(JSON.stringify(init)));
}
async function sendStringBody(duplex, data) {
  const buffer = encode(data);
  await duplex.write(buffer);
  await duplex.write(REQUEST_END);
}
async function sendUint8ArrayBody(duplex, data) {
  await duplex.write(data);
  await duplex.write(REQUEST_END);
}
async function sendReadableStreamBody(duplex, readable) {
  const reader = readable.getReader();
  while (true) {
    const next = await reader.read();
    if (next.value !== void 0)
      await duplex.write(next.value);
    if (next.done)
      break;
  }
  await duplex.write(REQUEST_END);
}
async function sendNullBody(duplex, data) {
  await duplex.write(REQUEST_END);
}
async function sendRequestBody(duplex, requestInit) {
  const body = requestInit.body;
  if (body === void 0)
    return;
  switch (true) {
    case typeof body === "string":
      return await sendStringBody(duplex, body);
    case body instanceof Uint8Array:
      return await sendUint8ArrayBody(duplex, body);
    case body instanceof ReadableStream:
      return await sendReadableStreamBody(duplex, body);
    case body === null:
      return await sendNullBody(duplex, body);
    default:
      throw Error("Unknown body type");
  }
}
async function readListenerResponseInit(duplex) {
  const buffer = await duplex.read();
  if (buffer === null)
    return null;
  const init = JSON.parse(decode(buffer));
  return "headers" in init && typeof init.headers === "object" && init.headers !== null && "status" in init && typeof init.status === "number" && "statusText" in init && typeof init.statusText === "string" ? init : null;
}
async function readResponseSignal(duplex) {
  return await duplex.read();
}
async function fetch2(net, endpoint, requestInit = {}) {
  const url = parse(endpoint);
  const [hostname, port] = resolveHostnameAndPort(endpoint);
  const socket = await net.connect({ hostname, port });
  const duplex = new FrameDuplex(socket);
  await sendListenerRequestInit(duplex, url, requestInit);
  sendRequestBody(duplex, requestInit).catch((error) => console.error(error));
  const signal = await readResponseSignal(duplex);
  if (signal === null) {
    await duplex.close();
    throw Error(`Connection to ${endpoint} terminated unexpectedly`);
  }
  if (!equals(signal, RESPONSE)) {
    await duplex.close();
    throw Error("Server is using alternate protocol");
  }
  const responseInit = await readListenerResponseInit(duplex);
  if (responseInit === null) {
    await duplex.close();
    throw Error("Unable to parse server response headers");
  }
  const readable = new ReadableStream({
    pull: async (controller) => {
      const next = await duplex.read();
      if (next === null)
        return controller.close();
      controller.enqueue(next);
    }
  });
  return new Response(readable, responseInit);
}

// node_modules/@sinclair/smoke/http/http.mjs
var HttpModule = class {
  #net;
  constructor(net) {
    this.#net = net;
  }
  listen(options, accept) {
    return new HttpListener(this.#net, options, accept);
  }
  async fetch(endpoint, init) {
    return await fetch2(this.#net, endpoint, init);
  }
  async upgrade(request, callback) {
    UpgradeMap.set(request, callback);
    return new Response();
  }
  async connect(endpoint) {
    const [hostname, port] = this.#resolveHostnameAndPort(endpoint);
    const socket = await this.#net.connect({ hostname, port });
    return new Promise(async (resolve2, reject) => {
      const websocket = new HttpWebSocket(socket, endpoint);
      websocket.on("close", () => reject(new Error("WebSocket closed unexpectedly")));
      websocket.on("error", (error) => reject(error));
      websocket.on("open", () => resolve2(websocket));
    });
  }
  #resolveHostnameAndPort(input) {
    const url = parse(input);
    return [url.host ?? "localhost", url.port === null ? 80 : parseInt(url.port)];
  }
};

// node_modules/@sinclair/smoke/media/types/audio.mjs
var AudioSource = class {
  #element;
  #mediastream;
  constructor(element, mediastream) {
    this.#element = element;
    this.#mediastream = mediastream;
  }
  get mediastream() {
    return this.#mediastream;
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#element.pause();
  }
  static createMediaStream(element) {
    if ("captureStream" in element && typeof element.captureStream === "function") {
      return element.captureStream(30);
    }
    if ("mozCaptureStream" in element && typeof element.mozCaptureStream === "function") {
      return element.mozCaptureStream(30);
    }
    throw new Error("HTMLAudioElement does not support captureStream()");
  }
  static createAudioElement(options) {
    return new Promise((resolve2, reject) => {
      const element = document.createElement("video");
      element.src = options.src;
      element.volume = 1e-4;
      element.loop = true;
      element.controls = true;
      element.play();
      element.addEventListener("canplay", () => resolve2(element));
      element.addEventListener("error", (error) => reject(error));
    });
  }
  static async createAudioSource(options) {
    const element = await AudioSource.createAudioElement(options);
    const mediastream = AudioSource.createMediaStream(element);
    return new AudioSource(element, mediastream);
  }
};

// node_modules/@sinclair/smoke/media/types/pattern.mjs
var Pattern = class {
  #canvas;
  #context;
  #disposed;
  #header;
  #footer;
  #time = 0;
  constructor(options = {}) {
    this.#canvas = document.createElement("canvas");
    this.#canvas.width = 320;
    this.#canvas.height = 200;
    this.#context = this.#canvas.getContext("2d");
    this.#disposed = false;
    this.#header = options.header || "";
    this.#footer = options.footer || "";
    this.#time = 0;
    this.#draw();
  }
  get header() {
    return this.#header;
  }
  set header(value) {
    this.#header = value;
  }
  get footer() {
    return this.#footer;
  }
  set footer(value) {
    this.#footer = value;
  }
  get mediastream() {
    return this.#canvas.captureStream(24);
  }
  get element() {
    return this.#canvas;
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#disposed = true;
  }
  #drawBackground() {
    this.#context.save();
    this.#context.fillStyle = `#000`;
    this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#context.restore();
  }
  #drawFins() {
    const radius = 200;
    const circ = 2 * Math.PI * radius;
    this.#context.save();
    this.#context.strokeStyle = `#FF8800`;
    this.#context.lineWidth = 90;
    this.#context.translate(25, 32);
    this.#context.rotate(this.#time * 0.5);
    this.#context.setLineDash([circ / 16]);
    this.#context.beginPath();
    this.#context.arc(0, 0, radius, 0, Math.PI * 2);
    this.#context.stroke();
    this.#context.restore();
    this.#context.save();
    this.#context.strokeStyle = `#0088FF`;
    this.#context.lineWidth = 90;
    this.#context.translate(220, 220);
    this.#context.rotate(-this.#time * 0.75);
    this.#context.setLineDash([circ / 16]);
    this.#context.beginPath();
    this.#context.arc(0, 0, radius, 0, Math.PI * 2);
    this.#context.stroke();
    this.#context.restore();
    this.#context.save();
    this.#context.strokeStyle = `#33FF88`;
    this.#context.lineWidth = 90;
    this.#context.translate(100, 150);
    this.#context.rotate(this.#time);
    this.#context.setLineDash([circ / 16]);
    this.#context.beginPath();
    this.#context.arc(0, 0, radius, 0, Math.PI * 2);
    this.#context.stroke();
    this.#context.restore();
  }
  #drawHeader() {
    this.#context.save();
    const height = 32;
    this.#context.fillStyle = "#000";
    this.#context.translate(0, 0);
    this.#context.fillRect(0, 0, this.#canvas.width, height);
    this.#context.restore();
    this.#context.save();
    this.#context.strokeStyle = "#111";
    this.#context.translate(0, height);
    this.#context.beginPath();
    this.#context.moveTo(0, 0);
    this.#context.lineTo(this.#canvas.width, 0);
    this.#context.stroke();
    this.#context.restore();
  }
  #drawFooter() {
    this.#context.save();
    const height = 32;
    this.#context.fillStyle = "#000";
    this.#context.translate(0, this.#canvas.height - height);
    this.#context.fillRect(0, 0, this.#canvas.width, height);
    this.#context.restore();
    this.#context.save();
    this.#context.strokeStyle = "#111";
    this.#context.translate(0, this.#canvas.height - height);
    this.#context.beginPath();
    this.#context.moveTo(0, 0);
    this.#context.lineTo(this.#canvas.width, 0);
    this.#context.stroke();
    this.#context.restore();
  }
  #drawLogo() {
    this.#context.save();
    this.#context.font = "16px monospace";
    this.#context.fillStyle = "#FFF";
    const x = 8;
    const y = 20;
    this.#context.translate(x, y);
    this.#context.fillText(this.header, 0, 0);
    this.#context.restore();
  }
  #drawTime() {
    this.#context.save();
    this.#context.font = "16px monospace";
    this.#context.fillStyle = "#FFF";
    const text = this.#timeString();
    const metrics = this.#context.measureText(text);
    const x = this.#canvas.width - (metrics.width + 8);
    const y = 20;
    this.#context.translate(x, y);
    this.#context.fillText(text, 0, 0);
    this.#context.restore();
  }
  #drawAddress() {
    this.#context.save();
    this.#context.fillStyle = "#FFF";
    this.#context.font = "16px monospace";
    const x = 8;
    const y = this.#canvas.height - 10;
    this.#context.translate(x, y);
    this.#context.fillText(this.#footer, 0, 0);
    this.#context.restore();
  }
  #timeString() {
    return new Date().toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true
    });
  }
  #draw() {
    setTimeout(() => {
      this.#drawBackground();
      this.#drawFins();
      this.#drawHeader();
      this.#drawFooter();
      this.#drawLogo();
      this.#drawTime();
      this.#drawAddress();
      this.#time += 0.05;
      if (!this.#disposed) {
        this.#draw();
      }
    }, 1e3 / 24);
  }
};

// node_modules/@sinclair/smoke/media/types/video.mjs
var VideoSource = class {
  #element;
  #mediastream;
  constructor(element, mediastream) {
    this.#element = element;
    this.#mediastream = mediastream;
  }
  get mediastream() {
    return this.#mediastream;
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#element.pause();
  }
  static createMediaStream(element) {
    if ("captureStream" in element && typeof element.captureStream === "function") {
      return element.captureStream(30);
    }
    if ("mozCaptureStream" in element && typeof element.mozCaptureStream === "function") {
      return element.mozCaptureStream(30);
    }
    throw new Error("HTMLVideoElement does not support captureStream()");
  }
  static createVideoElement(options) {
    return new Promise((resolve2, reject) => {
      const element = document.createElement("video");
      element.src = options.src;
      element.volume = 1e-4;
      element.loop = true;
      element.controls = true;
      element.play();
      element.addEventListener("canplay", () => resolve2(element));
      element.addEventListener("error", (error) => reject(error));
    });
  }
  static async createVideoSource(options) {
    const element = await VideoSource.createVideoElement(options);
    const mediastream = VideoSource.createMediaStream(element);
    return new VideoSource(element, mediastream);
  }
};

// node_modules/@sinclair/smoke/media/protocol.mjs
function checkInit(message) {
  return typeof message === "object" && message !== null && "type" in message && message["type"] === "Init" && "trackCount" in message && typeof message["trackCount"] === "number";
}
function checkTrack(message) {
  return typeof message === "object" && message !== null && "type" in message && message["type"] === "Track" && "trackId" in message && typeof message["trackId"] === "string";
}
function checkDone(message) {
  return typeof message === "object" && message !== null && "type" in message && message["type"] === "Done";
}

// node_modules/@sinclair/smoke/media/receiver.mjs
var MediaReceiver = class {
  #events;
  #stream;
  #mediastream;
  #local;
  #remote;
  #closed;
  constructor(stream, receivers, options) {
    this.#events = new Events();
    this.#stream = stream;
    this.#mediastream = new MediaStream(receivers.map((receiver) => receiver.track));
    this.#local = options.local;
    this.#remote = options.remote;
    this.#readInternal().catch(console.error);
    this.#closed = false;
  }
  get local() {
    return this.#local;
  }
  get remote() {
    return this.#remote;
  }
  get mediastream() {
    return this.#mediastream;
  }
  on(event, handler) {
    return this.#events.on(event, handler);
  }
  async send(value) {
    this.#assertNotClosed();
    const data = this.#encodeAsUint8Array(value);
    await this.#stream.write(data);
  }
  close() {
    this.#stream.close();
  }
  #assertNotClosed() {
    if (this.#closed)
      throw Error("Receiver transport is closed");
  }
  #encodeAsUint8Array(value) {
    const data = JSON.stringify(value);
    return encode(data);
  }
  #decodeAsMessageEvent(buffer) {
    try {
      const data = JSON.parse(decode(buffer));
      return new MessageEvent("message", { data });
    } catch {
      console.log(decode(buffer));
      return null;
    }
  }
  async #readInternal() {
    for await (const buffer of this.#stream) {
      const event = this.#decodeAsMessageEvent(buffer);
      if (event === null)
        continue;
      this.#events.send("message", event);
    }
    this.#closed = true;
    this.#events.send("close", null);
  }
};

// node_modules/@sinclair/smoke/media/listener.mjs
var MediaListener = class {
  #netListener;
  #trackListener;
  #awaiters;
  #accept;
  constructor(options, webrtc, net, accept) {
    this.#awaiters = /* @__PURE__ */ new Map();
    this.#netListener = net.listen({ port: options.port }, (socket) => this.#onSocket(socket));
    this.#trackListener = webrtc.listenTrack((peer, event) => this.#onTrack(peer, event));
    this.#accept = accept;
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#awaiters.clear();
    this.#netListener.dispose();
    this.#trackListener.dispose();
  }
  #onTrack(peer, event) {
    const awaiter = this.#getAwaiter(event.track.id);
    awaiter.resolve(event.receiver);
  }
  #getAwaiter(trackId) {
    if (this.#awaiters.has(trackId))
      return this.#awaiters.get(trackId);
    const awaiter = new Deferred();
    this.#awaiters.set(trackId, awaiter);
    return awaiter;
  }
  async #readMessage(stream) {
    try {
      const buffer = await stream.read();
      if (buffer === null)
        return null;
      return JSON.parse(decode(buffer));
    } catch {
      return null;
    }
  }
  async #readInit(stream) {
    const message = await this.#readMessage(stream);
    return checkInit(message) ? message : null;
  }
  async #readTrack(stream) {
    const message = await this.#readMessage(stream);
    return checkTrack(message) ? message : null;
  }
  async #readDone(stream) {
    const message = await this.#readMessage(stream);
    return checkDone(message) ? message : null;
  }
  async #onSocket(socket) {
    const stream = new FrameDuplex(socket);
    const init = await this.#readInit(stream);
    if (init === null)
      return;
    const receivers = [];
    for (let i = 0; i < init.trackCount; i++) {
      const track = await this.#readTrack(stream);
      if (track === null)
        return;
      const awaiter = this.#getAwaiter(track.trackId);
      receivers.push(await awaiter.promise());
      this.#awaiters.delete(track.trackId);
    }
    const done = await this.#readDone(stream);
    if (done === void 0)
      return;
    this.#accept(new MediaReceiver(stream, receivers, {
      local: socket.local,
      remote: socket.remote
    }));
  }
};

// node_modules/@sinclair/smoke/media/sender.mjs
var MediaSender = class {
  #barrier;
  #events;
  #webrtc;
  #stream;
  #local;
  #remote;
  #mediastream;
  #senders;
  #closed;
  constructor(webrtc, stream, mediastream, options) {
    this.#barrier = new Barrier({ paused: true });
    this.#events = new Events();
    this.#stream = stream;
    this.#local = options.local;
    this.#remote = options.remote;
    this.#webrtc = webrtc;
    this.#mediastream = mediastream;
    this.#senders = [];
    this.#closed = false;
    this.#sendTracks().then(() => this.#readInternal());
  }
  get local() {
    return this.#local;
  }
  get remote() {
    return this.#remote;
  }
  get mediastream() {
    return this.#mediastream;
  }
  on(event, handler) {
    return this.#events.on(event, handler);
  }
  async send(value) {
    await this.#barrier.wait();
    this.#assertNotClosed();
    const data = this.#encodeAsUint8Array(value);
    await this.#stream.write(data);
  }
  close() {
    for (const sender of this.#senders) {
      this.#webrtc.removeTrack(this.#remote.hostname, sender);
    }
    this.#stream.close();
  }
  #encodeAsUint8Array(value) {
    const data = JSON.stringify(value);
    return encode(data);
  }
  #decodeAsMessageEvent(buffer) {
    try {
      const data = JSON.parse(decode(buffer));
      return new MessageEvent("message", { data });
    } catch {
      return null;
    }
  }
  #assertNotClosed() {
    if (this.#closed)
      throw Error("Sender transport is closed");
  }
  async #readInternal() {
    for await (const buffer of this.#stream) {
      const event = this.#decodeAsMessageEvent(buffer);
      this.#events.send("message", event);
    }
    this.#closed = true;
    this.#events.send("close", null);
  }
  async #sendInit(trackCount) {
    const message = { type: "Init", trackCount };
    await this.#stream.write(encode(JSON.stringify(message)));
  }
  async #sendTrack(track) {
    const message = { type: "Track", trackId: track.id };
    await this.#stream.write(encode(JSON.stringify(message)));
    const [_, sender] = await this.#webrtc.addTrack(this.#remote.hostname, track);
    this.#senders.push(sender);
  }
  async #sendDone() {
    const message = { type: "Done" };
    await this.#stream.write(encode(JSON.stringify(message)));
  }
  async #sendTracks() {
    const tracks = this.#mediastream.getTracks();
    await this.#sendInit(tracks.length);
    for (const track of tracks) {
      await this.#sendTrack(track);
    }
    await this.#sendDone();
    this.#barrier.resume();
  }
};

// node_modules/@sinclair/smoke/media/media.mjs
var MediaModule = class {
  #webrtc;
  #net;
  constructor(net, webrtc) {
    this.#net = net;
    this.#webrtc = webrtc;
  }
  async video(options) {
    return await VideoSource.createVideoSource(options);
  }
  async audio(options) {
    return await AudioSource.createAudioSource(options);
  }
  pattern(options = {}) {
    return new Pattern(options);
  }
  listen(options, accept) {
    return new MediaListener(options, this.#webrtc, this.#net, accept);
  }
  async send(options, mediastream) {
    const [hostname, port] = [options.hostname || "localhost", options.port];
    const socket = await this.#net.connect({ hostname, port });
    const stream = new FrameDuplex(socket);
    return new MediaSender(this.#webrtc, stream, mediastream, {
      local: socket.local,
      remote: socket.remote
    });
  }
};

// node_modules/@sinclair/smoke/net/socket.mjs
var NetSocket = class {
  #peer;
  #datachannel;
  #readchannel;
  #mutex;
  #closed;
  constructor(peer, datachannel) {
    this.#peer = peer;
    this.#mutex = new Mutex();
    this.#readchannel = new Channel();
    this.#datachannel = datachannel;
    this.#datachannel.addEventListener("message", (event) => this.#onMessage(event));
    this.#datachannel.addEventListener("close", (event) => this.#onClose(event));
    this.#datachannel.addEventListener("error", (event) => this.#onError(event));
    this.#closed = false;
  }
  get local() {
    return { hostname: this.#resolveAddress(this.#peer.localAddress), port: 0 };
  }
  get remote() {
    return { hostname: this.#resolveAddress(this.#peer.remoteAddress), port: 0 };
  }
  async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await this.read();
      if (next === null)
        return;
      yield next;
    }
  }
  read() {
    return this.#readchannel.next();
  }
  async write(value) {
    await this.#writeInternal(value);
  }
  async close() {
    await this.#closeInternal();
  }
  #onError(event) {
    this.#readchannel.error(event);
  }
  #onMessage(event) {
    this.#readchannel.send(new Uint8Array(event.data));
  }
  #onClose(event) {
    this.#closed = true;
    this.#readchannel.end();
  }
  #connectionBufferedAmount() {
    let size = 0;
    for (const datachannel of this.#peer.datachannels)
      size += datachannel.bufferedAmount;
    return size;
  }
  #maximumBufferedAmount() {
    return 65535;
  }
  #sendMessageSize() {
    const channelCount = this.#peer.datachannels.size === 0 ? 1 : this.#peer.datachannels.size;
    return Math.floor(32768 / channelCount);
  }
  #isUnderMinimumThreshold() {
    const maximum = this.#maximumBufferedAmount();
    const current = this.#connectionBufferedAmount();
    const available = maximum - current;
    return available > this.#sendMessageSize();
  }
  #isDataChannelOpen() {
    return this.#datachannel.readyState === "open";
  }
  async #waitForMinimumWriteThreshold() {
    return new Promise((resolve2, reject) => {
      const interval = setInterval(() => {
        if (!this.#isDataChannelOpen()) {
          return reject(new Error("Socket closed unexpectedly"));
        }
        if (this.#isUnderMinimumThreshold()) {
          clearInterval(interval);
          resolve2();
        }
      });
    });
  }
  async #writeInternal(value) {
    const lock = await this.#mutex.lock();
    try {
      const reader = new Reader(value);
      while (this.#isDataChannelOpen()) {
        await this.#waitForMinimumWriteThreshold();
        const buffer = reader.read(this.#sendMessageSize());
        if (this.#isDataChannelOpen() && buffer !== null) {
          this.#datachannel.send(buffer);
        } else {
          break;
        }
      }
    } finally {
      lock.dispose();
    }
  }
  async #closeInternal() {
    const lock = await this.#mutex.lock();
    try {
      if (this.#datachannel.bufferedAmount > 0) {
        setTimeout(() => this.#closeInternal(), 100);
      } else {
        this.#datachannel.close();
      }
    } finally {
      lock.dispose();
    }
  }
  #resolveAddress(address) {
    return ["loopback:0", "loopback:1"].includes(address) ? "localhost" : address;
  }
};

// node_modules/@sinclair/smoke/net/listener.mjs
var NetListener = class {
  #listener;
  #accept;
  constructor(webrtc, options, accept) {
    this.#listener = webrtc.listen({ port: options.port }, (peer, datachannel) => this.#onDataChannel(peer, datachannel));
    this.#accept = accept;
  }
  [Symbol.dispose]() {
    return this.dispose();
  }
  dispose() {
    this.#listener.dispose();
  }
  #onDataChannel(peer, datachannel) {
    this.#accept(new NetSocket(peer, datachannel));
  }
};

// node_modules/@sinclair/smoke/net/net.mjs
var NetModule = class {
  #webrtc;
  constructor(webrtc) {
    this.#webrtc = webrtc;
  }
  listen(options, accept) {
    return new NetListener(this.#webrtc, options, accept);
  }
  async connect(options) {
    const [hostname, port] = [options.hostname ?? "localhost", options.port];
    const [peer, datachannel] = await this.#webrtc.connect(hostname, port);
    return new NetSocket(peer, datachannel);
  }
};

// node_modules/@sinclair/smoke/webrtc/datachannel/listener.mjs
var WebRtcDataChannelListener = class {
  #accept;
  #dispose;
  constructor(onAccept, onDispose) {
    this.#accept = onAccept;
    this.#dispose = onDispose;
  }
  accept(peer, datachannel) {
    this.#accept(peer, datachannel);
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#dispose();
  }
};

// node_modules/@sinclair/smoke/webrtc/track/listener.mjs
var WebRtcTrackListener = class {
  #accept;
  #dispose;
  constructor(onAccept, onDispose) {
    this.#accept = onAccept;
    this.#dispose = onDispose;
  }
  accept(peer, event) {
    this.#accept(peer, event);
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#dispose();
  }
};

// node_modules/@sinclair/smoke/webrtc/webrtc.mjs
var WebRtcModule = class {
  #channelListeners;
  #trackListeners;
  #peers;
  #mutex;
  #hub;
  constructor(hub) {
    this.#hub = hub;
    this.#hub.receive((message) => this.#onHubMessage(message));
    this.#peers = /* @__PURE__ */ new Map();
    this.#channelListeners = /* @__PURE__ */ new Map();
    this.#trackListeners = /* @__PURE__ */ new Set();
    this.#mutex = new Mutex();
    this.#setupLocalhost();
  }
  listen(options, callback) {
    this.#assertPortInUse(options);
    const listener = new WebRtcDataChannelListener((peer, datachannel) => callback(peer, datachannel), () => this.#channelListeners.delete(options.port.toString()));
    this.#channelListeners.set(options.port.toString(), listener);
    return listener;
  }
  async connect(remoteAddress, port) {
    const open = new Deferred();
    const peer = await this.#resolvePeer(await this.#resolveAddress(remoteAddress));
    const datachannel = peer.connection.createDataChannel(port.toString(), { ordered: true, maxRetransmits: 16 });
    datachannel.addEventListener("open", () => {
      peer.datachannels.add(datachannel);
      open.resolve([peer, datachannel]);
    });
    datachannel.addEventListener("close", () => {
      peer.datachannels.delete(datachannel);
    });
    setTimeout(() => {
      open.reject(new Error(`Connection to '${remoteAddress}:${port}' timed out`));
    }, 4e3);
    return await open.promise();
  }
  async addTrack(remoteAddress, track, ...streams) {
    const peer = await this.#resolvePeer(await this.#resolveAddress(remoteAddress));
    const sender = peer.connection.addTrack(track, ...streams);
    return [peer, sender];
  }
  async removeTrack(remoteAddress, sender) {
    const peer = await this.#resolvePeer(await this.#resolveAddress(remoteAddress));
    peer.connection.removeTrack(sender);
  }
  listenTrack(callback) {
    const listener = new WebRtcTrackListener((peer, event) => {
      callback(peer, event);
    }, () => {
      this.#trackListeners.delete(listener);
    });
    this.#trackListeners.add(listener);
    return listener;
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#terminateConnections();
  }
  #sendToHub(request) {
    if (["loopback:0", "loopback:1"].includes(request.to)) {
      this.#onHubMessage({ from: request.to === "loopback:0" ? "loopback:1" : "loopback:0", to: request.to, data: request.data });
    } else {
      this.#hub.send({ to: request.to, data: request.data });
    }
  }
  async #onHubDescription(message) {
    const lock = await this.#mutex.lock();
    try {
      const peer = await this.#resolvePeer(message.from);
      const [collision, polite] = [this.#isCollision(peer, message.data), this.#isPolite(peer.localAddress, peer.remoteAddress)];
      peer.ignoreOffer = !polite && collision;
      if (peer.ignoreOffer)
        return;
      await peer.connection.setRemoteDescription(message.data.description);
      if (message.data.description.type == "offer") {
        await peer.connection.setLocalDescription();
        const [to, description] = [peer.remoteAddress, peer.connection.localDescription];
        this.#sendToHub({ to, data: { type: "description", description } });
      }
    } finally {
      lock.dispose();
    }
  }
  async onHubCandidate(message) {
    if (message.data.candidate === null)
      return;
    const peer = await this.#resolvePeer(message.from);
    try {
      await peer.connection.addIceCandidate(message.data.candidate);
    } catch (error) {
      if (peer.ignoreOffer)
        return;
      throw error;
    }
  }
  #onHubMessage(message) {
    const data = message.data;
    switch (data.type) {
      case "description":
        return this.#onHubDescription(message);
      case "candidate":
        return this.onHubCandidate(message);
    }
  }
  async #onPeerNegotiationNeeded(peer, event) {
    const lock = await this.#mutex.lock();
    peer.makingOffer = true;
    try {
      await peer.connection.setLocalDescription();
      const [description, to] = [peer.connection.localDescription, peer.remoteAddress];
      const data = { type: "description", description };
      this.#sendToHub({ to, data });
    } catch (error) {
      console.warn(error);
    } finally {
      peer.makingOffer = false;
      lock.dispose();
    }
  }
  #onPeerIceCandidate(peer, event) {
    this.#sendToHub({ to: peer.remoteAddress, data: { type: "candidate", candidate: event.candidate } });
  }
  #onPeerConnectionStateChange(peer, event) {
    if (peer.connection.iceConnectionState !== "disconnected")
      return;
    this.#terminateConnection(peer.remoteAddress);
  }
  #onPeerDataChannel(peer, event) {
    const [datachannel, port] = [event.channel, event.channel.label];
    if (!this.#channelListeners.has(port))
      return datachannel.close();
    const listener = this.#channelListeners.get(port);
    event.channel.addEventListener("close", () => peer.datachannels.delete(datachannel));
    peer.datachannels.add(datachannel);
    listener.accept(peer, datachannel);
  }
  #onPeerTrack(peer, event) {
    for (const listener of this.#trackListeners) {
      listener.accept(peer, event);
    }
  }
  #isCollision(peer, data) {
    return data.description.type === "offer" && (peer.makingOffer || peer.connection.signalingState !== "stable");
  }
  #isPolite(addressA, addressB) {
    const sorted = [addressA, addressB].sort();
    return addressA === sorted[0];
  }
  async #resolvePeer(remoteAddress) {
    if (this.#peers.has(remoteAddress))
      return this.#peers.get(remoteAddress);
    const configuration = await this.#hub.configuration();
    const localAddress = await this.#hub.address();
    const connection = new RTCPeerConnection(configuration);
    const peer = { connection, datachannels: /* @__PURE__ */ new Set(), localAddress, remoteAddress, makingOffer: false, ignoreOffer: true };
    this.#setupPeerEvents(peer);
    this.#peers.set(remoteAddress, peer);
    return peer;
  }
  async #resolveAddress(remoteAddress) {
    const localAddress = await this.#hub.address();
    return remoteAddress === "localhost" || remoteAddress === localAddress ? "loopback:1" : remoteAddress;
  }
  #assertPortInUse(options) {
    if (!this.#channelListeners.has(options.port.toString()))
      return;
    throw Error(`Port ${options.port} already in use`);
  }
  #terminateConnections() {
    for (const peer of this.#peers.values()) {
      peer.datachannels.clear();
      peer.connection.close();
    }
    this.#peers.clear();
  }
  async #terminateConnection(remoteAddress) {
    const lock = await this.#mutex.lock();
    try {
      const targetAddress = await this.#resolveAddress(remoteAddress);
      if (!this.#peers.has(targetAddress))
        return;
      if (["loopback:0", "loopback:1"].includes(targetAddress)) {
        this.#resetLocalhost();
      } else {
        const peer = this.#peers.get(targetAddress);
        peer.datachannels.clear();
        peer.connection.close();
        this.#peers.delete(targetAddress);
      }
    } finally {
      lock.dispose();
    }
  }
  #setupLocalhost() {
    if (this.#peers.has("loopback:1") || this.#peers.has("loopback:0")) {
      return;
    }
    const connection0 = new RTCPeerConnection({});
    const connection1 = new RTCPeerConnection({});
    const peer0 = { connection: connection0, datachannels: /* @__PURE__ */ new Set(), localAddress: "loopback:0", remoteAddress: "loopback:1", makingOffer: false, ignoreOffer: false };
    const peer1 = { connection: connection1, datachannels: /* @__PURE__ */ new Set(), localAddress: "loopback:1", remoteAddress: "loopback:0", makingOffer: false, ignoreOffer: false };
    this.#setupPeerEvents(peer0);
    this.#setupPeerEvents(peer1);
    this.#peers.set(peer0.remoteAddress, peer0);
    this.#peers.set(peer1.remoteAddress, peer1);
  }
  #resetLocalhost() {
    if (!(this.#peers.has("loopback:0") && this.#peers.has("loopback:1")))
      return;
    const localhost0 = this.#peers.get("loopback:0");
    const localhost1 = this.#peers.get("loopback:1");
    this.#peers.delete("loopback:0");
    this.#peers.delete("loopback:1");
    localhost1.connection.close();
    localhost0.connection.close();
    this.#setupLocalhost();
  }
  #setupPeerEvents(peer) {
    peer.connection.addEventListener("iceconnectionstatechange", (event) => this.#onPeerConnectionStateChange(peer, event));
    peer.connection.addEventListener("icegatheringstatechange", (event) => this.#onPeerConnectionStateChange(peer, event));
    peer.connection.addEventListener("signalingstatechange", (event) => this.#onPeerConnectionStateChange(peer, event));
    peer.connection.addEventListener("negotiationneeded", (event) => this.#onPeerNegotiationNeeded(peer, event));
    peer.connection.addEventListener("icecandidate", (event) => this.#onPeerIceCandidate(peer, event));
    peer.connection.addEventListener("datachannel", (event) => this.#onPeerDataChannel(peer, event));
    peer.connection.addEventListener("track", (event) => this.#onPeerTrack(peer, event));
  }
};

// node_modules/@sinclair/smoke/network.mjs
var Network = class {
  #hub;
  #webrtc;
  #net;
  #http;
  #media;
  constructor(options = {}) {
    this.#hub = options.hub ?? new Private();
    this.#webrtc = new WebRtcModule(this.#hub);
    this.#net = new NetModule(this.#webrtc);
    this.#http = new HttpModule(this.#net);
    this.#media = new MediaModule(this.#net, this.#webrtc);
  }
  [Symbol.dispose]() {
    this.dispose();
  }
  dispose() {
    this.#hub.dispose();
  }
  get Hub() {
    return this.#hub;
  }
  get WebRtc() {
    return this.#webrtc;
  }
  get Net() {
    return this.#net;
  }
  get Http() {
    return this.#http;
  }
  get Media() {
    return this.#media;
  }
};

// example/shared/contract.ts
var import_contract = __toESM(require_contract());
var SmokeMessage = import_contract.Type.Object({
  from: import_contract.Type.Optional(import_contract.Type.String()),
  to: import_contract.Type.String(),
  data: import_contract.Type.Unknown()
});
var SmokeContract = import_contract.Type.Contract({
  server: {
    configuration: import_contract.Type.Function([], import_contract.Type.Unsafe(import_contract.Type.Unknown())),
    address: import_contract.Type.Function([], import_contract.Type.String()),
    send: import_contract.Type.Function([SmokeMessage], import_contract.Type.Unknown())
  },
  client: {
    receive: import_contract.Type.Function([SmokeMessage], import_contract.Type.Unknown())
  }
});

// example/client/hub.mts
var import_client = __toESM(require_client(), 1);
var RemoteNetworkHub = class {
  #client;
  #receiveCallback;
  constructor(endpoint) {
    this.#client = new import_client.WebSocketClient(SmokeContract, endpoint);
    this.#client.method("receive", (message) => this.#onReceive(message));
    this.#receiveCallback = () => {
    };
  }
  async configuration() {
    return this.#client.call("configuration");
  }
  async address() {
    return this.#client.call("address");
  }
  send(message) {
    return this.#client.send("send", message);
  }
  receive(callback) {
    this.#receiveCallback = callback;
  }
  dispose() {
    this.#client.close();
  }
  #onReceive(message) {
    this.#receiveCallback(message);
  }
};

// example/client/index4.mts
var FetchService = class {
  useSmoke;
  smokeClient;
  constructor(hubUrl = "ws://localhost:5001/hub") {
    this.useSmoke = false;
    this.smokeClient = new Network({
      hub: new RemoteNetworkHub(hubUrl)
    });
  }
  async fetch(url, options) {
    if (this.useSmoke && this.smokeClient) {
      return await this.smokeClient.Http.fetch(url, options);
    } else {
      return await fetch(url, options);
    }
  }
};
export {
  FetchService
};
