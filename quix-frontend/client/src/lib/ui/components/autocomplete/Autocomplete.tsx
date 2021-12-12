import React from 'react';
import { AutocompleteProps, useAutocomplete } from './autocomplete.hook';
import { Input } from '../input/Input';
import { Dropdown } from '../dropdown/Dropdown';
import { Highlighter } from '../Highlighter';
import './autocomplete.scss';

export const Autocomplete = (props: AutocompleteProps) => {
  const [
    { title, inputValue, placeholder, open },
    viewState,
    { onScroll, onValueChange, onValueSelect, getItems, setIsOpen },
  ] = useAutocomplete(props);

  const inputClassName = `bi-pointer${
    props.classes?.input ? ` ${props.classes?.input}` : ''
  }`;

  const input = props.RenderInput ? (
    <props.RenderInput
      setIsOpen={setIsOpen}
      open={open}
      onValueChange={onValueChange}
      inputValue={inputValue}
      onInputFocus={props.onInputFocus}
    />
  ) : (
    <Input
      readonly={props.readonly}
      disableFreeWrite={props.disableFreeWrite}
      data-hook={props.inputDataHook}
      className={inputClassName}
      placeholder={placeholder}
      onChange={(e) => onValueChange(e.target.value)}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen(true)}
      onKeyDown={() => setIsOpen(true)}
      onFocus={() => {
        setIsOpen(true);
        props.onInputFocus && props.onInputFocus();
      }}
      endAdornment={<i className="bi-icon bi-muted">keyboard_arrow_down</i>}
      value={inputValue}
    />
  );

  const dropdownOptions = getItems().map((option) => {
    if (props.primaryOption && option[title] === props.primaryOption[title]) {
      return (
        <li
          key="autocomplete_primary"
          className="bi-muted"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onValueSelect(option)}
        >{option[title]}</li>
      );
    }

    switch (viewState.get()) {
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onValueSelect(option)}
            className={props.classes?.listItem || ''}
            data-hook={props.liDataHook}
          >
            {option.render ? (
              option.render(inputValue)
            ) : 
              <Highlighter term={option[title]} filter={inputValue} />
            }
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
  });

  const dropdownList = ({ options }: any) => (
    <ul
      onScroll={onScroll}
      className={`${
        props.classes?.list || ''
      } bi-autocomplete-list bi-dropdown-menu`}
    >
      {options}
    </ul>
  );

  return <Dropdown
    ReferenceElement={input}
    OptionsWrapper={dropdownList}
    options={dropdownOptions}
    isOpen={open}
    spanClass={props.classes?.wrapper}
  />;
};
