/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import moment, { Moment } from 'moment';
import _ from 'lodash';
import {
  useViewState,
  ViewStateActions,
} from '../../../../services/hooks';
import { getAmountAndUnitFromString, getKeyByValue } from './utils';

export interface Range {
  start: null | number;
  end?: null | number;
  period?: null | string;
}

type DateRanges = Record<string, any>;
type DatePickerTypes = 'Range';
export type OnChangeDatePickerProps = {
  selectedDates: Moment[];
  label?: string;
  isEqualToCustomRange: boolean;
};

export interface DatePickerProps {
  title?: string;
  dateFormat?: string;
  initialDates?: Range;
  customDates?: DateRanges;
  timePicker?: boolean;
  readonly?: boolean;
  onChange(props: Range): void;
  type: DatePickerTypes;
  classes?: {
    input?: string;
    inputDisabled?: string;
    formRow?: string;
  };
}

interface StateData {
  selectedDates: Moment[];
  isEqualToCustomRange: boolean;
  customRangeLabel: string;
  customDates?: DateRanges;
}

interface DatePickerActions {
  handleCallback(initialDates: Moment[], label?: string): void;
  getLabel(): string;
  getInitialDates(): Moment[];
}

const States = ['Range', 'RangeReadOnly'];

const formatDate = (
  dates: Moment[] = [moment(), moment()],
  format: string = 'DD/MM/YYYY HH:mm',
) =>
  dates.length > 1
    ? dates[0].format(format) + ' - ' + dates[1].format(format)
    : dates[0].format(format);

const formatInput = (props: DatePickerProps): StateData => {
  let formattedCustomDates: Record<string, any> | undefined;
  if (props.customDates) {
    Object.keys(props.customDates).forEach((key) => {
      if (!formattedCustomDates) {
        formattedCustomDates = {};
      }

      const [amount, unit] = getAmountAndUnitFromString(
        props.customDates![key],
      );

      formattedCustomDates[key] = [
        moment().subtract(amount, unit.toLowerCase()),
        moment(),
      ];
    });
  }

  if (props.initialDates) {
    const { start, end, period } = props.initialDates;
    const selectedDates: Moment[] = [];
    start && selectedDates.push(moment.unix(start));
    end && selectedDates.push(moment.unix(end));

    return {
      customRangeLabel: period
        ? getKeyByValue(props.customDates!, period)!
        : '',
      selectedDates,
      isEqualToCustomRange: !!period,
      customDates: formattedCustomDates,
    };
  }

  return {
    customRangeLabel: '',
    selectedDates: [],
    isEqualToCustomRange: false,
    customDates: formattedCustomDates,
  };
};

const formatOutput = (
  selectedDates: Moment[],
  isEqualToCustomRange: boolean,
  customDates?: DateRanges,
  label?: string,
): Range => {
  const _selectedDates = selectedDates.map((date) => date.utc());
  const range: Range = {
    start: !isEqualToCustomRange ? _selectedDates[0].unix() : null,
    end:
      !isEqualToCustomRange && _selectedDates[1]
        ? _selectedDates[1].unix()
        : null,
    period: isEqualToCustomRange ? customDates![label!] : '',
  };
  return range;
};

export const useDatePicker = (
  props: DatePickerProps,
): [StateData, DatePickerActions, ViewStateActions<string, StateData>] => {
  const [stateData, viewState] = useViewState<string, StateData>(
    States,
    formatInput(props),
  );

  useEffect(() => {
    const newState = props.readonly ? 'RangeReadOnly' : props.type;
    viewState.set(newState, formatInput(props));
  }, [props]);

  const handleCallback = (selectedDates: Moment[], label?: string) => {
    const isEqualToCustomRange = !!props.customDates?.[label || ''];

    viewState.update({
      selectedDates,
      customRangeLabel: label,
      isEqualToCustomRange,
    });

    props.onChange(
      formatOutput(
        selectedDates,
        isEqualToCustomRange,
        props.customDates,
        label,
      ),
    );
  };

  const getLabel = () => {
    if (stateData.isEqualToCustomRange) {
      return stateData.customRangeLabel;
    } else {
      if (stateData.selectedDates.length === 0) {
        switch (viewState.get()) {
          case 'Range':
            const initialDates = getInitialDates();
            return formatDate(initialDates);
          default:
            return '';
        }
      } else {
        return formatDate(stateData.selectedDates, props.dateFormat);
      }
    }
  };

  const getInitialDates = () => {
    const { customDates, initialDates } = props;
    if (stateData.customDates && initialDates?.period && customDates) {
      const key = getKeyByValue(customDates, initialDates.period);
      return stateData.customDates[key!];
    } else {
      return [moment(), moment()];
    }
  };

  return [stateData, { handleCallback, getLabel, getInitialDates }, viewState];
};
