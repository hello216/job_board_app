import React from 'react';

const TimeToMetric = ({ jobStatusHistory }) => {
  const timeToInterview = jobStatusHistory
    .filter(h => h.Status === "Interviewing")
    .map(h => h.ChangedAt - h.PreviousAppliedDate)
    .reduce((acc, val) => acc + val, 0) / jobStatusHistory.length;

  const timeToOffer = jobStatusHistory
    .filter(h => h.Status === "Offered")
    .map(h => h.ChangedAt - h.PreviousAppliedDate)
    .reduce((acc, val) => acc + val, 0) / jobStatusHistory.length;

  const daysToInterview = timeToInterview / (1000 * 3600 * 24);
  const daysToOffer = timeToOffer / (1000 * 3600 * 24);

  return (
    <div>
      <p>Time-to-Interview: {daysToInterview.toFixed(2)} days</p>
      <p>Time-to-Offer: {daysToOffer.toFixed(2)} days</p>
    </div>
  );
};

export default TimeToMetric;