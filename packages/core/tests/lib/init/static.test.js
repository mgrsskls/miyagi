const express = require("express");
const request = require("supertest");
const deepMerge = require("deepmerge");
const config = require("../../../lib/config.json");
const setStatic = require("../../../lib/init/static.js");

let app;
let server;

beforeEach((done) => {
  app = express();
  server = app.listen(0, done);
});

afterEach(() => {
  jest.resetModules();
  jest.resetAllMocks();
  server.close();
});

describe("lib/init/static", () => {
  const nodeEnv = process.env.NODE_ENV;

  describe("GET app assets", () => {
    test("returns the correct assets based on NODE_ENV", () => {
      app.set(
        "config",
        deepMerge(config.defaultUserConfig, {
          assets: {
            css: [],
            js: [],
          },
        })
      );

      process.env.NODE_ENV = "production";
      setStatic(app);

      request(app)
        .get(`/${config.projectName}/css/prod.css`)
        .expect(200)
        .end(() => {
          process.env.NODE_ENV = nodeEnv;
        });
    });

    describe("GET /js/socket.io.slim.js", () => {
      test("returns 200", (done) => {
        app.set(
          "config",
          deepMerge(config.defaultUserConfig, {
            assets: {
              css: [],
              js: [],
            },
          })
        );

        setStatic(app);
        request(app)
          .get(`/${config.projectName}/js/socket.io.slim.js`)
          .expect(200, done);
      });
    });

    describe("GET /js/axe.min.js", () => {
      test("returns 200", (done) => {
        app.set(
          "config",
          deepMerge(config.defaultUserConfig, {
            assets: {
              css: [],
              js: [],
            },
          })
        );

        setStatic(app);
        request(app)
          .get(`/${config.projectName}/js/axe.min.js`)
          .expect(200, done);
      });
    });

    describe("GET other requests", () => {
      test("return 404", (done) => {
        app.set(
          "config",
          deepMerge(config.defaultUserConfig, {
            assets: {
              css: [],
              js: [],
            },
          })
        );

        setStatic(app);
        request(app)
          .get("/gulpfile.js")
          .expect(404, done);
      });
    });
  });

  describe("with arrays in config.assets.css/js", () => {
    describe("GET entries from user css", () => {
      test("returns 200", (done) => {
        app.set(
          "config",
          deepMerge(config.defaultUserConfig, {
            assets: {
              css: ["tests/mocks/user/css/index.css"],
              js: ["tests/mocks/user/js/index.js"],
            },
          })
        );

        setStatic(app);
        request(app)
          .get("/tests/mocks/user/css/index.css")
          .expect(200, done);
      });
    });

    describe("GET entries from user js", () => {
      test("returns 200", (done) => {
        app.set(
          "config",
          deepMerge(config.defaultUserConfig, {
            assets: {
              css: ["tests/mocks/user/css/index.css"],
              js: ["tests/mocks/user/js/index.js"],
            },
          })
        );

        setStatic(app);
        request(app)
          .get("/tests/mocks/user/js/index.js")
          .expect(200, done);
      });
    });
  });
});