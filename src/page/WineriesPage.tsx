import { Link } from 'react-router-dom';
import { wineries } from '@/dummy';
import PageLayout from '@/components/layout/PageLayout.tsx';

const WineriesPage: React.FC = () => {
  return (
    <PageLayout>
      <h2>Wineries</h2>
      <ul>
        {wineries.map((winery) => (
          <li key={winery.id}>
            <Link to={`/wineries/${winery.id}`}>{winery.name}</Link>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
};

export default WineriesPage;
