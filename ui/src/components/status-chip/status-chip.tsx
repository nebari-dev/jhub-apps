import { Chip } from '@mui/material';
interface StatusChipProps {
  status: string;
}
const getStatusStyles = (status: string) => {
  let styles;
  switch (status) {
    case 'Ready':
      styles = {
        bgcolor: 'rgb(255, 255, 255)', // #ffffff
        border: '1px solid rgb(46, 125, 50)', // #2E7D32
        color: 'rgb(46, 125, 50)', // #2E7D32
      };
      break;
    case 'Pending':
      styles = {
        bgcolor: 'rgb(234, 181, 78)', // #EAB54E
        color: 'black',
      };
      break;
    case 'Running':
      styles = {
        bgcolor: 'rgb(46, 125, 50)', // #2E7D32
        color: 'white',
      };
      break;
    case 'Unknown':
    default:
      styles = {
        bgcolor: 'rgb(121, 121, 124)', // #79797C
        color: 'white',
      };
      break;
  }
  return styles;
};

export const StatusChip = ({ status }: StatusChipProps): React.ReactElement => (
  <Chip
    label={status || 'Default'}
    size="small"
    sx={{ fontWeight: 600, fontSize: '12px', ...getStatusStyles(status) }}
  />
);
export default StatusChip;
