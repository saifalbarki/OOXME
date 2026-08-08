import LegacyPage from '../components/LegacyPage';
import { getLegacyPage } from '../utilities/legacy-page';

export default function HomePage() {
  return <LegacyPage pageId="index" initialPage={getLegacyPage('index')} />;
}
