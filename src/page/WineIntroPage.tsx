import { useParams } from 'react-router-dom';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';

const WineIntroPage: React.FC = () => {
  const { wineryId } = useParams<{ wineryId: string }>();
  // const winery: Winery | undefined = wineries.find(
  //   (winery) => winery.id === Number(wineryId),
  // );
  //
  // if (!winery) {
  //   return <div>Winery not found</div>;
  // }

  return (
    <PageLayout>
      <h2>{winery.name}</h2>
      <h3>Wines</h3>
      <ul>
        {winery.wines.map((wine) => (
          <li key={wine.id}>
            <h4>{wine.name}</h4>
            <p>{wine.description}</p>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
};

export default WineIntroPage;
