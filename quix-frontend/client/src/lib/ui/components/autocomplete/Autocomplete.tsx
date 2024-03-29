import React from 'react';
import { AutocompleteProps, useAutocomplete } from './autocomplete.hook';
import { Input } from '../input/Input';
import { Dropdown } from '../dropdown/Dropdown';
import { Highlighter } from '../Highlighter';

export const Autocomplete = (props: AutocompleteProps) => {
  const [
    { title, inputValue, placeholder, inputValid },
    viewState,
    {
      onScroll,
      onValueChange,
      onValueSelect,
      getItems,
      onInputFocus,
      onInputBlur,
    },
  ] = useAutocomplete(props);

  const inputClassName = `bi-pointer ${inputValid ? '' : ' bi-border-invalid'}${
    props.classes?.input ? ` ${props.classes?.input}` : ''
  }`;

  const renderInput = (p: any) => (
    <Input
      {...p}
      readonly={props.readonly}
      disableFreeWrite={props.disableFreeWrite}
      data-hook={props.inputDataHook}
      className={inputClassName}
      placeholder={placeholder}
      onChange={(e) => {
        onValueChange(e.target.value);
        p.onChange && p.onChange();
      }}
      onFocus={(e, ref) => onInputFocus(e, p, ref)}
      onBlur={(e) => onInputBlur(e, p)}
      endAdornment={<i className="bi-icon bi-muted">keyboard_arrow_down</i>}
      value={inputValue}
    />
  );

  const optionHtml = (option: any) => {
    if (props.primaryOption && option[title] === props.primaryOption[title]) {
      return (
        <li
          key="autocomplete_primary"
          className="bi-muted"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onValueSelect(option)}
        >
          {option[title]}
        </li>
      );
    }

    switch (viewState.get()) {
      case 'Error':
        return (
          <li key="autocomplete_error" className="bi-text--sm">
            <span>Error occured</span>
          </li>
        );
      case 'Loading':
        return (
          <li key="autocomplete_loading" className="bi-center bi-fade-in">
            <span className="bi-spinner--sm"></span>
          </li>
        );
      case 'Content':
        return (
          <li
            key={`autocomplete_${
              props.optionKey ? props.optionKey(option) : option[title]
            }`}
            onClick={() => onValueSelect(option)}
            className={props.classes?.listItem || ''}
            data-hook={props.liDataHook}
          >
            {option.render ? (
              option.render(inputValue)
            ) : (
              <Highlighter term={option[title]} filter={inputValue} />
            )}
          </li>
        );
      case 'Empty':
        return (
          <li key="autocomplete_empty" className="bi-text--sm bi-muted">
            <span>No suggestions</span>
          </li>
        );
      default:
        return <> </>;
    }
  };

  return (
    <Dropdown
      readonly={props.readonly}
      toggle={renderInput}
      options={getItems()}
      states={{
        toggle: {
          onClick: true,
        },
      }}
    >
      {(options) => (
        <ul
          onScroll={onScroll}
          className={`${props.classes?.list || ''} bi-dropdown-menu`}
        >
          {options.map(optionHtml)}
        </ul>
      )}
    </Dropdown>
  );
};
