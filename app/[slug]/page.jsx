import { notFound } from 'next/navigation';
import LegacyPage from '../../components/LegacyPage';
import { pages } from '../../config/pages';
import { getLegacyPage } from '../../utilities/legacy-page';

export function generateStaticParams() {
  return pages.filter((page) => page !== 'index').map((page) => ({ slug: page }));
}

export default async function LegacyRoute({ params }) {
  const resolvedParams = await params;
  const pageId = resolvedParams.slug;
  if (!pageId || !pages.includes(pageId) || pageId === 'index') notFound();
  return <LegacyPage pageId={pageId} initialPage={getLegacyPage(pageId)} />;
}
