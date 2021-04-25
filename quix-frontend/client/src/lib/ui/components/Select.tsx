import React, { useState, useEffect, useRef } from 'react';
import { CircularProgress, List, ListItem, makeStyles } from '@material-ui/core';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { grey } from '@material-ui/core/colors';
import _ from 'lodash';
import { useViewState } from '../../../services/hooks';
import Input from './Input';
import { HighlighterProps } from './Highlighter';

const useStyles = makeStyles({
    inputArea: {
      display: 'inline-grid',
    },
    center: {
      justifyContent: 'center',
    },
    bold: {
      fontWeight: 'bold'
    },
    primaryOption: {
      color: grey[600]
    },
    list: {
      position: 'fixed',
      width: 'auto',
      minWidth: 200,
      zIndex: 200,
      willChange: 'top, left',
      backgroundColor: 'white',
      paddingTop: '5px',
      paddingBottom: '5px',
      '& li[data-focus="true"]': {
        backgroundColor: grey[50],
        cursor: 'pointer',
      },
    },
  }
);

const checkIsPlainData = (data) => ['string', 'number', 'undefined'].includes(typeof data);

const getOptionLabelValue = (option, title) => checkIsPlainData(option) ? String(option) : option[title];

const filterEmptyLabelValue = (options) => options.filter(option => option !== '');

const NoMatchesState = () => (
  <ListItem className={'bi-text--sm bi-muted'}>
    <span>
      No matches
    </span>
  </ListItem>
)

const States = [
  'FirstLoad',
  'Initial',
  'Open',
  'Error',
  'Result',
  'Content',
];

interface PlainTypes {
  options: number[] | string[] | Promise<string[] | number[]>,
  title?: undefined,
}

interface ObjectTypes {
  options(): Object;
  title: string,
}

interface ISelect { 
  defaultLabel?: any,
  primaryLabel?: any,
  placeHolder?: string,
  inputDataHook?: string,
  liDataHook?: string,
  onOptionChange?(options: any): void;
  Highlighter?: React.ComponentType<HighlighterProps>;
}

interface a extends ISelect, ObjectTypes {}
interface b extends ISelect, PlainTypes {}

