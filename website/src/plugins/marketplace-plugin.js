import path from 'node:path';
import {normalizeUrl, posixPath} from '@docusaurus/utils';

/**
 * Dynamic routing in docusaurus is complicated
 * Here is some references
 * https://github.com/facebook/docusaurus/issues/4710
 * https://github.com/facebook/docusaurus/issues/10564#issuecomment-2399308347
 * Copy logic from https://github.com/facebook/docusaurus/blob/main/website/src/plugins/featureRequests/FeatureRequestsPlugin.js
 *
 * @param {import('@docusaurus/types').LoadContext} context
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function FeatureRequestsPlugin(context) {
  return {
    name: 'feature-requests-plugin',
    async contentLoaded({actions}) {
      const basePath = normalizeUrl([context.baseUrl, '/marketplace/details/']);
      const paths = await actions.createData(
        'paths.json',
        JSON.stringify(basePath),
      );

      // TODO Docusaurus v4 breaking change
      //  module aliasing should be automatic
      //  we should never find local absolute FS paths in the codegen registry
      const aliasedSource = (source) =>
        `@generated/${posixPath(
          path.relative(context.generatedFilesDir, source),
        )}`;

      actions.addRoute({
        path: basePath,
        exact: false,
        component: '@site/src/pages/marketplace/extension-details',
        modules: {
          basePath: aliasedSource(paths),
        },
      });
    },
  };
}
