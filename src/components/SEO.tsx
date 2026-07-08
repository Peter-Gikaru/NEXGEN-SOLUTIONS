import React from 'react';
import { Helmet } from 'react-helmet-async';
interface SEOProps {
  title: string;
  description: string;
  type?: string;
  url?: string;
  image?: string;
  schema?: Record<string, any> | Record<string, any>[];
}
export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  type = 'website', 
  url,
  image,
  schema 
}) => {
  const defaultUrl = 'https://yourdomain.co.ke';
  const currentUrl = url ? `${defaultUrl}${url}` : defaultUrl;
  let finalSchema = schema;
  if (Array.isArray(schema)) {
    finalSchema = {
      '@context': 'https://schema.org',
      '@graph': schema.map(item => {
        const { '@context': _, ...rest } = item as Record<string, unknown>;
        return rest;
      })
    };
  }
  const safeJsonLd = finalSchema 
    ? JSON.stringify(finalSchema).replace(/</g, '\\u003c')
    : null;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
      {}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      {image && <meta property="twitter:image" content={image} />}
      {}
      {safeJsonLd && (
        <script type="application/ld+json">
          {safeJsonLd}
        </script>
      )}
    </Helmet>
  );
};
