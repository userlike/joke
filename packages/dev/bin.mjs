#!/usr/bin/env node

import process from "node:process";
import * as url from "node:url";

import { $ as $$, argv, ProcessOutput } from "zx";

const $ = $$({
  verbose: true,
  preferLocal: getBinPath(),
  shell: getCustomBashPath(),
});

const commonFlags = "--rootDir src";

const build = {
  esm: `tsc ${commonFlags} --outDir dist/esm --declaration true --declarationMap true`,
  cjs: `tsc ${commonFlags} --outDir dist/cjs --declaration true --declarationMap true --module commonjs --moduleResolution node10`,
};

const command = argv._.length === 1 ? argv._[0] : null;

try {
  if (command === "build") {
    await $`rimraf dist && cross-env NODE_ENV=production concurrently ${build.esm} ${build.cjs}`;
  }

  if (command === "lint") {
    await $`eslint -c eslint.config.ts src/**/*`;
  }

  if (command === "fix") {
    await $`eslint -c eslint.config.ts src/**/* --fix`;
  }
} catch (error) {
  if (error instanceof ProcessOutput) {
    // console.error(error.stderr);
    process.exit(error.exitCode);
  } else {
    console.error("Unexpected error:", error);
    process.exit(1);
  }
}

function getBinPath() {
  return `${url.fileURLToPath(new URL(".", import.meta.url))}node_modules/.bin`;
}

function getCustomBashPath() {
  return url.fileURLToPath(new URL("./bash.sh", import.meta.url));
}
