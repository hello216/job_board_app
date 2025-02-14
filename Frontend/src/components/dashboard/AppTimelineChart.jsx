import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const dateParser = (dateString) => {
  // Extract only the date-time part before the timezone offset
  const match = dateString.match(/^(.+?)([+-]\d{2}:\d{2})?$/);
  if (!match) return new Date(NaN); // Return invalid date if parsing fails

  const datePart = match[1]; // Date-time without timezone
  const date = new Date(datePart); // Convert to Date object

  return date;
};

const AppTimelineChart = ({ jobs }) => {
  if (jobs.length === 0) {
    return <p>No job data available.</p>;
  }

  const applicationTimeline = jobs.map(job => {
    const parsedDate = dateParser(job.createdAt);

    if (isNaN(parsedDate.getTime())) {
      console.log(`Skipping job ${job.title} due to invalid date.`);
      return null;
    }

    const month = parsedDate.getMonth() + 1; // To get 1-based month (January = 1)

    return {
      month,
      count: 1,
    };
  }).filter(item => item !== null); // Filter out any null items

  if (applicationTimeline.length === 0) {
    return <p>No job status history available.</p>;
  }

  // Group timeline by month
  const groupedTimeline = applicationTimeline.reduce((acc, item) => {
    if (!acc[item.month]) acc[item.month] = 0;
    acc[item.month]++;
    return acc;
  }, {});

  // Create lineData with correct month and count
  const lineData = Object.keys(groupedTimeline).map(month => ({
    month: parseInt(month), // Ensure month is an integer
    count: groupedTimeline[month],
  }));

  console.log(lineData); // Verify data structure

  return (
    <div>
      <LineChart width={500} height={300} data={lineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month"
               domain={[1, 12]} // Ensure x-axis covers all months
               ticks={Array.from({ length: 12 }, (_, i) => i + 1)} // Show all months
               tickFormatter={(month) => {
                 if (isNaN(month) || month < 1 || month > 12) return "Invalid";
                 const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                 return monthNames[month - 1]; // Return month name
               }}
        />
        <YAxis dataKey="count" />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
  );
};

export default AppTimelineChart;