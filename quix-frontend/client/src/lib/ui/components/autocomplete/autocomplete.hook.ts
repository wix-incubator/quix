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
  inputValid: boolean;
  inputValueChanged: boolean;
  filteredOptions: any[];
  placeholder?: string;
  selectedOption: any;
}

interface Actions {
  onScroll(UIElement: any): void;
  onValueChange(v: string): void;
  onValueSelect(primaryOption: any): void;
  getItems(): any[];
  onInputFocus(
    e: any,
    p: any,
    ref?: React.MutableRefObject<HTMLInputElement>,
  ): void;
  onInputBlur(
    e: any,
    p: any,
    ref?: React.MutableRefObject<HTMLInputElement>,
  ): void;
}

const formatInput = (props: AutocompleteProps): StateData => {
  return {
    title: props.title,
    inputValue: props.defaultValue || '',
    inputValueChanged: false,
    inputValid: true,
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
    const state = props.state || 'Content';
    const options = props.options;
    const currentOptions = props.getMore ? options : options.slice(0, 50);
    const inputValue = stateData.inputValueChanged
      ? stateData.inputValue
      : props.defaultValue;

    viewState.set(state, {
      filteredOptions: options,
      currentOptions,
      inputValue,
    });
  }, [props.state, props.options, props.defaultValue]);

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

    const inputValue = props.setTitleOnValueChange
      ? props.setTitleOnValueChange(v)
      : v;

    if (!props.getMore) {
      const _filteredOptions = props.options.filter((option) =>
        option[stateData.title].includes(v),
      );
      if (!_filteredOptions.length) {
        viewState.set('Empty', {
          filteredOptions: [],
          currentOptions: [],
          inputValue,
          inputValueChanged: true,
        });
      } else {
        viewState.set('Content', {
          filteredOptions: _filteredOptions,
          currentOptions: _filteredOptions.slice(0, 50),
          inputValue,
          inputValueChanged: true,
        });
      }
    } else {
      viewState.update({
        inputValue,
        inputValueChanged: true,
      });
    }
  };

  const onValueSelect = (option: any) => {
    const isPrimaryOption =
      props.primaryOption &&
      option[stateData.title] === props.primaryOption[stateData.title];

    viewState.update({
      selectedOption: option,
      inputValue: isPrimaryOption
        ? ''
        : props.setTitleOnValueSelect
        ? props.setTitleOnValueSelect(option)
        : option[stateData.title],
      inputValueChanged: true,
      inputValid: true,
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

  const onInputFocus = (
    e: any,
    p: any,
    ref?: React.MutableRefObject<HTMLInputElement>,
  ) => {
    !props.readonly && ref && ref.current.select();
    props.onInputFocus && props.onInputFocus();
    p.onFocus && p.onFocus();
  };

  const onInputBlur = (e: any, p: any) => {
    let inputValue = props.defaultValue || '';
    if (stateData.selectedOption && stateData.selectedOption[stateData.title]) {
      inputValue = props.setTitleOnValueSelect
        ? props.setTitleOnValueSelect(stateData.selectedOption)
        : stateData.selectedOption[stateData.title];
    }

    viewState.update({
      inputValid:
        props.primaryOption?.[stateData.title] === inputValue ||
        inputValue === stateData.inputValue,
    });

    p.onInputBlur && p.onInputBlur();
  };

  return [
    stateData,
    viewState,
    {
      onScroll,
      onValueChange,
      onValueSelect,
      getItems,
      onInputFocus,
      onInputBlur,
    },
  ];
};
