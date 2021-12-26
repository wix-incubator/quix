/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { isEqual } from 'lodash';
import {
  useViewState,
  ViewStateActions,
} from '../../../../services/hooks';

export interface AutocompleteProps {
  title: string;
  options: any[];
  optionKey?(option: any): string;
  state?: string;
  getMore?(): void;
  defaultValue?: string;
  onChange?(value: string): void;
  onInputFocus?(): void;
  onSelect(option: any): void;
  setTitleOnValueChange?(value: string): string;
  setTitleOnValueSelect?(option: any): string;
  placeholder?: string;
  inputDataHook?: string;
  liDataHook?: string;
  primaryOption?: any;
  classes?: {
    input?: string;
    list?: string;
    listItem?: string;
    wrapper?: string;
  };
  disableFreeWrite?: boolean;
  readonly?: boolean;
}

interface StateData {
  title: string;
  currentOptions: any[];
  inputValue: string;
  filteredOptions: any[];
  placeholder?: string;
  selectedOption: any;
}

interface Actions {
  onScroll(UIElement: any): void;
  onValueChange(v: string): void;
  onValueSelect(primaryOption: any): void;
  getItems(): any[];
}

const formatInput = (props: AutocompleteProps): StateData => {
  return {
    title: props.title,
    inputValue: props.defaultValue || '',
    filteredOptions: props.options,
    currentOptions: props.getMore ? props.options : props.options.slice(0, 50),
    selectedOption: {},
    placeholder: props.primaryOption
      ? props.primaryOption[props.title]
      : props.placeholder || 'Please select value',
  };
};

const States = ['Empty', 'Content', 'Loading', 'Error'];

export const useAutocomplete = (
  props: AutocompleteProps,
): [StateData, ViewStateActions<string, StateData>, Actions] => {
  const [stateData, viewState] = useViewState<string, StateData>(
    States,
    formatInput(props),
  );

  useEffect(() => {
    viewState.update({ inputValue: props.defaultValue });
  }, [props.defaultValue]);

  useEffect(() => {
    const state = props.state || 'Content';
    const options = props.options;

    viewState.set(state, {
      filteredOptions: options,
      currentOptions: props.getMore ? options : options.slice(0, 50),
    });
  }, [props.state, props.options]);

  const onScroll = (UIElement: any) => {
    const element = UIElement.target;
    if (
      element.scrollHeight - element.scrollTop <=
      element.clientHeight + 100
    ) {
      if (!props.getMore) {
        if (
          stateData.currentOptions.length !== stateData.filteredOptions.length
        ) {
          viewState.update({
            currentOptions: stateData.filteredOptions.slice(
              0,
              stateData.currentOptions.length + 50,
            ),
          });
        }
      } else {
        props.getMore();
      }
    }
  };

  const onValueChange = (v: string) => {
    if (props.onChange) {
      props.onChange(v);
    }

    if (!props.getMore) {
      const _filteredOptions = props.options.filter((option) =>
        option[stateData.title].includes(v),
      );
      const inputValue = props.setTitleOnValueChange ? props.setTitleOnValueChange(v) : v;
      if (!_filteredOptions.length) {
        viewState.set('Empty', {
          filteredOptions: [],
          currentOptions: [],
          inputValue,
        });
      } else {
        viewState.set('Content', {
          filteredOptions: _filteredOptions,
          currentOptions: _filteredOptions.slice(0, 50),
          inputValue,
        });
      }
    }
  };

  const onValueSelect = (option: any) => {
    const isPrimaryOption = props.primaryOption && option[stateData.title] === props.primaryOption[stateData.title];

    viewState.update({
      selectedOption: option,
      inputValue: isPrimaryOption ? '' : props.setTitleOnValueSelect ? props.setTitleOnValueSelect(option) : option[stateData.title],
    });

    props.onSelect(option);
  };

  const getItems = () => {
    if (viewState.is('Empty') && props.primaryOption) {
      return [props.primaryOption];
    }

    if (!viewState.is('Content')) {
      return [{ [stateData.title]: '' }];
    }

    return props.readonly
      ? []
      : props.primaryOption &&
        !isEqual(props.primaryOption, stateData.selectedOption)
      ? [props.primaryOption, ...stateData.currentOptions]
      : stateData.currentOptions;
  };

  return [
    stateData,
    viewState,
    { onScroll, onValueChange, onValueSelect, getItems },
  ];
};
