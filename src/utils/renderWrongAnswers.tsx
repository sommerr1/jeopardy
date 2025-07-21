import React from 'react';

export function renderWrongAnswers(str: string): React.ReactNode {
  const regex = /([^,]+?) \(([^)]+)\)/g;
  const elements: React.ReactNode[] = [];
  let match;
  let idx = 0;
  while ((match = regex.exec(str)) !== null) {
    const [full, wrong, right] = match;
    elements.push(
      <span key={idx}>
        <span style={{ color: 'red', textDecoration: 'line-through' }}>{wrong.trim()}</span>
        <span style={{ color: 'green' }}> ({right})</span>
        {regex.lastIndex < str.length ? <span>, </span> : null}
      </span>
    );
    idx++;
  }
  return elements;
} 