import React from 'react';
import { Link } from 'react-router-dom';
import { wineries } from '@/dummy';

const WineriesPage: React.FC = () => {
  return (
    <div>
      <h2>Wineries</h2>
      <ul>
        {wineries.map((winery) => (
          <li key={winery.id}>
            <Link to={`/wineries/${winery.id}`}>{winery.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WineriesPage;
