import React from 'react';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';

const statusColors = {
  Applied: '#8884d8',
  Interviewing: '#82ca9d',
  Offered: '#ffc658',
  Accepted: '#8dd1e1',
  Rejected: '#ff8042',
  "Not Interested": '#d0ed57',
  Ghosted: '#a4de6c'
};

const JobStatusChart = ({ jobs }) => {
  if (jobs.length === 0) {
    return <p>No job status history available.</p>;
  }

  const statusData = jobs.reduce((acc, job) => {
    if (!acc[job.status]) acc[job.status] = 0; // Fix casing issue
    acc[job.status]++;
    return acc;
  }, {});

  const pieData = Object.keys(statusData).map(status => ({
    name: status,
    value: statusData[status],
  }));

  return (
    <div>
      <PieChart width={400} height={300}>
        <Pie data={pieData} dataKey="value" nameKey="name">
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#ccc'} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default JobStatusChart;