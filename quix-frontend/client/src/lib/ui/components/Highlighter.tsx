import React from 'react';
import ReactHighlighter from 'react-highlight-words';
import { highlightText } from '../../../services/search';

export interface HighlighterProps {
  term: string;
  filter: string;
}

export const Highlighter = ({
  term,
  filter,
}: HighlighterProps) => {
  const highlightProps = highlightText(term, filter);
    
  return (
    <ReactHighlighter
      searchWords={[highlightProps.currentFilter]}
      autoEscape={true}
      textToHighlight={highlightProps.textToHighlight}
    />
  )
}