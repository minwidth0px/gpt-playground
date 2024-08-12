// node_modules/@sinclair/smoke/agent/agent.mjs
function browserType() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("firefox")) {
    return "Firefox";
  } else if (userAgent.includes("edg/") || userAgent.includes("chrome") && !userAgent.includes("chromium")) {
    return "Chromium";
  } else if (userAgent.includes("safari") && !userAgent.includes("chrome") && !userAgent.includes("chromium")) {
    return "Safari";
  } else if (userAgent.includes("msie") || userAgent.includes("trident/")) {
    return "Internet Explorer";
  } else {
    return "Unknown";
  }
}

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

// node_modules/@sinclair/smoke/async/timeout.mjs
async function timeout(promise, options) {
  const error = options.error ?? new Error(`Promise did not resolve after ${options.timeout} milliseconds`);
  const timeout2 = new Promise((_, reject) => setTimeout(() => reject(error), options.timeout));
  const result = await Promise.race([promise, timeout2]);
  return result;
}

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
  async function open(name, upgrade, version = 1) {
    return new Promise((resolve2, reject) => {
      const request = window.indexedDB.open(name, version);
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
  #createReadableStreamFromRequestInit(listenerRequestInit, stream) {
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
  async #createBlobFromRequestInit(listenerRequestInit, stream) {
    if (["HEAD", "GET"].includes(listenerRequestInit.method))
      return null;
    const buffers = [];
    while (true) {
      const next = await stream.read();
      if (next === null || equals(next, REQUEST_END))
        break;
      buffers.push(next);
    }
    return new Blob(buffers);
  }
  async #createBodyFromRequestInit(listenerRequestInit, stream) {
    return browserType() === "Firefox" ? this.#createBlobFromRequestInit(listenerRequestInit, stream) : this.#createReadableStreamFromRequestInit(listenerRequestInit, stream);
  }
  async #onRequest(socket) {
    const stream = new FrameDuplex(socket);
    const listenerRequestInit = await this.#readListenerRequestInit(stream);
    if (listenerRequestInit === null)
      return await stream.close();
    const url = new URL(`http://${socket.local.hostname}:${socket.local.port}${listenerRequestInit.url}`);
    const headers = new Headers(listenerRequestInit.headers);
    const body = await this.#createBodyFromRequestInit(listenerRequestInit, stream);
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
  const signal = await timeout(readResponseSignal(duplex), { timeout: 4e3, error: new Error("A timeout occured reading the http response signal") });
  if (signal === null) {
    await duplex.close();
    throw Error(`Connection to ${endpoint} terminated unexpectedly`);
  }
  if (!equals(signal, RESPONSE)) {
    await duplex.close();
    throw Error("Server is using alternate protocol");
  }
  const responseInit = await timeout(readListenerResponseInit(duplex), { timeout: 4e3, error: new Error("A timeout occured reading http response init") });
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
    this.#datachannel.binaryType = "arraybuffer";
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
    const [peer, datachannel] = await this.#webrtc.connect(hostname, port, { ordered: true, maxRetransmits: 16 });
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
  async connect(remoteAddress, port, options) {
    const peer = await this.#resolvePeer(await this.#resolveAddress(remoteAddress));
    const datachannel = peer.connection.createDataChannel(port.toString(), options);
    const awaiter = new Deferred();
    datachannel.addEventListener("close", () => peer.datachannels.delete(datachannel));
    datachannel.addEventListener("open", () => peer.datachannels.add(datachannel));
    datachannel.addEventListener("open", () => awaiter.resolve([peer, datachannel]));
    return timeout(awaiter.promise(), { timeout: 50e3, error: new Error(`Connection to '${remoteAddress}:${port}' timed out`) });
  }
  async terminate(remoteAddress) {
    this.#hub.send({ to: remoteAddress, data: { type: "terminate" } });
    await this.#terminateConnection(remoteAddress);
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
  async #onHubCandidate(message) {
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
        return this.#onHubCandidate(message);
      case "terminate":
        return this.#terminateConnection(message.from);
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

// src/client/hubs/webtorrentHub.mts
var WebtorrentHub = class {
  #receiveCallback;
  #address;
  #ws;
  #infoHash;
  #firstSendSignal = true;
  #remoteAddr;
  constructor(ws, infoHash, localAddr, remoteAddr) {
    if (remoteAddr) {
      this.#address = remoteAddr;
    }
    this.#address = localAddr;
    this.#ws = ws;
    this.#ws.onmessage = (event) => {
      console.log(`message received:`);
      console.log(event.data);
      const msg = JSON.parse(event.data);
      console.log(msg);
      if (msg.offer) {
        console.log(`offer received:`);
        console.log(msg.offer);
        networkService_default.ICEParams.params.push(msg.offer);
        this.#onReceive(msg.offer);
      }
    };
    this.#infoHash = infoHash;
    this.#receiveCallback = () => {
    };
    networkService_default.address = this.#address;
  }
  async configuration() {
    return {
      iceServers: [{ urls: ["stun:stun1.l.google.com:19302", "stun:stun3.l.google.com:19302"] }]
    };
  }
  async address() {
    return this.#address;
  }
  send(message) {
    console.log(`message sent: `);
    console.log(message);
    if (this.#firstSendSignal) {
      this.#firstSendSignal = false;
    }
    message.from = this.#address;
    this.#ws.send(
      JSON.stringify({
        event: "started",
        action: "announce",
        info_hash: this.#infoHash,
        peer_id: this.#address,
        numwant: 1,
        offers: [
          {
            offer: message,
            offer_id: this.#address
          }
        ]
      })
    );
  }
  receive(callback) {
    this.#receiveCallback = callback;
  }
  dispose() {
    this.#ws.close();
  }
  #onReceive(message) {
    this.#receiveCallback(message);
  }
};

// src/client/networkService.mts
var networkService_default = {
  remoteAddr: "",
  address: "",
  ICEParams: { params: [] } = { params: [] },
  useSmoke: false,
  ws: WebSocket,
  queue: [],
  smokeClient: null,
  setNetwork(ws, infoHash, peerId, remoteAddr) {
    console.log("setting network");
    this.address = peerId;
    const client = new Network({ hub: new WebtorrentHub(ws, infoHash, peerId, remoteAddr) });
    this.smokeClient = client;
    this.remoteAddr = remoteAddr;
    this.ws = ws;
    console.log("done setting network");
  },
  async fetch(url, options) {
    if (this.useSmoke && this.smokeClient) {
      console.log("using smoke");
      console.log({ ws: this.ws.readyState });
      if (this.ws.readyState === 1) {
        return await this.smokeClient.Http.fetch(url, options);
      } else {
        throw new Error('socket not open. Mkae sure to use ws.addEventListener("open", ()=>{...})');
      }
    } else {
      return await fetch(url, options);
    }
  }
};
export {
  networkService_default as default
};
