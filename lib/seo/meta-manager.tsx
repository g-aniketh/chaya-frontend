"use client";

import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  alternate?: {
    hreflang: string;
    href: string;
  }[];
  structuredData?: any;
}

const defaultSEO = {
  title: "Chaya - Agricultural Management System",
  description: "Comprehensive agricultural management system for farmers, procurement, processing, and sales tracking.",
  keywords: ["agriculture", "farming", "procurement", "processing", "sales", "management"],
  image: "/og-image.jpg",
  url: "https://chaya.example.com",
  type: "website" as const,
  author: "Chaya Team",
};

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  noindex,
  nofollow,
  canonical,
  alternate,
  structuredData,
}: SEOProps) {
  const seo = {
    title: title ? `${title} | ${defaultSEO.title}` : defaultSEO.title,
    description: description || defaultSEO.description,
    keywords: keywords ? [...defaultSEO.keywords, ...keywords] : defaultSEO.keywords,
    image: image || defaultSEO.image,
    url: url || defaultSEO.url,
    type: type || defaultSEO.type,
    author: author || defaultSEO.author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    noindex,
    nofollow,
    canonical,
    alternate,
    structuredData,
  };

  const robots = [
    seo.noindex ? "noindex" : "index",
    seo.nofollow ? "nofollow" : "follow",
  ].join(", ");

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(", ")} />
      <meta name="author" content={seo.author} />
      <meta name="robots" content={robots} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content={seo.type} />
      <meta property="og:site_name" content="Chaya" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      
      {/* Article specific tags */}
      {seo.type === "article" && (
        <>
          {seo.publishedTime && (
            <meta property="article:published_time" content={seo.publishedTime} />
          )}
          {seo.modifiedTime && (
            <meta property="article:modified_time" content={seo.modifiedTime} />
          )}
          {seo.author && (
            <meta property="article:author" content={seo.author} />
          )}
          {seo.section && (
            <meta property="article:section" content={seo.section} />
          )}
          {seo.tags && seo.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Canonical URL */}
      {seo.canonical && <link rel="canonical" href={seo.canonical} />}
      
      {/* Alternate languages */}
      {seo.alternate && seo.alternate.map((alt) => (
        <link
          key={alt.hreflang}
          rel="alternate"
          hrefLang={alt.hreflang}
          href={alt.href}
        />
      ))}
      
      {/* Structured Data */}
      {seo.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seo.structuredData),
          }}
        />
      )}
      
      {/* Viewport and Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Chaya" />
      
      {/* Performance hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//api.example.com" />
    </Head>
  );
}

// Predefined SEO configurations for different pages
export const pageSEO = {
  dashboard: {
    title: "Dashboard",
    description: "Overview of your agricultural operations, farmers, and business metrics.",
    keywords: ["dashboard", "overview", "metrics", "analytics"],
  },
  farmers: {
    title: "Farmers",
    description: "Manage farmer profiles, documents, and field information.",
    keywords: ["farmers", "profiles", "management", "documents"],
  },
  procurements: {
    title: "Procurements",
    description: "Track crop procurement activities and farmer transactions.",
    keywords: ["procurement", "crops", "transactions", "purchases"],
  },
  processing: {
    title: "Processing Batches",
    description: "Monitor crop processing stages and batch management.",
    keywords: ["processing", "batches", "stages", "quality control"],
  },
  sales: {
    title: "Sales",
    description: "Manage sales transactions and customer relationships.",
    keywords: ["sales", "transactions", "customers", "revenue"],
  },
  settings: {
    title: "Settings",
    description: "Configure system settings and user preferences.",
    keywords: ["settings", "configuration", "preferences"],
  },
};

// Structured data generators
export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Chaya",
    description: "Agricultural Management System",
    url: "https://chaya.example.com",
    logo: "https://chaya.example.com/logo.png",
    sameAs: [
      "https://twitter.com/chaya",
      "https://linkedin.com/company/chaya",
    ],
  },
  
  webApplication: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Chaya",
    description: "Comprehensive agricultural management system",
    url: "https://chaya.example.com",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
  
  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
  
  article: (article: {
    title: string;
    description: string;
    author: string;
    publishedTime: string;
    modifiedTime?: string;
    image?: string;
    url: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Chaya",
      logo: {
        "@type": "ImageObject",
        url: "https://chaya.example.com/logo.png",
      },
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    image: article.image,
    url: article.url,
  }),
};

// Hook for dynamic SEO updates
export function useSEO(seoProps: SEOProps) {
  // This would integrate with your routing system
  // to automatically update SEO based on route changes
  return seoProps;
}
