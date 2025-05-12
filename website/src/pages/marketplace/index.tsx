import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { Extension } from './extension';
import ExtensionCard from '@site/src/pages/marketplace/extension-card';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Heading from '@theme/Heading';
import FavoriteIcon from '@site/src/components/FavoriteIcon';

const Marketplace: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  const [ data, setData ] = useState<Array<Extension>>([]);
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
      .then(data => setData(data['extensions']))
      .catch(error => console.error('There has been a problem with your fetch operation:', error))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Layout title={siteConfig.title} description="Marketplace" wrapperClassName="h-full">
      <TailWindThemeSelector />

      <main>
        <section className="margin-top--lg margin-bottom--lg text--center">
          <Heading as="h1">Extension Marketplace</Heading>
          <p>List of Podman Desktop extensions</p>
        </section>

        <section className="margin-bottom--xl container">
          <Heading as="h2">
            Our  favorites
            <FavoriteIcon size="large" style={{marginLeft: '1rem'}} />
          </Heading>

          <div className="body-font grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr)'}}>
            {data.map((extension) => (<ExtensionCard extension={extension}/>))}
          </div>
        </section>
      </main>

    </Layout>
  );
};

export default Marketplace;
