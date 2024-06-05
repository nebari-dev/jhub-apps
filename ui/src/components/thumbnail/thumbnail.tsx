import InsertPhotoIcon from '@mui/icons-material/CropOriginalRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import { Box, Button, Dialog, Typography } from '@mui/material';
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
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
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
    const uploadedFile = e.target.files[0];
    setCurrentFile(uploadedFile);
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
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: '24px',
        width: '500px',
        height: '180px',
        border: 'none',
      }}
    >
      <Box
        id={`thumbnail-body-${id}`}
        className={`thumbnail-body ${dragging ? 'dragging' : ''} ${currentFile || currentImage ? 'selected' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
              alt="App thumnail"
              className="thumbnail-img"
              onClick={handleViewThumbnail}
            />
          </Box>
        ) : (
          <Box
            tabIndex={0}
            title="Upload thumbnail"
            className="thumbnail-icon-container"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '225px',
              height: '130px',
              cursor: 'pointer',
            }}
            onClick={handleBrowseThumbnails}
          >
            <InsertPhotoIcon className="thumbnail-icon" />
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
            Select an Image
          </Button>
          {currentFile || currentImage ? (
            <Button
              id="remove-thumbnail-btn"
              variant="contained"
              color="secondary"
              startIcon={<DeleteIcon />}
              onClick={handleRemoveThumbnail}
              disabled={!currentFile && !currentImage}
              hidden={!currentFile && !currentImage}
              sx={{ width: '100%', maxWidth: '170px' }}
            >
              Remove Image
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
      <Dialog onClose={() => setOpen(false)} open={open}>
        <img
          src={currentFile ? URL.createObjectURL(currentFile) : currentImage}
          alt="App thumnail"
        />
      </Dialog>
    </Box>
  );
};

export default Thumbnail;
