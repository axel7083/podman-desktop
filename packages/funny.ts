/*********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ********************************************************************/

import { Project, Node, ts, SyntaxKind  } from "ts-morph";

const project = new Project({
  tsConfigFilePath: 'renderer/tsconfig.json',
});

const source = project.getSourceFile('renderer/src/demo-ts-morph.spec.ts');

const nodes = source.getChildren();

source.transform(traversal => {
  const node = traversal.visitChildren();

  if(!ts.isCallExpression(node)) return node;

  const children = node.getChildren();
  if(children.length !== 4) return node;

  const [ expression,, callArguments, ] = children;

  // ensure expression is PropertyAccessExpression
  if (expression.kind !== SyntaxKind.PropertyAccessExpression) return node;
  // ensure list of arguments is a list
  if (callArguments.kind !== SyntaxKind.SyntaxList) return node;

  const viChildren = expression.getChildren();
  if(viChildren.length !== 3) return node;
  const [ vitest, _, spyOn ] = viChildren;

  if (vitest.kind !== SyntaxKind.Identifier) return node;
  if (spyOn.kind !== SyntaxKind.Identifier) return node;

  // ensure expression is `vi.spyOn`
  if(vitest.getText() !== 'vi') return node;
  if(spyOn.getText() !== 'spyOn') return node;

  // ensure call arguments are `window, "<method>"`
  const args = callArguments.getChildren();
  if(args.length !== 3) return node;
  console.log('call chain', node.getFullText());

  const [ arg1, , arg2 ] = args;

  if(arg1.kind !== SyntaxKind.Identifier) return node;
  if(arg2.kind !== SyntaxKind.StringLiteral) return node;

  return traversal.factory.createCallExpression(
    traversal.factory.createPropertyAccessExpression(
      traversal.factory.createIdentifier("vi"),
      traversal.factory.createIdentifier("mocked")
    ),
    undefined,
    [
      traversal.factory.createPropertyAccessExpression(
        traversal.factory.createIdentifier(arg1.getText()),
        traversal.factory.createIdentifier(arg2.getText())
      )
    ]
  );
});

project.save();
