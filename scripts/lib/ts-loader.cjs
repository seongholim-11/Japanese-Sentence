// Node에서 앱의 TypeScript 모듈(quiz, search, progress 등)을 직접 불러오기 위한 도우미.
// react-native 등 네이티브 모듈은 가벼운 대역(stub)으로 대신한다. 검증 스크립트 전용이다.
const Module = require('module');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const stubs = {
  'react-native': { StyleSheet: { create: (x) => x }, Platform: { OS: 'node' }, Share: { share: async () => ({}) }, Text: 'Text', View: 'View' },
  '@react-native-async-storage/async-storage': { __esModule: true, default: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } },
  react: { useState: () => [], useEffect: () => {}, useRef: () => ({}), useCallback: (f) => f, useMemo: (f) => f(), createElement: () => null },
  'expo-notifications': { setNotificationHandler: () => {}, getPermissionsAsync: async () => ({}), requestPermissionsAsync: async () => ({}), scheduleNotificationAsync: async () => '', cancelAllScheduledNotificationsAsync: async () => {}, setNotificationChannelAsync: async () => {}, SchedulableTriggerInputTypes: {}, AndroidImportance: {} },
  'expo-audio': {},
  'expo-speech': {},
};

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (stubs[request]) return request;
  return origResolve.call(this, request, ...rest);
};
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (stubs[request]) return stubs[request];
  return origLoad.call(this, request, ...rest);
};

require.extensions['.ts'] = function (module, filename) {
  const src = fs.readFileSync(filename, 'utf8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, resolveJsonModule: true, jsx: ts.JsxEmit.React },
    fileName: filename,
  });
  module._compile(out.outputText, filename);
};

const root = path.join(__dirname, '..', '..');
module.exports = { load: (rel) => require(path.join(root, rel)) };
