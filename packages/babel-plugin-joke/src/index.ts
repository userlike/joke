import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { addNamespace } from "@babel/helper-module-imports";
import type { PluginObj } from "@babel/core";
import type { Binding, NodePath } from "@babel/traverse";
import {
  Program,
  Expression,
  ArgumentPlaceholder,
  JSXNamespacedName,
  SpreadElement,
  ArrowFunctionExpression,
  FunctionExpression,
} from "@babel/types";

const JOKE_MODULE = "@userlike/joke";
const JOKE_MOCK = "mock";
const JOKE_MOCK_SOME = "mockSome";
const JOKE_MOCK_ALL = "mockAll";
const JEST = "jest";
const JEST_MOCK = "mock";
const JEST_GEN_MOCK_FROM_MODULE = "genMockFromModule";
const JEST_REQUIRE_ACTUAL = "requireActual";

type B = typeof import("@babel/core");
type T = B["types"];

enum MockType {
  MockAll,
  ExtendMocked,
  ExtendActual,
}

export default function UserlikeJoke({ types: t }: B): PluginObj {
  return {
    name: "@userlike/babel-plugin-joke",
    visitor: {
      Program(path): void {
        const mockCalls = getJokeMockCalls(t, path, JOKE_MOCK);
        mockCalls.forEach(convertMockCalls(t, path, MockType.ExtendMocked));

        const mockSomeCalls = getJokeMockCalls(t, path, JOKE_MOCK_SOME);
        mockSomeCalls.forEach(convertMockCalls(t, path, MockType.ExtendActual));

        const mockAllCalls = getJokeMockCalls(t, path, JOKE_MOCK_ALL);
        mockAllCalls.forEach(convertMockCalls(t, path, MockType.MockAll));
      },
    },
  };
}

function getJokeMockCalls(
  t: T,
  path: NodePath<Program>,
  fnName: string
): NodePath[] {
  const statements = path.node.body;

  const importSpecifiers = pipe(
    statements,
    A.filter(pred(t.isImportDeclaration)),
    A.filter((s) => s.source.value === JOKE_MODULE),
    A.chain((s) => s.specifiers)
  );

  const namedMockRefs = pipe(
    importSpecifiers,
    A.filter(pred(t.isImportSpecifier)),
    A.filter((s) => s.imported.name === fnName),
    A.map((s) => s.local.name),
    A.map((ref) => path.scope.getBinding(ref)),
    A.filter((ref): ref is Binding => ref !== undefined),
    A.chain((ref) => ref.referencePaths)
  );

  const namespaceMockRefs = pipe(
    importSpecifiers,
    A.filter(pred(t.isImportNamespaceSpecifier)),
    A.map((s) => s.local.name),
    A.map((ref) => path.scope.getBinding(ref)),
    A.filter((ref): ref is Binding => ref !== undefined),
    A.chain((ref) => ref.referencePaths),
    A.filter((path) => {
      const M = path.node;
      const memberExpr = path.parent;
      if (!t.isMemberExpression(memberExpr)) return false;
      if (memberExpr.object !== M) return false;
      if (
        !t.isIdentifier(memberExpr.property) ||
        memberExpr.property.name !== fnName
      )
        return false;
      return true;
    }),
    A.filterMap((path) => O.fromNullable(path.parentPath))
  );

  const mockRefPaths = pipe(
    namedMockRefs,
    A.alt(() => namespaceMockRefs),
    A.filter((path) => {
      if (path?.scope.getProgramParent() !== path.scope) {
        throw new Error("Can only use `mock` at the top-level scope.");
      }
      return true;
    })
  );

  return mockRefPaths;
}

function convertMockCalls(
  t: typeof import("@babel/types"),
  path: NodePath<Program>,
  mockType: MockType
): (mockRef: NodePath) => void {
  return (mockPath): void => {
    const callPath = mockPath.parentPath;
    const call = mockPath.parent;

    invariant(callPath !== null, "Unexpected error: callPath is null.");
    invariantPath(t.isCallExpression(call), callPath);

    const asyncImport = call.arguments[0];
    const moduleImplementation: typeof call.arguments[1] | undefined =
      call.arguments[1];

    invariantPath(t.isCallExpression(asyncImport), callPath);
    invariantPath(t.isImport(asyncImport.callee), callPath);
    invariantPath(asyncImport.arguments.length === 1, callPath);

    const moduleNameLiteral = asyncImport.arguments[0];
    invariantPath(t.isStringLiteral(moduleNameLiteral), callPath);
    const moduleName = moduleNameLiteral.value;

    const namespaceName = addNamespace(path, moduleName);
    callPath.replaceWith(t.identifier(namespaceName.name));

    const insertJestMockIO = pipe(
      path.get("body"),
      A.findLast((p) => t.isImportDeclaration(p.node)),
      O.map((lastImportPath) => (): void => {
        lastImportPath.insertAfter(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(t.identifier(JEST), t.identifier(JEST_MOCK)),
              moduleImplementation === undefined
                ? [t.stringLiteral(moduleName)]
                : [
                    t.stringLiteral(moduleName),
                    mockImplementation(
                      t,
                      moduleName,
                      moduleImplementation,
                      mockType
                    ),
                  ]
            )
          )
        );
      }),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      O.getOrElse(() => (): void => {})
    );

    insertJestMockIO();
  };
}

/**
 * Converts `() => x` to `() => Object.assign({}, jest.genMockFromModul('modulename'), (() => x)())`.
 */
function mockImplementation(
  t: T,
  moduleName: string,
  impl: Expression | SpreadElement | JSXNamespacedName | ArgumentPlaceholder,
  mockType: MockType
): FunctionExpression | ArrowFunctionExpression {
  invariant(
    t.isFunctionExpression(impl) || t.isArrowFunctionExpression(impl),
    `Unexpected second argument to \`mock\` of type ${impl.type}, expected FunctionExpression of ArrowFunctionExpression.`
  );

  if (mockType === MockType.MockAll) {
    return impl;
  }

  const iife = t.callExpression(impl, []);
  const requireMock = t.callExpression(
    t.memberExpression(
      t.identifier(JEST),
      t.identifier(
        mockType === MockType.ExtendMocked
          ? JEST_GEN_MOCK_FROM_MODULE
          : JEST_REQUIRE_ACTUAL
      )
    ),
    [t.stringLiteral(moduleName)]
  );
  const objectAssign = t.callExpression(
    t.memberExpression(
      t.memberExpression(t.identifier("global"), t.identifier("Object")),
      t.identifier("assign")
    ),
    [t.objectExpression([]), requireMock, iife]
  );
  const wrappedImpl = t.arrowFunctionExpression([], objectAssign);
  return wrappedImpl;
}

function pred<T, R extends T>(predicate: (x: T) => x is R): (x: T) => x is R {
  return predicate;
}

function invariantPath(condition: boolean, path: NodePath): asserts condition {
  if (condition) return;
  throwErr(path);
}

function invariant(condition: boolean, msg: string): asserts condition {
  if (condition) return;
  throw new Error(msg);
}

function throwErr(path: NodePath): never {
  throw new Error(
    "\n" +
      "`mock` must be used like:\n\n" +
      "mock(import('moduleName'))\n\n" +
      "Instead saw:\n\n" +
      path.getSource() +
      "\n\n"
  );
}
