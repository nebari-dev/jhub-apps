import DeleteIcon from '@mui/icons-material/Delete';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Dialog } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

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
    <div id={`thumbnail-${id}`} className="thumbnail">
      <div
        id={`thumbnail-body-${id}`}
        className={`thumbnail-body ${dragging ? 'dragging' : ''} ${currentFile || currentImage ? 'bg-white' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {currentFile || currentImage ? (
          <div>
            <img
              src={
                currentFile ? URL.createObjectURL(currentFile) : currentImage
              }
              alt="App thumnail"
            />
          </div>
        ) : (
          <div
            className="thumbnail-icon-container"
            tabIndex={0}
            onClick={handleBrowseThumbnails}
          >
            <InsertPhotoOutlinedIcon className="thumbnail-icon" />
          </div>
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
      </div>
      <div className="thumbnail-actions">
        <Button
          id="view-thumbnail-btn"
          variant="contained"
          color="secondary"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={handleViewThumbnail}
          disabled={!currentFile && !currentImage}
        >
          View Thumbnail
        </Button>
        <Button
          id="upload-thumbnail-btn"
          variant="contained"
          color="secondary"
          size="small"
          startIcon={<UploadFileIcon />}
          onClick={handleBrowseThumbnails}
        >
          Upload Thumbnail
        </Button>
        <Button
          id="remove-thumbnail-btn"
          variant="contained"
          color="secondary"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={handleRemoveThumbnail}
          disabled={!currentFile && !currentImage}
        >
          Remove Thumbnail
        </Button>
      </div>
      <Dialog onClose={() => setOpen(false)} open={open}>
        <img
          src={currentFile ? URL.createObjectURL(currentFile) : currentImage}
          alt="App thumnail"
        />
      </Dialog>
    </div>
  );
};

export default Thumbnail;
