import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const LocationChart = ({ jobs }) => {
  const locationData = jobs.reduce((acc, job) => {
    if (!acc[job.Location]) acc[job.Location] = 0;
    acc[job.Location]++;
    return acc;
  }, {});

  const barData = Object.keys(locationData).map(location => ({
    name: location,
    count: locationData[location],
  }));

  return (
    <div>
      <BarChart width={500} height={300} data={barData}>
        <XAxis dataKey="name" />
        <YAxis dataKey="count" />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default LocationChart;