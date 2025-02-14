import React from 'react';

const TimeToMetric = ({ jobStatusHistory }) => {
  if (jobStatusHistory.length === 0) {
    return <p>No job status history available.</p>;
  }

  // Rest of your calculations
  const interviews = jobStatusHistory
    .filter(h => h.Status === "Interviewing" && h.ChangedAt && h.PreviousAppliedDate)
    .map(h => h.ChangedAt - h.PreviousAppliedDate);
  
  const timeToInterview = interviews.length > 0
    ? interviews.reduce((acc, val) => acc + val, 0) / interviews.length
    : 0;

  const offers = jobStatusHistory
    .filter(h => h.Status === "Offered" && h.ChangedAt && h.PreviousAppliedDate)
    .map(h => h.ChangedAt - h.PreviousAppliedDate);
  
  const timeToOffer = offers.length > 0
    ? offers.reduce((acc, val) => acc + val, 0) / offers.length
    : 0;

  const daysToInterview = timeToInterview / (1000 * 3600 * 24);
  const daysToOffer = timeToOffer / (1000 * 3600 * 24);

  return (
    <div>
      <p>Time-to-Interview: {isNaN(daysToInterview) ? 'N/A' : daysToInterview.toFixed(2)} days</p>
      <p>Time-to-Offer: {isNaN(daysToOffer) ? 'N/A' : daysToOffer.toFixed(2)} days</p>
    </div>
  );
};

export default TimeToMetric;