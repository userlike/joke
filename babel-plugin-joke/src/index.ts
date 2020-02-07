import { pipe } from "fp-ts/lib/pipeable";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { addNamed, addNamespace } from "@babel/helper-module-imports";
import { PluginObj } from "@babel/core";
import { Binding, NodePath } from "@babel/traverse";
import { Program } from "@babel/types";

const MODULE_NAME = "@userlike/joke";
const IMPORT_FN = "mock";
const GLOBAL_JEST = "jest";
const GLOBAL_JEST_FN = "mock";

export default function UserlikeJoke({
  types: t
}: typeof import("@babel/core")): PluginObj {
  return {
    name: "@userlike/babel-plugin-joke",
    visitor: {
      Program(path) {
        const statements = path.node.body;
        const namedMockRefs = statements
          .filter(pred(t.isImportDeclaration))
          .filter(s => s.source.value === MODULE_NAME)
          .flatMap(s => s.specifiers)
          .filter(pred(t.isImportSpecifier))
          .filter(s => s.imported.name === IMPORT_FN)
          .map(s => s.local.name)
          .map(ref => path.scope.getBinding(ref))
          .filter((ref): ref is Binding => ref !== undefined)
          .flatMap(ref => ref.referencePaths);

        const namespaceMockRefs = statements
          .filter(pred(t.isImportDeclaration))
          .filter(s => s.source.value === MODULE_NAME)
          .flatMap(s => s.specifiers)
          .filter(pred(t.isImportNamespaceSpecifier))
          .map(s => s.local.name)
          .map(ref => path.scope.getBinding(ref))
          .filter((ref): ref is Binding => ref !== undefined)
          .flatMap(ref => ref.referencePaths)
          .filter(path => {
            const M = path.node;
            const memberExpr = path.parent;
            if (!t.isMemberExpression(memberExpr)) return false;
            if (memberExpr.object !== M) return false;
            if (
              !t.isIdentifier(memberExpr.property) ||
              memberExpr.property.name !== "mock"
            )
              return false;
            return true;
          })
          .map(path => path.parentPath);

        const mockRefPaths = namedMockRefs.concat(namespaceMockRefs);

        mockRefPaths.forEach(process(t, path));
      }
    }
  };
}

function process(
  t: typeof import("@babel/types"),
  path: NodePath<Program>
): (mockRef: NodePath) => void {
  return mockPath => {
    const callPath = mockPath.parentPath;
    const call = mockPath.parent;

    invariant(t.isCallExpression(call), callPath);

    const asyncImport = call.arguments[0];
    invariant(t.isCallExpression(asyncImport), callPath);
    invariant(t.isImport(asyncImport.callee), callPath);
    invariant(asyncImport.arguments.length === 1, callPath);

    const moduleNameLiteral = asyncImport.arguments[0];
    invariant(t.isStringLiteral(moduleNameLiteral), callPath);
    const moduleName = moduleNameLiteral.value;

    const declaratorPath = callPath.parentPath;
    const declarator = declaratorPath.node;

    invariant(t.isVariableDeclarator(declarator), declaratorPath);

    const lval = declarator.id;

    invariant(t.isObjectPattern(lval) || t.isIdentifier(lval), declaratorPath);

    if (t.isObjectPattern(lval)) {
      const namedImports = lval.properties.map(p => {
        invariant(!t.isRestElement(p), declaratorPath);
        invariant(t.isIdentifier(p.key), declaratorPath);
        invariant(t.isIdentifier(p.value), declaratorPath);
        return [p.key.name, p.value.name];
      });
      namedImports.forEach(([k, v]) => {
        const newName = addNamed(path, k, moduleName, { nameHint: v });
        path.scope.rename(v, newName.name);
      });
    } else {
      const oldName = lval.name;
      const newName = addNamespace(path, moduleName);
      path.scope.rename(oldName, newName.name);
    }

    const declarationPath = declaratorPath.parentPath;
    const declaration = declarationPath.node;
    invariant(t.isVariableDeclaration(declaration), declarationPath);

    const idx = declaration.declarations.findIndex(d => d === declarator);
    declaration.declarations.splice(idx, 1);

    if (declaration.declarations.length === 0) {
      declarationPath.remove();
    }

    const insertionIO = pipe(
      path.get("body"),
      A.findLast(p => t.isImportDeclaration(p.node)),
      O.map(lastImportPath => () =>
        lastImportPath.insertAfter(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(GLOBAL_JEST),
                t.identifier(GLOBAL_JEST_FN)
              ),
              [t.stringLiteral(moduleName)]
            )
          )
        )
      ),
      O.getOrElse(() => () => {})
    );
    insertionIO();
  };
}

function pred<T, R extends T>(predicate: (x: T) => x is R): (x: T) => x is R {
  return predicate;
}

function invariant(condition: boolean, path: NodePath): asserts condition {
  if (condition) return;
  throwErr(path);
}
function throwErr(path: NodePath): never {
  throw new Error(
    "\n" +
      "`mock` must be used like:\n\n" +
      "const { foo } = mock(import('moduleName'))\n\n" +
      "Instead saw:\n\n" +
      path.getSource() +
      "\n\n"
  );
}
