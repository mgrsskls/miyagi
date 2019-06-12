const fs = require("fs");
const path = require("path");

let app;

function partialPath(partial) {
  return partial;
}

function getNavStructure(srcStructure) {
  const arr = [];

  (function restructure(str) {
    str.forEach(s => {
      if (s.type === "directory") {
        if (
          s.children &&
          s.children.length &&
          s.children.filter(
            child =>
              child.name.replace(`.${app.get("config").extension}`, "") ===
                s.name && child.extension === `.${app.get("config").extension}`
          )[0]
        ) {
          const partial = s.children.filter(
            child =>
              child.name.replace(`.${app.get("config").extension}`, "") ===
                s.name && child.extension === `.${app.get("config").extension}`
          )[0];

          if (partial) {
            arr.push({
              type: s.type,
              name: partial.name,
              path: partial.path,
              shortPath: partial.shortPath,
              extension: partial.extension,
              variations: s.variations,
              children: s.children,
              id: partial.shortPath
                .replace(/\//g, "-")
                .replace(/\./g, "-")
                .replace(/_/g, "")
            });
          }
        } else {
          arr.push({
            type: s.type,
            name: s.name,
            path: s.path,
            shortPath: s.shortPath,
            extension: s.extension,
            children: s.children,
            id: s.shortPath
              ? s.shortPath
                  .replace(/\//g, "-")
                  .replace(/\./g, "-")
                  .replace(/_/g, "")
              : ""
          });
        }
      }

      if (str.children && str.children.length > 1) {
        restructure(str);
      }
    });
  })(srcStructure);

  return arr;
}

function renderMenu(structure, currentPattern, currentVariation, id) {
  const list = getNavStructure(structure);
  let html = "";

  if (list.length) {
    let test = "";

    if (id) {
      test = ` id="${id}" hidden`;
    }

    html += `<ul class="Nav-list"${test}>`;

    list.forEach(child => {
      let current = "";

      html += '<li class="Nav-item">';

      if (child.type === "directory") {
        if (currentPattern === child.shortPath && !currentVariation) {
          current = ' aria-current="page"';
        }

        if (child.shortPath) {
          if (
            (child.variations && child.variations.length) ||
            (child.children &&
              child.children.filter(c => c.type === "directory").length)
          ) {
            html += `<button class="Nav-toggle" aria-controls="${
              child.id
            }" aria-expanded="false" title="Toggle submenu"></button>`;
          }

          html += `<a class="Nav-component Nav-link" href="?pattern=${
            child.shortPath
          }">${child.name}</a>`;
        } else {
          html += `<span class="Nav-component is-disabled">${
            child.name
          }</span>`;
        }

        if (child.variations && child.variations.length) {
          html += `<ul class="Nav-list" id="${child.id}" hidden>`;
          child.variations.forEach(variation => {
            let current = "";
            if (
              currentPattern === child.shortPath &&
              currentVariation === variation.name
            ) {
              current = ' aria-current="page"';
            }

            html += '<li class="Nav-item">';
            html += `<a class="Nav-link Nav-link--variation" target="content" href="?pattern=${
              child.shortPath
            }&variation=${encodeURI(variation.name)}"${current}>${
              variation.name
            }</a>`;
            html += "</li>";
          });
          html += "</ul>";
        }
      } else if (child.type === "file") {
        if (currentPattern === child.shortPath && !currentVariation) {
          current = ' aria-current="page"';
        }

        html += `<a class="Nav-component Nav-link" target="content" href="?pattern=${
          child.shortPath
        }"${current}>${child.name}</a>`;
      }

      if (child.children) {
        html += renderMenu(
          child.children,
          currentPattern,
          currentVariation,
          child.id
        );
      }

      html += "</li>";
    });

    html += "</ul>";
  }

  return html;
}

function cssFiles() {
  let html = "<style>";
  app.get("config").cssFiles.forEach(file => {
    const sanitizedFilePath = file.replace(/\0/g, "");
    const filePath = path.join(process.cwd(), sanitizedFilePath);
    let readFile;

    try {
      readFile = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      console.warn(`WARNING: CSS file ${filePath} not found.`);
    }

    html += readFile;
  });
  html += "</style>";
  return html;
}

function jsFiles() {
  let html = "<script>";
  app.get("config").jsFiles.forEach(file => {
    const sanitizedFilePath = file.replace(/\0/g, "");
    const filePath = path.join(process.cwd(), sanitizedFilePath);
    let readFile;

    try {
      readFile = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      console.warn(`WARNING: JS file ${filePath} not found.`);
    }

    html += readFile;
  });
  html += "</script>";
  return html;
}

module.exports = (appInstance, hbsInstance) => {
  app = appInstance;
  hbsInstance.registerHelper("partialPath", partialPath);
  hbsInstance.registerHelper("renderMenu", renderMenu);
  hbsInstance.registerHelper("cssFiles", cssFiles);
  hbsInstance.registerHelper("jsFiles", jsFiles);
};
