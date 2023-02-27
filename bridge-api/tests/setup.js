"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var vitest_fetch_mock_1 = __importDefault(require("vitest-fetch-mock"));
var vitest_1 = require("vitest");
var fetchMock = (0, vitest_fetch_mock_1["default"])(vitest_1.vi);
// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMock.enableMocks();
// changes default behavior of fetchMock to use the real 'fetch' implementation and not mock responses
//fetchMock.dontMock();
//# sourceMappingURL=setup.js.map