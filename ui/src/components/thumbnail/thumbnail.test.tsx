import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import Thumbnail from './thumbnail';

describe('Thumbnail', () => {
  test('renders a default thumbnail successfully', () => {
    const { baseElement } = render(
      <Thumbnail
        id="thumbnail"
        currentFile={undefined}
        setCurrentFile={jest.fn()}
        currentImage={undefined}
        setCurrentImage={jest.fn()}
      />,
    );
    expect(baseElement).toBeTruthy();
  });

  test('calls setCurrentFile when a file is selected', () => {
    const setCurrentFile = jest.fn();
    const { baseElement } = render(
      <Thumbnail
        id="thumbnail"
        currentFile={undefined}
        setCurrentFile={setCurrentFile}
        currentImage={undefined}
        setCurrentImage={jest.fn()}
      />,
    );

    const file = new File(['(1234567)'], 'somefile.png', { type: 'image/png' });
    const input = baseElement.querySelector('#thumbnail');
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      expect(setCurrentFile).toHaveBeenCalledWith(file);
    }
  });

  test('displays the current image when provided', () => {
    const currentImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    render(
      <Thumbnail
        id="thumbnail"
        currentFile={undefined}
        setCurrentFile={jest.fn()}
        currentImage={currentImage}
        setCurrentImage={jest.fn()}
      />,
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', currentImage);
  });

  test('should browse for a file', () => {
    const { baseElement } = render(
      <Thumbnail
        id="thumbnail"
        currentFile={undefined}
        setCurrentFile={jest.fn()}
        currentImage={undefined}
        setCurrentImage={jest.fn()}
      />,
    );

    const btn = baseElement.querySelector('#upload-thumbnail-btn');
    if (btn) {
      fireEvent.click(btn);
    }
    expect(btn).toBeTruthy();
  });

  test('should remove an existing thumbnail', () => {
    const currentImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    const { baseElement } = render(
      <Thumbnail
        id="thumbnail"
        currentFile={undefined}
        setCurrentFile={jest.fn()}
        currentImage={currentImage}
        setCurrentImage={jest.fn()}
      />,
    );

    const btn = baseElement.querySelector('#remove-thumbnail-btn');
    if (btn) {
      fireEvent.click(btn);
    }
    expect(btn).toBeTruthy();
  });

  test('handles file drag and drop', () => {
    const spy = jest.fn();
    const { baseElement } = render(
      <Thumbnail
        id="thumbnail"
        currentFile={undefined}
        setCurrentFile={spy}
        currentImage={undefined}
        setCurrentImage={jest.fn()}
      />,
    );

    const dropzone = baseElement.querySelector(
      '#thumbnail-body-thumbnail',
    ) as HTMLDivElement;

    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [new File(['hello'], 'hello.png', { type: 'image/png' })],
      },
    });

    expect(spy).toHaveBeenCalled();
  });

  test('handles file drag enter and leave', () => {
    const spy = jest.fn();
    const { baseElement } = render(
      <Thumbnail
        id="thumbnail"
        currentFile={undefined}
        setCurrentFile={spy}
        currentImage={undefined}
        setCurrentImage={jest.fn()}
      />,
    );

    const dropzone = baseElement.querySelector(
      '#thumbnail-body-thumbnail',
    ) as HTMLDivElement;

    fireEvent.dragEnter(dropzone);
    fireEvent.dragLeave(dropzone);

    expect(spy).not.toHaveBeenCalled();
  });
});
