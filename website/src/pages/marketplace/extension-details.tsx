import React, { useEffect, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Extension, Version } from '@site/src/pages/marketplace/extension';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Heading from '@theme/Heading';
import Markdown from 'react-markdown'
import HomeBreadcrumbItem from '@theme/DocBreadcrumbs/Items/Home';
import Link from '@docusaurus/Link';

const MARKETPLACE_DETAILS_PREFIX = '/marketplace/details/';

function getParams(pathname: string): {
  publisherName: string,
  extensionName: string,
} {
  if(!pathname.startsWith(MARKETPLACE_DETAILS_PREFIX)) throw new Error('invalid url');

  let params = pathname.substring(MARKETPLACE_DETAILS_PREFIX.length);
  if(params.endsWith('/')) {
    params = params.substring(0, params.length - 1);
  }
  const parts = params.split('/');
  if(parts.length !== 2) throw new Error('invalid url');
  return {
    publisherName: parts[0],
    extensionName: parts[1],
  };
}

const ExtensionMarkdown: React.FC<{ extension: Extension}> = ({ extension } ) => {
  let lastest: Version = extension.versions.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0];
  let readme: string | undefined = lastest.files.find(({assetType }) => assetType === 'README')?.data;

  let [content, setContent] = useState<string | undefined>(undefined);

  useEffect(() => {
    if(!readme) return;

    fetch(readme)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text()
      })
      .then(setContent)
      .catch(error => console.error('There has been a problem with your fetch operation:', error))
  }, [readme]);

  if(!readme) return <span>no README</span>
  if(!content) return <span>no content</span>

  return (
    <span>
      <Markdown>{content}</Markdown>
    </span>
  );
}

const ExtensionDetails: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  const location = useLocation();
  const { publisherName, extensionName } = getParams(location.pathname);

  const [ extension, setExtension ] = useState<Extension | undefined>(undefined);
  const [ loading, setLoading ] = useState<boolean>(false);

  useEffect(() => {
    if(loading) return;
    setLoading(true);

    // If you're using Create React App and the file is in the public folder
    fetch('https://registry.podman-desktop.io/api/extensions.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const e = (data['extensions'] as Array<Extension>).find((e) => e.extensionName === extensionName && e.publisher.publisherName === publisherName);
        if(!e) throw new Error(`extension with name ${extensionName} and publisher ${publisherName} not found`);
        setExtension(e);
      })
      .catch(error => console.error('There has been a problem with your fetch operation:', error))
      .finally(() => {
        setLoading(false);
      });
  }, [location]);

  if(!extension) return <>extension not found</>

  return (
    <Layout title={siteConfig.title} description="Extension details" wrapperClassName="h-full">
      <TailWindThemeSelector />
      <nav className="container">
        <ul className="breadcrumbs">
          <HomeBreadcrumbItem/>

          <li className="breadcrumbs__item">
            <Link className="breadcrumbs__link" href="/marketplace">
              <span>Marketplace</span>
            </Link>
          </li>

          <li className="breadcrumbs__item breadcrumbs__item--active">
            <div className="breadcrumbs__link">
              <span>{extension.displayName}</span>
            </div>
          </li>

        </ul>
      </nav>

      <main>
        <section className="margin-top--lg margin-bottom--lg text--center">
          <Heading as="h1">{extension.displayName}</Heading>
          <a className="button button--primary" href={`podman-desktop:extension/${publisherName}.${extensionName}`}>
            Install
          </a>
        </section>

        <section className="margin-bottom--xl container">
          <ExtensionMarkdown extension={extension} />
        </section>
      </main>
    </Layout>

  );
};

export default ExtensionDetails;
