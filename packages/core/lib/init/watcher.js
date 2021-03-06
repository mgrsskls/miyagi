/**
 * Module for watching user file changes
 *
 * @module initWatcher
 */

const path = require("path");
const chokidar = require("chokidar");
const socketIo = require("socket.io");
const setState = require("../state");
const { readFile } = require("../state/file-contents.js");
const helpers = require("../helpers.js");
const setPartials = require("./partials.js");
const log = require("../logger.js");
const { messages } = require("../config.json");

let triggeredEvents = [];
let foldersToWatch;
let timeout;
let appInstance;
let ioInstance;

/**
 * @param {boolean} [reload] - is true if the page should be reloaded
 * @param {boolean} [reloadParent] - is true if the parent window should be reloaded
 */
function changeFileCallback(reload, reloadParent) {
  if (reload && appInstance.get("config").ui.reload) {
    ioInstance.emit("fileChanged", reloadParent);
  }

  triggeredEvents = [];
  log("success", `${messages.updatingDone}\n`);
}

/**
 * @param {Array} triggered - the triggered events
 * @param {Array} events - array of events to check against
 * @returns {boolean} is true if the triggered events include the events to check against
 */
function triggeredEventsIncludes(triggered, events) {
  const flattened = triggered.map((event) => event.event);

  for (let i = 0; i < flattened.length; i += 1) {
    if (events.includes(flattened[i])) {
      return true;
    }
  }

  return false;
}

/**
 * @param {object} app - the express instance
 * @param {object[]} events - array of event objects
 * @returns {Promise<object>} the updated state.fileContents object
 */
async function updateFileContents(app, events) {
  const data = helpers.cloneDeep(app.get("state").fileContents);
  const promises = [];

  for (const { event, changedPath } of events) {
    if (
      helpers.fileIsTemplateFile(app, changedPath) ||
      helpers.fileIsDataFile(app, changedPath) ||
      helpers.fileIsDocumentationFile(app, changedPath) ||
      helpers.fileIsInfoFile(app, changedPath) ||
      helpers.fileIsSchemaFile(app, changedPath)
    ) {
      const fullPath = path.join(process.cwd(), changedPath);

      if (event === "add" || event === "change") {
        promises.push(
          new Promise((resolve) => {
            readFile(app, changedPath).then((result) => {
              data[fullPath] = result;
              resolve();
            });
          })
        );
      } else if (event === "unlink") {
        promises.push(
          new Promise((resolve) => {
            delete data[fullPath];
            resolve();
          })
        );
      }
    }
  }

  return Promise.all(promises).then(() => {
    return data;
  });
}

/**
 *
 */
