import React from 'react';

export default function CategoryBadge({ category }) {
  if (!category || category === 'Not Evaluated') {
    return <span className="badge badge-default">Pending Evaluation</span>;
  }

  const clean = category.toLowerCase().replace(/\s+/g, '-');
  let badgeClass = 'badge-default';

  if (clean.includes('at-risk')) {
    badgeClass = 'badge-at-risk';
  } else if (clean.includes('needs-improvement')) {
    badgeClass = 'badge-needs-improvement';
  } else if (clean.includes('satisfactory')) {
    badgeClass = 'badge-satisfactory';
  } else if (clean.includes('good')) {
    badgeClass = 'badge-good';
  } else if (clean.includes('excellent')) {
    badgeClass = 'badge-excellent';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
      {category}
    </span>
  );
}
