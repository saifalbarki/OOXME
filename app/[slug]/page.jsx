import { notFound, redirect } from 'next/navigation';
import LegacyPage from '../../components/LegacyPage';
import PortfolioPanels from '../../components/PortfolioPanels';
import { pages } from '../../config/pages';
import { collectionPageIds } from '../../config/collection-pages';
import { obsoleteRouteRedirects } from '../../config/site-structure';
import CollectionPage from '../../components/CollectionPage';
import { getLegacyPage } from '../../utilities/legacy-page';

export function generateStaticParams() {
  return pages.filter((page) => page !== 'index').map((page) => ({ slug: page }));
}

export default async function LegacyRoute({ params }) {
  const resolvedParams = await params;
  const pageId = resolvedParams.slug;
  if (!pageId || !pages.includes(pageId) || pageId === 'index') notFound();
  if (obsoleteRouteRedirects[pageId]) redirect(obsoleteRouteRedirects[pageId]);
  if (pageId === 'portfolio') return <PortfolioPanels initialPanel={1} basePath="/portfolio" />;
  if (collectionPageIds.includes(pageId)) return <CollectionPage pageId={pageId} />;
  return <LegacyPage pageId={pageId} initialPage={getLegacyPage(pageId)} />;
}
