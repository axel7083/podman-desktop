import React from 'react';
import { Extension, Version } from './extension';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import { hashCode, intToRGB } from '@site/src/pages/marketplace/colors-utils';
import './marketplace.css';

export interface Props {
  extension: Extension;
}

function getVersionIcon(version: Version): string | undefined {
  return version.files.find(({ assetType }) => assetType === 'icon')?.data;
}

const ExtensionCard: React.FC<Props> = ({ extension }) => {
  let lastest: Version = extension.versions.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0];
  let icon: string | undefined = getVersionIcon(lastest);

  return (
    <li
      key={extension.extensionName}
      className="card shadow--md text-[#1c1e21] dark:text-[#e3e3e3]">
      <div className="card__body flex flex-col gap-y-1">
        <div className="flex justify-center items-center">
          {icon?<img className="h-[50px]" src={icon}/>:undefined}
        </div>
        <div className="flex items-center justify-between">
          <Heading as="h4" className="mb-0">
            <Link
              href={`/marketplace/details/${extension.publisher.publisherName}/${extension.extensionName}`}
            >
              {extension.displayName}
            </Link>
          </Heading>
          <Link
            href="#"
            className="button button--secondary button--sm">
            Source
          </Link>
        </div>
        <p className="text-xs">{extension.shortDescription}</p>
        <ul className="flex flex-wrap pl-0">
          {extension.keywords.map((keyword) => (
            <li className="tag" key={keyword} >
              <span className="textLabel">{keyword}</span>
              <div className="colorLabel" style={{ backgroundColor: intToRGB(hashCode(keyword))}}></div>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default ExtensionCard;
