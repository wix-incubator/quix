/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { isEqual, isNil } from 'lodash';
import {
  useViewState,
  ViewStateActions,
} from '../../../../services/hooks';

export interface RenderInputProps {
  setIsOpen(type: boolean): void;
  open: boolean;
  onValueChange(v: string): void;
  inputValue: string;
  onInputFocus?(): void;
  readonly?: boolean;
}

export interface AutocompleteProps {
  title: string;
  options: any[];
  optionKey?(option: any): string;
  state?: string;
  getMore?(): void;
  value?: string;
  onChange?(value: string): void;
  onInputFocus?(): void;
  onSelect(option: any): void;
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
  RenderInput?: React.ComponentType<RenderInputProps>;
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
  open: boolean;
}

interface Actions {
  onScroll(UIElement: any): void;
  onValueChange(v: string): void;
  onValueSelect(primaryOption: any): void;
  getItems(): any[];
  setIsOpen(type: boolean): void;
}

const formatInput = (props: AutocompleteProps): StateData => {
  return {
    title: props.title,
    inputValue: props.value || '',
    filteredOptions: props.options,
    currentOptions: props.getMore ? props.options : props.options.slice(0, 50),
    selectedOption: {},
    placeholder: props.primaryOption
      ? props.primaryOption[props.title]
      : props.placeholder || 'Please select value',
    open: false,
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
    viewState.update({ inputValue: props.value });
  }, [props.value]);

  useEffect(() => {
    const state = props.state || 'Content';
    const options = props.options;

    viewState.set(state, {
      filteredOptions: options,
      currentOptions: props.getMore ? options : options.slice(0, 50),
      inputValue: isNil(props.value) ? stateData.inputValue : props.value,
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
      if (!_filteredOptions.length) {
        viewState.set('Empty', {
          filteredOptions: [],
          currentOptions: [],
          inputValue: v,
        });
      } else {
        viewState.set('Content', {
          filteredOptions: _filteredOptions,
          currentOptions: _filteredOptions.slice(0, 50),
          inputValue: v,
        });
      }
    }
  };

  const onValueSelect = (option: any) => {
    const isPrimaryOption = props.primaryOption && option[stateData.title] === props.primaryOption[stateData.title];

    viewState.update({
      selectedOption: option,
      inputValue: isPrimaryOption ? '' : option[stateData.title],
      open: false,
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

  const setIsOpen = (type: boolean) => {
    if (
      (!type && stateData.open === true) ||
      (type && stateData.open === false)
    ) {
      viewState.update({ open: type });
    }
  };

  return [
    stateData,
    viewState,
    { onScroll, onValueChange, onValueSelect, getItems, setIsOpen },
  ];
};
