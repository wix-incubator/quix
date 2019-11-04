import * as React from 'react';
import './home.scss';

export interface HomeProps {
  events: {
    onNotebooksClick(): void;
    onExamplesClick(): void;
    onNotebookAdd(): void;
  };
}

export function Home(props: HomeProps) {
  const {events} = props;
  return (
    <div className="bi-section bi-c-h bi-grow bi-scroll bi-theme--dark">
      <div className="quix-home-welcome bi-section-title bi-c bi-s-v--x3">
        <div className="quix-home-welcome-title">
          <span className="bi-primary bi-text--600">QUIX</span> <span className="bi-text--300">NOTEBOOK MANAGER</span>
        </div>
        <div className="bi-text--lg bi-text--300">
          A shared space for your company's BI insights and know-how
        </div>
      </div>

      <div className="quix-home-actions bi-center bi-grow">
        <button
          className="bi-button bi-home-action"
          role="button"
          onClick={() => events.onNotebooksClick()}
          data-hook="home-notebooks"
        >
          {/* <i className="bi-icon">description</i> */}
          <span>My notebooks</span>
        </button>

        <button
          className="bi-button bi-home-action"
          role="button"
          onClick={() => events.onExamplesClick()}
          data-hook="home-examples"
        >
          {/* <i className="bi-icon">local_library</i> */}
          <span>Examples</span>
        </button>

        <button
          className="bi-button bi-home-action"
          role="button"
          onClick={() => events.onNotebookAdd()}
          data-hook="home-add-notebook"
        >
          <i className="bi-icon">add</i>
          <span>Add notebook</span>
        </button>
      </div>
    </div>
  );
}
