import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import { grey, blue } from '@material-ui/core/colors';

const StyledInput = withStyles({
  root: {
    border: '1px solid #ebebec',
    height: '36px',
    minWidth: '200px',
    padding: '6px 10px',
    fontFamily: 'Open Sans',
    fontSize: '12px',
    color: grey[800],
    backgroundColor: 'white',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    '&:hover': {
      borderColor: blue[100],
    },
    "&.Mui-focused": {
      borderColor: blue[300],
    }
  }
})(Input);

export default StyledInput;