async function handleFileChange() {
  for (const extension of appInstance.get("config").extensions) {
    const ext = Array.isArray(extension) ? extension[0] : extension;
    const opts =
      Array.isArray(extension) && extension[1] ? extension[1] : { locales: {} };

    if (ext.callbacks?.fileChanged) {
      await ext.callbacks.fileChanged(opts);
    }
  }

  // updated file is a css file
  if (
    triggeredEvents.find(({ changedPath }) => {
      return changedPath.endsWith(".css");
    })
  ) {
    // updated file contains custom properties for the styleguide
    if (
      triggeredEvents.find(({ changedPath }) => {
        return appInstance
          .get("config")
          .assets.customProperties.files.includes(changedPath);
      })
    ) {
      await setState(appInstance, {
        css: true,
      });
    }

    changeFileCallback(true, false);
    // updates file is a js file
  } else if (
    triggeredEvents.find(({ changedPath }) => {
      return changedPath.endsWith(".js");
    })
  ) {
    changeFileCallback(true, false);
    // a folder has been added or deleted
  } else if (
    triggeredEventsIncludes(triggeredEvents, ["addDir", "unlinkDir"])
  ) {
    await setState(appInstance, {
      sourceTree: true,
      fileContents: await updateFileContents(appInstance, triggeredEvents),
      menu: true,
      partials: true,
    });
    changeFileCallback(true, true);
  } else if (
    triggeredEvents.filter((event) =>
      helpers.fileIsTemplateFile(appInstance, event.changedPath)
    ).length > 0
  ) {
    // a template file has been added or removed
    if (triggeredEventsIncludes(triggeredEvents, ["add", "unlink"])) {
      await setState(appInstance, {
        fileContents: await updateFileContents(appInstance, triggeredEvents),
        sourceTree: true,
        menu: true,
        partials: true,
      });

      // a template file has been added
      if (triggeredEventsIncludes(triggeredEvents, ["add"])) {
        await setPartials.registerPartial(
          appInstance,
          triggeredEvents.find((event) => event.event === "add").changedPath
        );
      }
      changeFileCallback(true, true);
      // a template file has been changed
    } else if (triggeredEventsIncludes(triggeredEvents, ["change"])) {
      await setState(appInstance, {
        fileContents: await updateFileContents(appInstance, triggeredEvents),
      });
      changeFileCallback(true, false);
    }
    // updated file is a mock file
  } else if (
    triggeredEvents.some(({ changedPath }) =>
      helpers.fileIsDataFile(appInstance, changedPath)
    )
  ) {
    await setState(appInstance, {
      fileContents: await updateFileContents(appInstance, triggeredEvents),
      sourceTree: triggeredEventsIncludes(triggeredEvents, ["add", "unlink"]),
      menu: true,
    });
    changeFileCallback(
      true,
      triggeredEventsIncludes(triggeredEvents, ["add", "unlink", "change"])
    );
    // updated file is a doc file
  } else if (
    triggeredEvents.some(({ changedPath }) =>
      helpers.fileIsDocumentationFile(appInstance, changedPath)
    )
  ) {
    const addedOrDeleted = triggeredEventsIncludes(triggeredEvents, [
      "add",
      "unlink",
    ]);

    await setState(appInstance, {
      fileContents: await updateFileContents(appInstance, triggeredEvents),
      sourceTree: addedOrDeleted,
      menu: addedOrDeleted,
    });

    changeFileCallback(true, addedOrDeleted);
    // updated file is an info file
  } else if (
    triggeredEvents.some(({ changedPath }) =>
      helpers.fileIsInfoFile(appInstance, changedPath)
    )
  ) {
    await setState(appInstance, {
      fileContents: await updateFileContents(appInstance, triggeredEvents),
      menu: true,
    });
    changeFileCallback(true, true);
    // updated file is a schema file
  } else if (
    triggeredEvents.some(({ changedPath }) =>
      helpers.fileIsSchemaFile(appInstance, changedPath)
    )
  ) {
    await setState(appInstance, {
      fileContents: await updateFileContents(appInstance, triggeredEvents),
    });
    changeFileCallback(true, false);
    // updated file is an asset file
  } else if (
    triggeredEvents.some(({ changedPath }) =>
      helpers.fileIsAssetFile(appInstance, changedPath)
    )
  ) {
    if (appInstance.get("config").ui.reloadAfterChanges.componentAssets) {
      changeFileCallback(true, false);
    }
    // updated a file which is watched by an extension like locales
  } else if (
    triggeredEvents.some(({ changedPath }) => {
      return foldersToWatch.some((folder) => {
        return changedPath.startsWith(folder);
      });
    })
  ) {
    changeFileCallback(true);
  } else {
    changeFileCallback();
  }
}

/**
 * @param {string[]} srcFolderIgnores - the components.ignores array from the user configuration
 * @returns {RegExp[]} array of regexes with all folders to ignore
 */
function getIgnoredPathsArr(srcFolderIgnores) {
  return [
    // ignore dotfiles
    /(^|[\/\\])\../ /* eslint-disable-line */,
    ...srcFolderIgnores.map((dir) => new RegExp(dir)),
  ];
}

module.exports = function Watcher(server, app) {
  appInstance = app;
  ioInstance = socketIo(server);

  const { components, assets, extensions } = appInstance.get("config");
  const ignored = getIgnoredPathsArr(components.ignores);

  foldersToWatch = [
    components.folder,
    ...assets.folder,
    ...assets.css,
    ...assets.js,
  ];

  for (const extension of extensions) {
    const ext = Array.isArray(extension) ? extension[0] : extension;
    const opts =
      Array.isArray(extension) && extension[1] ? extension[1] : { locales: {} };

    if (ext.extendWatcher) {
      const watch = ext.extendWatcher(opts);

      foldersToWatch.push(path.join(watch.folder, watch.lang));
    }
  }

  chokidar
    .watch(foldersToWatch, {
      ignoreInitial: true,
      ignored,
    })
    .on("all", (event, changedPath) => {
      triggeredEvents.push({ event, changedPath });

      if (!timeout) {
        console.clear();
        log("info", messages.updatingStarted);
        timeout = setTimeout(() => {
          timeout = null;
          handleFileChange();
        }, 10);
      }
    });
};
