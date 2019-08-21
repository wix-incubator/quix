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
    <div className="bi-grow bi-scroll">
      <div className="quix-home-welcome bi-c bi-s-v--x3">
        <div className="quix-home-welcome-title bi-text--300">
          Welcome to Quix
        </div>
        <div className="bi-text--lg bi-text--300 bi-muted">
          A Presto-based notebook manager
        </div>
      </div>

      <div className="quix-home-actions bi-align bi-center bi-grow">
        <div
          className="bi-home-action bi-theme--lighter"
          role="button"
          onClick={() => events.onNotebooksClick()}
          data-hook="home-notebooks"
        >
          <i className="bi-icon">description</i>
          <span>My notebooks</span>
        </div>

        <div
          className="bi-home-action bi-theme--lighter"
          role="button"
          onClick={() => events.onExamplesClick()}
          data-hook="home-examples"
        >
          <i className="bi-icon">local_library</i>
          <span>Examples</span>
        </div>

        <div
          className="bi-home-action bi-theme--lighter"
          role="button"
          onClick={() => events.onNotebookAdd()}
          data-hook="home-add-notebook"
        >
          <i className="bi-icon">add</i>
          <span>Add notebook</span>
        </div>
      </div>
    </div>
  );
}
