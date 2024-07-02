import CloseIcon from '@mui/icons-material/Close';
import InsertPhotoIcon from '@mui/icons-material/CropOriginalRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import ErrorIcon from '@mui/icons-material/Error';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import { Box, Button, Dialog, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import './thumbnail.css';

export interface ThumbnailProps {
  /**
   * The unique identifier for this component
   */
  id: string;
  /**
   * The name for the file input field
   */
  name?: string;
  /**
   * The image to display as the thumbnail
   */
  currentImage?: string;
  /**
   * The function to call when an image is selected
   */
  setCurrentImage: (image: string | undefined) => void;
  /**
   * The file to display as the thumbnail
   */
  currentFile?: File;
  /**
   * The function to call when a file is selected
   */
  setCurrentFile: (file: File | undefined) => void;
}

export const Thumbnail = ({
  id,
  name,
  currentImage,
  setCurrentImage,
  currentFile,
  setCurrentFile,
  ...props
}: ThumbnailProps & JSX.IntrinsicElements['input']) => {
  const theme = useTheme();
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    setCurrentFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // istanbul ignore next
    if (!e.target.files) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (e.target.files[0].size > maxSize) {
      setError('File size exceeds 5MB.');
      return;
    }
    const uploadedFile = e.target.files[0];
    setCurrentFile(uploadedFile);
    setError(undefined);
  };

  const handleViewThumbnail = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setOpen(true);
  };

  const handleBrowseThumbnails = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const elem = inputRef.current;
    if (elem) elem.click();
  };

  const handleRemoveThumbnail = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const elem = inputRef.current;
    if (elem) {
      elem.value = '';
      setCurrentFile(undefined);
      setCurrentImage(undefined);
    }
  };

  useEffect(() => {
    const elem = inputRef.current;
    if (elem && elem.files && elem.files.length > 0) {
      const droppedFile = elem.files[0];
      setCurrentFile(droppedFile);
    }
  }, [inputRef, setCurrentFile]);

  return (
    <Box
      id={`thumbnail-${id}`}
      className="thumbnail"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        columnGap: '24px',
        width: '100%',
        border: 'none',
      }}
    >
      {error ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FDEDED',
            color: theme.palette.error.main,
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <ErrorIcon sx={{ marginRight: '8px' }} />
          <Typography
            variant="body2"
            sx={{ flexGrow: 1, width: '100%', color: theme.palette.gray.main }}
          >
            <span className="error-msg">
              <span className="weight600">File is too large.</span> Maximum file
              size is 5MB.
            </span>
          </Typography>
          <IconButton
            size="small"
            onClick={() => setError(undefined)}
            sx={{ color: theme.palette.gray.main }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      ) : null}
      <Box
        id={`thumbnail-body-${id}`}
        className={`thumbnail-body ${dragging ? 'dragging' : ''} ${currentFile || currentImage ? 'selected' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          columnGap: '24px',
          height: '180px',
        }}
      >
        <Box
          className="thumbnail-dropzone"
          sx={{
            height: '130px',
            backgroundColor: '#90969c',
            borderRadius: '4px',
          }}
        >
          {currentFile || currentImage ? (
            <Box sx={{ margin: 'auto auto' }}>
              <img
                src={
                  currentFile ? URL.createObjectURL(currentFile) : currentImage
                }
                alt="App thumbnail"
                title="Click to view image"
                className="thumbnail-img"
                style={{
                  maxWidth: '225px',
                  maxHeight: '130px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={handleViewThumbnail}
              />
            </Box>
          ) : (
            <Box
              tabIndex={0}
              title="Select an image"
              className="thumbnail-icon-container"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '225px',
                height: '130px',
                cursor: 'pointer',
                '&:focus': {
                  outlineColor: theme.palette.primary.main,
                },
              }}
              onClick={handleBrowseThumbnails}
            >
              <InsertPhotoIcon
                sx={{
                  width: '64px',
                  height: '64px',
                  color: theme.palette.common.white,
                }}
              />
            </Box>
          )}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            {...props}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: '16px' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              columnGap: '16px',
              rowGap: '12px',
              height: '40px',
            }}
          >
            <Button
              id="upload-thumbnail-btn"
              variant="contained"
              color="secondary"
              startIcon={<UploadRoundedIcon />}
              onClick={handleBrowseThumbnails}
              sx={{ width: '100%', maxWidth: '170px' }}
            >
              Select an image
            </Button>
            {currentFile || currentImage ? (
              <Button
                id="remove-thumbnail-btn"
                variant="contained"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={handleRemoveThumbnail}
                hidden={!currentFile && !currentImage}
                sx={{ width: '100%', maxWidth: '170px' }}
              >
                Remove image
              </Button>
            ) : (
              <></>
            )}
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: '#0F101599',
              width: '340px',
              display: { xs: 'none', md: 'block' },
            }}
          >
            Recommended size: 225x130 | JPG, PNG, Max size: 5MB
          </Typography>
        </Box>
      </Box>
      <Dialog onClose={() => setOpen(false)} open={open}>
        <img
          src={currentFile ? URL.createObjectURL(currentFile) : currentImage}
          alt="App thumbnail"
        />
      </Dialog>
    </Box>
  );
};

export default Thumbnail;