const Select = ({
  options,
  title,
  defaultLabel,
  primaryLabel,
  placeHolder = 'Enter your input',
  inputDataHook,
  liDataHook,
  onOptionChange,
  Highlighter,
}: a | b) => {

  const classes = useStyles();
  const [backspaceHandler, setBackspaceHandler] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [value, setValue] = useState(defaultLabel || '');
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const inputElement = useRef(null);
  const [stateData, viewState] = useViewState(States, {
    options: []
  });

  const primaryOptionLabel = getOptionLabelValue(primaryLabel, title);
  placeHolder = primaryLabel && getOptionLabelValue(primaryLabel, title) || placeHolder;

  useEffect(() => {
    if (open && viewState.get() !== 'Open' && stateData.options.length === 0 && viewState.get() !== 'Error') {
      viewState.set('Open');
    }
  },[open]);

  useEffect(() => {
    switch (viewState.get()) {
      case 'FirstLoad':
        viewState.set('Initial');
        break;

      case 'Open': 
        let data;
        if (typeof options === 'function') {
          data = options();
        } else {
          data = options
        }
        Promise.resolve(data)
        .then(response => {
          if (viewState.get() === 'Open') {
            const fullData = primaryLabel ? [primaryLabel, ...response] : response;
            const viewStateType = response.length > 0 ? 'Content' : 'Result';
            viewState.set(viewStateType, { options: fullData });
          }
        })
        .catch(err => {
          if (viewState.get() === 'Open') {
            viewState.set('Error');
          }
        });
        break;

      default:
    }
  }, [viewState.get()]);

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    options: stateData.options.length ? [...stateData.options, ''] : [],
    value,
    onClose: () => setOpen(false),
    onOpen: () => setOpen(true),
    getOptionLabel: (option) => getOptionLabelValue(option, title),
    filterOptions: (currentOptions, state) => {
      if (state.inputValue !== '' && !isFiltering) {
        setIsFiltering(true);
      }
      const chosenOptionLabel = getOptionLabelValue(value, title);

      if (state.inputValue === '' && currentOptions.length) {
        // In case we are on empty value, or exactly with value of one option
        return value === '' ? 
        filterEmptyLabelValue(currentOptions).filter(currentOption => 
          primaryOptionLabel !== getOptionLabelValue(currentOption, title)
        ) //In case we on empty value
        : isFiltering ?
        filterEmptyLabelValue(currentOptions).filter(currentOption => 
          _.isEqual(currentOption, value)
        ) // we are filtering with option value
        : filterEmptyLabelValue(currentOptions) // first click on input, so we need all results
      }

      return currentOptions.filter(currentOption => {
        const currentOptionLabel = getOptionLabelValue(currentOption, title);
        if (currentOptionLabel === '' || currentOptionLabel === primaryOptionLabel && chosenOptionLabel === '') {
          return false;
        }  if (currentOptionLabel.toLowerCase().includes(state.inputValue.toLowerCase())) {
          return true;
        }
        return false;
      });
    },
    onChange: (event, newValue) => {
      const newLabelIndex = stateData.options.findIndex(option => _.isEqual(option, newValue));
      const selectedOptionLabel = getOptionLabelValue(selectedOption, title);
      const optionLabel = getOptionLabelValue(stateData.options[newLabelIndex], title);
      if (selectedOptionLabel !== optionLabel) {
        if (newLabelIndex === -1 || optionLabel === primaryOptionLabel) {
          setSelectedOption(primaryLabel);
          setValue('');
        } else {
          setSelectedOption(stateData.options[newLabelIndex]);
          setValue(newValue);
        }
      } else {
        setValue(newValue);
      }
    },
  });

  useEffect(() => {
    const optionLabel = getOptionLabelValue(selectedOption, title);
    if (optionLabel !== '') {
      setBackspaceHandler(false);
      onOptionChange && onOptionChange(selectedOption);
      setIsFiltering(false);
    }
  },[selectedOption]);

  const inputProps = getInputProps() as {onBlur: Function; value: string};
  return (
    <div>
      <div {...getRootProps()} className={classes.inputArea} onClick={() => inputElement.current.focus()}>
        <Input
          {...getInputProps()}
          fullWidth={true}
          onKeyUp={(e) => {
            if (['Backspace', 'Delete'].includes(e.key) && backspaceHandler === false) {
              inputElement.current.select();
              setBackspaceHandler(true);
            }
          }}
          onBlur={(e) => {
            inputProps.onBlur(e);
            setBackspaceHandler(false);
            setIsFiltering(false);
          }}
          disableUnderline
          inputRef={inputElement}
          inputProps={{ style: { cursor: 'pointer'}}}
          style={{cursor: 'pointer'}}
          endAdornment={
              <ExpandMoreIcon
              fontSize='small'
              />
          }
          placeholder={placeHolder}
          data-hook={inputDataHook}
        />
      </div>
      { open ?
        <List className={`${classes.list} bi-dropdown-menu`} {...getListboxProps()}>
          {{
          'Open': 
            <ListItem disableGutters classes={{root: classes.center}} className={'bi-center'}>
              <span>
                <CircularProgress color="inherit" size={20} />
              </span>
            </ListItem>,

          'Error': 
            <ListItem className={classes.bold}>
              <span>
                ERROR OCCURED
              </span>
            </ListItem>,
          
          'Result': NoMatchesState(),

          'Content': 
          groupedOptions.length ?
            groupedOptions.map((option, index) => {
              const currentOptionLabel = getOptionLabelValue(option, title);
              const selectedOptionLabel = getOptionLabelValue(selectedOption, title);

              let currentClassName
              if (primaryLabel && (index === 0) && primaryOptionLabel === currentOptionLabel) {
                currentClassName = classes.primaryOption;
              }
              else if (currentOptionLabel === selectedOptionLabel) {
                currentClassName = classes.bold;
              }

              return (
                <ListItem {...getOptionProps({ option, index })} className={currentClassName} data-hook={liDataHook}>
                  {isFiltering && Highlighter ?
                    <Highlighter
                      term={currentOptionLabel}
                      filter={inputProps.value}
                    /> :
                    currentOptionLabel
                  }
                </ListItem>
            )})
            : NoMatchesState()
        }[viewState.get()]}
        </List> : null
      }
    </div>
  );
}

export default Select;