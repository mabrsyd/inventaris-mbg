import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
};

export default StatsCard;