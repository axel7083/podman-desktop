/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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
 ***********************************************************************/
/* eslint-env node */
import type { CoverageProvider, CoverageProviderModule, ResolvedCoverageOptions, Vitest } from 'vitest';
import { resolve } from 'node:path';
import { coverageConfigDefaults } from 'vitest/config';
import type {
  DeclarationReflection,
  ProjectReflection} from 'typedoc';
import {
  Application,
  ReflectionKind,
  TSConfigReader,
  TypeDocReader,
} from 'typedoc';
import { existsSync, promises as fs } from 'node:fs';

type Summary = {
  name: string,
  kind: ReflectionKind,
  hasComment: boolean,
  children: Summary[],
  actual: number,
  expected: number,
}

const DocsCoverageProviderModule: CoverageProviderModule = {
  getProvider(): CoverageProvider {
    return new DocsCoverageProvider();
  },
};

const computeCoverage = (kinds: number, reflection: DeclarationReflection): Summary => {
  let actual = reflection.hasComment()?1:0;
  let expected = 1;

  const childrenSummaries = (reflection.children || []).map(child => computeCoverage(kinds, child));
  childrenSummaries.forEach((child) => {
    actual += child.actual;
    expected += child.expected;
  });

  return {
    name: reflection.name,
    kind: reflection.kind,
    hasComment: reflection.hasComment(),
    children: childrenSummaries,
    actual: actual,
    expected: expected,
  };
};

const formatCoverage = (summary: Summary): string => {
  const header = `| Name | Has Documentation |\n|---|---|\n`;
  let body = '';
  if(summary.kind === ReflectionKind.Interface || summary.kind === ReflectionKind.Namespace) {

    const percent = summary.expected
      ? Math.floor((100 * summary.actual) / summary.expected)
      : 0;

    body = `## ${summary.name} ${percent}% (_${ReflectionKind[summary.kind]}_)\n${header}`;
  } else {
    body = `| ${summary.name} (_${ReflectionKind[summary.kind]}_) | ${summary.hasComment?'✅':'❌'} |\n`;
  }

  const children = summary.children.map(formatCoverage).join('');

  return `${body}${children}`;
};

const generateSummary = (kinds: number, project: ProjectReflection): string => {
  if (kinds & ReflectionKind.Constructor) {
    kinds |= ReflectionKind.ConstructorSignature;
    kinds = kinds & ~ReflectionKind.Constructor;
  }
  if (kinds & ReflectionKind.Accessor) {
    kinds |= ReflectionKind.GetSignature | ReflectionKind.SetSignature;
    kinds = kinds & ~ReflectionKind.Accessor;
  }

  const reflections: DeclarationReflection[] = Object.values(project.reflections)
    .reduce((previousValue, reflection) => {
      if(reflection.isDeclaration() && reflection.kindOf(ReflectionKind.Namespace | ReflectionKind.Interface))
        return [...previousValue, reflection];
      return previousValue;
    }, [] as DeclarationReflection[]);

  return reflections.map((reflection) => formatCoverage(computeCoverage(kinds, reflection))).join('\n');
};

class DocsCoverageProvider implements CoverageProvider {
  name = 'docs-coverage-provider';
  options!: ResolvedCoverageOptions;
  coverageFilesDirectory!: string;

  resolveOptions = (): ResolvedCoverageOptions => this.options;

  async clean(clean?: boolean): Promise<void> {
    if (clean && existsSync(this.options.reportsDirectory))
      await fs.rm(this.options.reportsDirectory, { recursive: true, force: true, maxRetries: 10 });

    if (existsSync(this.coverageFilesDirectory))
      await fs.rm(this.coverageFilesDirectory, { recursive: true, force: true, maxRetries: 10 });

    await fs.mkdir(this.coverageFilesDirectory, { recursive: true });
  }
  onAfterSuiteRun(): void { /* nothing required */ }
  onFileTransform?(): void { /* no need to transform */ }

  initialize(ctx: Vitest) {
    const config = ctx.config.coverage;

    this.options = {
      ...config,
      reportsDirectory: resolve(ctx.config.root, config.reportsDirectory || coverageConfigDefaults.reportsDirectory),
    };

    this.coverageFilesDirectory = resolve(this.options.reportsDirectory);
  }

  async reportCoverage(): Promise<void> {
    console.log(`creating coverage report in ${this.coverageFilesDirectory}.`);

    const app: Application = await Application.bootstrapWithPlugins({
      tsconfig: 'tsconfig.json',
      entryPoints: ['src/extension-api.d.ts'],
      requiredToBeDocumented: [
        'Enum',
        'EnumMember',
        'Variable',
        'Function',
        'Class',
        'Interface',
        'Property',
        'Method',
        'Accessor',
        'TypeAlias',
        'Namespace',
      ],
    }, [new TypeDocReader(), new TSConfigReader()]);

    // Ensure the initialization has not produced errors
    if(app.logger.hasErrors())
      throw new Error('Something went wrong with the app initialization.');

    const project = await app.convert();
    // Ensure the project is properly converted
    if(project === undefined)
      throw new Error('Something went wrong while converting the application.');

    const children = project.children;
    // Ensure the project has children
    if(children === undefined)
      throw new Error('Something went wrong the project has no children.');

    const summary = generateSummary(
      app.options.getValue('requiredToBeDocumented')
        .reduce((acc, kindName) => acc | ReflectionKind[kindName], 0),
      project,
    );

    const filename = resolve(this.coverageFilesDirectory, `report.md`);
    await fs.writeFile(filename, summary, 'utf-8');
  }
}

export default DocsCoverageProviderModule;
