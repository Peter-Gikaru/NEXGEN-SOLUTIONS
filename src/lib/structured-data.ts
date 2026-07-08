export function buildBreadcrumbs(
  crumbs: { name: string; path?: string }[],
  baseUrl: string = 'https://yourdomain.co.ke'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.path ? { item: baseUrl + crumb.path } : {}),
    })),
  };
}
