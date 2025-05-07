export interface Version {
  version: string;
  preview: string;
  lastUpdated: string;
  ociUri: string;
  files: Array<{
    assetType: string;
    data: string;
  }>
}

export interface Extension {
  publisher: {
    publisherName: string;
    displayName: string;
  },
  shortDescription: string;
  extensionName: string;
  displayName: string;
  license: string;
  categories: Array<string>;
  keywords: Array<string>;
  versions: Array<Version>
}
