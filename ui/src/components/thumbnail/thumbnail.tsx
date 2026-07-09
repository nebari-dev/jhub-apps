import { Button } from '@src/components/ui/button';
import { Dialog, DialogContent } from '@src/components/ui/dialog';
import { cn } from '@src/lib/utils';
import { ImageIcon, Trash2, Upload, X } from 'lucide-react';
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
    if (elem?.files && elem.files.length > 0) {
      const droppedFile = elem.files[0];
      setCurrentFile(droppedFile);
    }
  }, [setCurrentFile]);

  const hasSelection = !!currentFile || !!currentImage;

  return (
    <div id={`thumbnail-${id}`} className="flex w-full flex-col">
      {error ? (
        <div className="mb-4 flex items-center rounded bg-[#FDEDED] p-2 text-[rgb(95,33,32)]">
          <X className="mr-2 h-5 w-5 text-destructive" />
          <p className="m-0 w-full flex-1 text-sm text-gray-500">
            <span className="text-[#5f2120]">
              <span className="font-semibold">File is too large.</span> Maximum
              file size is 5MB.
            </span>
          </p>
          <Button
            type="button"
            variant="ghost-secondary"
            size="icon"
            onClick={() => setError(undefined)}
            className="h-8 w-8 text-gray-500"
            aria-label="Dismiss error"
          >
            <X />
          </Button>
        </div>
      ) : null}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop target for file upload */}
      <div
        id={`thumbnail-body-${id}`}
        data-dragging={dragging ? '' : undefined}
        data-selected={hasSelection ? '' : undefined}
        className={cn(
          'flex h-[180px] flex-row gap-x-6',
          dragging && 'border-2 border-dashed border-primary',
        )}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="h-[130px] rounded bg-[#90969c]">
          {hasSelection ? (
            <div className="m-auto">
              <button
                type="button"
                title="View image"
                aria-label="View app thumbnail"
                className="cursor-pointer border-0 bg-transparent p-0"
                onClick={handleViewThumbnail}
              >
                <img
                  src={
                    currentFile
                      ? URL.createObjectURL(currentFile)
                      : currentImage
                  }
                  alt="App thumbnail"
                  className="max-h-[130px] max-w-[225px] rounded"
                />
              </button>
            </div>
          ) : (
            <button
              type="button"
              title="Select an image"
              aria-label="Select an image"
              className="flex h-[130px] w-[225px] cursor-pointer flex-col items-center justify-center border-0 bg-transparent p-0 text-current focus:outline focus:outline-2 focus:outline-primary"
              onClick={handleBrowseThumbnails}
            >
              <ImageIcon className="!h-16 !w-16 text-white" />
            </button>
          )}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            {...props}
          />
        </div>
        <div className="flex flex-col gap-y-4">
          <div className="flex h-10 flex-col gap-x-4 gap-y-3 sm:flex-row">
            <Button
              type="button"
              id="upload-thumbnail-btn"
              variant="secondary"
              onClick={handleBrowseThumbnails}
              className="w-full max-w-[170px]"
            >
              <Upload />
              Select an image
            </Button>
            {hasSelection ? (
              <Button
                type="button"
                id="remove-thumbnail-btn"
                variant="secondary"
                onClick={handleRemoveThumbnail}
                className="w-full max-w-[170px]"
              >
                <Trash2 />
                Remove image
              </Button>
            ) : null}
          </div>
          <p className="hidden w-[340px] text-base text-[#0F101599] md:block">
            Recommended size: 225x130 | JPG, PNG, Max size: 5MB
          </p>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-fit p-6">
          <img
            src={currentFile ? URL.createObjectURL(currentFile) : currentImage}
            alt="App thumbnail"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Thumbnail;
