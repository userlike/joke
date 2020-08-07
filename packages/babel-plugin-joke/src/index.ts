import { pipe } from "fp-ts/lib/pipeable";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { addNamespace } from "@babel/helper-module-imports";
import { PluginObj } from "@babel/core";
import { Binding, NodePath } from "@babel/traverse";
import {
  Program,
  Expression,
  ArgumentPlaceholder,
  JSXNamespacedName,
  SpreadElement,
  ArrowFunctionExpression
} from "@babel/types";

const JOKE_MODULE = "@userlike/joke";
const JOKE_MOCK = "mock";
const JOKE_MOCK_SOME = "mockSome";
const JEST = "jest";
const JEST_MOCK = "mock";
const JEST_GEN_MOCK_FROM_MODULE = "genMockFromModule";
const JEST_REQUIRE_ACTUAL = "requireActual";

type B = typeof import("@babel/core");
type T = B["types"];

enum MockExtendType {
  ExtendMocked,
  ExtendActual
}

export default function UserlikeJoke({ types: t }: B): PluginObj {
  return {
    name: "@userlike/babel-plugin-joke",
    visitor: {
      Program(path): void {
        const mockCalls = getJokeMockCalls(t, path, JOKE_MOCK);
        mockCalls.forEach(
          convertMockCalls(t, path, MockExtendType.ExtendMocked)
        );

        const mockSomeCalls = getJokeMockCalls(t, path, JOKE_MOCK_SOME);
        mockSomeCalls.forEach(
          convertMockCalls(t, path, MockExtendType.ExtendActual)
        );
      }
    }
  };
}

function getJokeMockCalls(
  t: T,
  path: NodePath<Program>,
  fnName: string
): NodePath[] {
  const statements = path.node.body;
  const namedMockRefs = statements
    .filter(pred(t.isImportDeclaration))
    .filter(s => s.source.value === JOKE_MODULE)
    .flatMap(s => s.specifiers)
    .filter(pred(t.isImportSpecifier))
    .filter(s => s.imported.name === fnName)
    .map(s => s.local.name)
    .map(ref => path.scope.getBinding(ref))
    .filter((ref): ref is Binding => ref !== undefined)
    .flatMap(ref => ref.referencePaths);

  const namespaceMockRefs = statements
    .filter(pred(t.isImportDeclaration))
    .filter(s => s.source.value === JOKE_MODULE)
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
        memberExpr.property.name !== fnName
      )
        return false;
      return true;
    })
    .map(path => path.parentPath);

  const mockRefPaths = namedMockRefs.concat(namespaceMockRefs).filter(path => {
    if (path.scope.getProgramParent() !== path.scope) {
      throw new Error("Can only use `mock` at the top-level scope.");
    }
    return true;
  });

  return mockRefPaths;
}

function convertMockCalls(
  t: typeof import("@babel/types"),
  path: NodePath<Program>,
  mockExtendType: MockExtendType
): (mockRef: NodePath) => void {
  return (mockPath): void => {
    const callPath = mockPath.parentPath;
    const call = mockPath.parent;

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
      A.findLast(p => t.isImportDeclaration(p.node)),
      O.map(lastImportPath => (): void =>
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
                      mockExtendType
                    )
                  ]
            )
          )
        )
      ),
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
  mockType: MockExtendType
): ArrowFunctionExpression {
  invariant(
    t.isFunctionExpression(impl) || t.isArrowFunctionExpression(impl),
    `Unexpected second argument to \`mock\` of type ${impl.type}, expected FunctionExpression of ArrowFunctionExpression.`
  );
  const iife = t.callExpression(impl, []);
  const requireMock = t.callExpression(
    t.memberExpression(
      t.identifier(JEST),
      t.identifier(
        mockType === MockExtendType.ExtendMocked
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
