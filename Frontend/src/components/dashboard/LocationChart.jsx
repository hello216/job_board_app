import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const LocationChart = ({ jobs }) => {
  if (jobs.length === 0) {
    return <p>No job location data available.</p>;
  }

  const locationData = jobs.reduce((acc, job) => {
    if (!job.location) {
      console.log(`Skipping job with undefined location: ${job.title}`);
      return acc;
    }
    if (!acc[job.location]) acc[job.location] = 0;
    acc[job.location]++;
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