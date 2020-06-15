const nodeEnv = process.env.NODE_ENV;
const path = require("path");
const deepMerge = require("deepmerge");
const appConfig = require("../lib/config.json");

afterEach(() => {
  jest.resetModules();
  jest.resetAllMocks();
  process.env.NODE_ENV = nodeEnv;
});

const origProcessCwd = process.cwd();
process.cwd = jest.fn(() => `${origProcessCwd}/tests`);

describe("index", () => {
  describe("start", () => {
    jest.mock("../lib/init/args.js", () => {
      return {
        argv: {
          _: ["start"],
        },
      };
    });

    describe("with parseable result from .headman.js", () => {
      describe("with templates.extension, components.folder and engine.name defined in .headman.js", () => {
        test("calls lib/init with parsed config", () => {
          const init = require("../lib/init");
          jest.mock("../lib/logger");
          jest.mock("../lib/init");

          process.argv = [1, 2, "start"];

          require("../index.js");

          const conf = deepMerge(appConfig.defaultUserConfig, {
            isBuild: false,
            isComponentGenerator: false,
            engine: {
              name: "handlebars",
            },
            files: {
              templates: {
                extension: "hbs",
              },
            },
            components: {
              folder: "src",
            },
          });

          conf.components.ignores = conf.components.ignores.map((folder) =>
            path.join(process.cwd(), "src", folder)
          );

          expect(init).toHaveBeenCalledWith(conf);
        });
      });

      describe("without extension defined in .headman.js", () => {
        test("it calls log with the correct error msg", () => {
          const log = require("../lib/logger.js");

          jest.mock("../lib/logger");
          jest.mock(
            path.resolve(process.cwd(), ".headman.js"),
            () => ({
              engine: {
                name: "handlebars",
              },
              components: { folder: "src" },
            }),
            { virtual: true }
          );

          require("../index.js");

          expect(log).toHaveBeenNthCalledWith(
            1,
            "info",
            appConfig.messages.serverStarting.replace("{{node_env}}", "test")
          );
          expect(log).toHaveBeenNthCalledWith(
            2,
            "info",
            appConfig.messages.tryingToGuessExtensionBasedOnEngine
          );
          expect(log).toHaveBeenNthCalledWith(
            3,
            "warn",
            appConfig.messages.templateExtensionGuessedBasedOnTemplateEngine.replace(
              "{{extension}}",
              "hbs"
            )
          );
        });

        test("calls lib/init", () => {
          const init = require("../lib/init");
          jest.mock("../lib/init");
          jest.mock("../lib/logger");
          jest.mock(path.resolve(process.cwd(), ".headman.js"), () => {
            return {
              engine: {
                name: "handlebars",
              },
              components: { folder: "src/" },
            };
          });

          require("../index.js");

          expect(init).toHaveBeenCalled();
        });
      });

      describe("without engine defined in .headman.js", () => {
        test("it calls log with the correct error msg", () => {
          const log = require("../lib/logger.js");

          jest.mock("../lib/logger");
          jest.mock(path.resolve(process.cwd(), ".headman.js"), () => {
            return {
              files: {
                templates: {
                  extension: "hbs",
                },
              },
              components: { folder: "src/" },
            };
          });

          require("../index.js");

          expect(log).toHaveBeenNthCalledWith(
            1,
            "info",
            appConfig.messages.serverStarting.replace("{{node_env}}", "test")
          );
          expect(log).toHaveBeenNthCalledWith(
            2,
            "info",
            appConfig.messages.tryingToGuessEngineBasedOnExtension
          );
          expect(log).toHaveBeenNthCalledWith(
            3,
            "warn",
            appConfig.messages.engineGuessedBasedOnExtension.replace(
              "{{engine}}",
              "handlebars"
            )
          );
        });

        test("calls lib/init", () => {
          const init = require("../lib/init");
          jest.mock("../lib/init");
          jest.mock("../lib/logger");
          jest.mock(path.resolve(process.cwd(), ".headman.js"), () => {
            return {
              files: {
                templates: {
                  extension: "hbs",
                },
              },
              components: { folder: "src/" },
            };
          });

          require("../index.js");

          expect(init).toHaveBeenCalled();
        });
      });
    });
  });
});