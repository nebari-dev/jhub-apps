import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { Modal } from './modal';

describe('Modal', () => {
  test('renders default modal successfully', () => {
    const { baseElement } = render(
      <Modal title="Modal 1" setIsOpen={jest.fn()} body={<></>} />,
    );
    expect(baseElement).toBeTruthy();
  });

  test('renders the modal title', () => {
    const { getByText } = render(
      <Modal title="Modal 1" setIsOpen={jest.fn()} body={<></>} />,
    );
    expect(getByText('Modal 1')).toBeInTheDocument();
  });

  test('renders the modal body', () => {
    const { getByText } = render(
      <Modal
        title="Modal 1"
        setIsOpen={jest.fn()}
        body={<div>Body content</div>}
      />,
    );
    expect(getByText('Body content')).toBeInTheDocument();
  });

  test('renders the modal footer when provided', () => {
    const { getByText } = render(
      <Modal
        title="Modal 1"
        setIsOpen={jest.fn()}
        body={<></>}
        footer={<div>Footer content</div>}
      />,
    );
    expect(getByText('Footer content')).toBeInTheDocument();
  });

  test('does not render the modal footer when not provided', () => {
    const { queryByText } = render(
      <Modal title="Modal 1" setIsOpen={jest.fn()} body={<></>} />,
    );
    expect(queryByText('Footer content')).not.toBeInTheDocument();
  });

  test('calls setIsOpen with false when the overlay is clicked', () => {
    const setIsOpen = jest.fn();
    const { baseElement } = render(
      <Modal title="Modal 1" setIsOpen={setIsOpen} body={<></>} />,
    );
    const overlay = baseElement.querySelector('.modal-overlay') as HTMLElement;
    fireEvent.click(overlay);
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  test('calls setIsOpen with false when the close button is clicked', () => {
    const setIsOpen = jest.fn();
    const { baseElement } = render(
      <Modal title="Modal 1" setIsOpen={setIsOpen} body={<></>} />,
    );
    const btn = baseElement.querySelector('.modal-close-btn') as HTMLElement;
    fireEvent.click(btn);
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });
});
