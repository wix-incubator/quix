import React from 'react';
import ReactHighlighter from 'react-highlight-words';

export interface HighlighterProps {
  term: string;
  filter: string;
}

export const Highlighter = ({
  term,
  filter,
}: HighlighterProps) => {
    
  return (
    <ReactHighlighter
      searchWords={[filter]}
      autoEscape={true}
      textToHighlight={term}
    />
  )
}