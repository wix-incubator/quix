import React from 'react';
import 'bootstrap-daterangepicker/daterangepicker.css';
import ReactDateRangePicker from 'react-bootstrap-daterangepicker';
import { DatePickerProps, useDatePicker } from './date-picker.hook';

export const DatePicker = (props: DatePickerProps) => {
  const [
    { customDates },
    { handleCallback, getLabel, getInitialDates },
    viewState,
  ] = useDatePicker(props);

  switch (viewState.get()) {
    case 'Range':
      return (
        <div className={`${props.classes?.formRow || ''} bi-form-row`}>
          {props.title ? (
            <span className="bi-form-label">{props.title}</span>
          ) : null}
          <ReactDateRangePicker
            initialSettings={{
              ranges: customDates,
              timePicker: props.timePicker,
              startDate: getInitialDates()[0],
              endDate: getInitialDates()[1],
              alwaysShowCalendars: true,
            }}
            onCallback={(start, end, label) =>
              handleCallback([start, end], label)
            }
          >
            <div
              className={`${
                props.classes?.input || ''
              }  bi-pointer bi-input bi-align`}
            >
              <span>{getLabel()}</span>
            </div>
          </ReactDateRangePicker>
        </div>
      );
    case 'RangeReadOnly':
      return (
        <div className={`${props.classes?.formRow || ''} bi-form-row`}>
          {props.title ? (
            <span className="bi-form-label">{props.title}</span>
          ) : null}
          <div className={`${props.classes?.inputDisabled || ''} bi-align`}>
            <span>{getLabel()}</span>
          </div>
        </div>
      );
    default:
      return <div>Type {props.type} not implemented yet.</div>;
  }
};
