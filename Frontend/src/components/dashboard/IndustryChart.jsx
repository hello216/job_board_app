import React from 'react';
import { PieChart, Pie, Tooltip } from 'recharts';

const IndustryChart = ({ jobs }) => {
  const industryData = jobs.reduce((acc, job) => {
    const industry = job.Industry;

    // Only increment count if industry is valid
    if (industry) {
      if (!acc[industry]) acc[industry] = 0;
      acc[industry]++;
    }
    return acc;
  }, {});

  const pieData = Object.keys(industryData).map(industry => ({
    name: industry,
    value: industryData[industry],
  }));

  // Only render chart if pieData has entries
  if (pieData.length === 0 || jobs.length === 0) {
    return <p>No industry data available.</p>;
  }

  return (
    <div>
      <PieChart width={400} height={300}>
        <Pie data={pieData} dataKey="value" nameKey="name" />
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default IndustryChart;