import { NodePath } from "@babel/core";
import * as t from "@babel/types";

declare function addSideEffect(path: NodePath, moduleName: string): void;

declare function addNamed(
  path: NodePath,
  name: string,
  moduleName: string,
  opts?: { nameHint: string }
): t.Identifier;

declare function addDefault(
  path: NodePath,
  moduleName: string,
  opts: { nameHint: string }
): t.Identifier;

declare function addNamespace(path: NodePath, moduleName: string): t.Identifier;
