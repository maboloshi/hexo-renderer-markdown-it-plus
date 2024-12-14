/**
 * @Author: CHC
 * @Maintainer: D-Sketon
 * @Date:   2017-07-24T14:15:39+08:00
 * @Email:  chenhuachaoxyz@gmail.com
 * @Filename: renderer.js
 * @Last modified by:   CHC
 * @Last modified time: 2024-12-14T16:35:35+08:00
 * @License: MIT
 * @Copyright: 2017
 */

import type Hexo from "hexo";
import MarkdownIt from "markdown-it";

interface Plugin {
  name: string;
  enable: boolean;
  options?: Record<string, any>;
}

interface PluginConfig {
  plugin: Plugin;
}

interface MarkdownItConfig {
  html?: boolean;
  xhtmlOut?: boolean;
  breaks?: boolean;
  linkify?: boolean;
  typographer?: boolean;
  langPrefix?: string;
  quotes?: string;
  rawLaTeX?: boolean;
  plugins?: PluginConfig[];
}

const defPugsList: string[] = [
  "markdown-it-emoji",
  "markdown-it-sub",
  "markdown-it-sup",
  "markdown-it-deflist",
  "markdown-it-abbr",
  "markdown-it-footnote",
  "markdown-it-ins",
  "markdown-it-mark",
  "@vscode/markdown-it-katex",
  "markdown-it-toc-and-anchor",
];

/**
 * General Default markdown-it config.
 */
function checkValue(
  config: Record<string, any>,
  res: Record<string, any>,
  key: string,
  trueVal: any,
  falseVal: any
): void {
  res[key] =
    config[key] === true || config[key] === undefined || config[key] === null
      ? trueVal
      : falseVal;
}

/**
 * markdown-it default config
 */
function checkConfig(config: MarkdownItConfig): MarkdownItConfig {
  const res: MarkdownItConfig = {};
  checkValue(config, res, "html", true, false);
  checkValue(config, res, "xhtmlOut", true, false);
  checkValue(config, res, "breaks", true, false);
  checkValue(config, res, "linkify", true, false);
  checkValue(config, res, "typographer", true, false);
  res["rawLaTeX"] = config["rawLaTeX"] || false;
  res["langPrefix"] = config["langPrefix"] || "";
  res["quotes"] = config["quotes"] || "“”‘’";
  return res;
}

/**
 * General default plugin config
 */
function checkPlugins(
  pugs: PluginConfig[],
  config: MarkdownItConfig
): Plugin[] {
  const defPugsObj: Record<string, Plugin> = {};

  for (const pug of defPugsList) {
    defPugsObj[pug] = { name: pug, enable: true };
  }

  const result: Plugin[] = [];
  for (const pug of pugs) {
    if (!(pug instanceof Object) || !(pug.plugin instanceof Object)) continue;

    const pugName = pug.plugin.name;
    if (!pugName) continue;

    pug.plugin.enable =
      pug.plugin.enable == null || pug.plugin.enable !== true
        ? false
        : pug.plugin.enable;

    if (defPugsObj[pugName]) {
      defPugsObj[pugName] = pug.plugin;
    } else {
      result.push(pug.plugin);
    }
  }

  for (let i = defPugsList.length - 1; i >= 0; i--) {
    result.unshift(defPugsObj[defPugsList[i]]);
  }

  if (config.rawLaTeX) {
    // set markdown-it-katex to false
    for (let i = 0; i < result.length; i++) {
      if (result[i].name === "@vscode/markdown-it-katex") {
        result[i].enable = false;
        break;
      }
    }
  }

  return result;
}

export = function (this: Hexo, data: { text: string }): string {
  const config: MarkdownItConfig = this.config?.markdown_it_plus || {};
  const parseConfig = checkConfig(config);

  let md = MarkdownIt(parseConfig);

  config.plugins = config.plugins || [];
  const plugins = checkPlugins(config.plugins, config);

  if (config.rawLaTeX) {
    md.use(require("./markdown-it-raw-latex/index.js"));
  }

  md = plugins.reduce((mdInstance, pug) => {
    if (pug.enable) {
      let plugin = require(pug.name);
      if (pug.name === "markdown-it-toc-and-anchor") {
        pug.options = pug.options || {};
        if (!pug.options.anchorLinkSymbol) pug.options.anchorLinkSymbol = "";
        if (!pug.options.tocFirstLevel) pug.options.tocFirstLevel = 2;
      }
      if (
        typeof plugin !== "function" &&
        typeof plugin.default === "function"
      ) {
        plugin = plugin.default;
      }
      return pug.options
        ? mdInstance.use(plugin, pug.options)
        : mdInstance.use(plugin);
    }
    return mdInstance;
  }, md);

  return md.render(data.text);
};
