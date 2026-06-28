import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilePickerField } from './file-picker-field';
import { useSettingsStore } from '../../stores/settings-store';

function makeFile(name: string, sizeBytes: number, type: string): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe('FilePickerField', () => {
  const accept = ['application/pdf', 'image/png', 'image/jpeg'];
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockReset();
    useSettingsStore.setState({ language: 'en' });
  });

  it('renders label and hint and button', () => {
    render(
      <FilePickerField
        label="Documents"
        files={[]}
        onChange={onChange}
        maxFiles={3}
        maxSizeBytes={10 * 1024 * 1024}
        accept={accept}
      />,
    );
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Choose files/i })).toBeInTheDocument();
  });

  it('adds a valid file', () => {
    render(
      <FilePickerField
        label="Documents"
        files={[]}
        onChange={onChange}
        maxFiles={3}
        maxSizeBytes={10 * 1024 * 1024}
        accept={accept}
      />,
    );
    const file = makeFile('a.pdf', 1024, 'application/pdf');
    const input = screen.getByLabelText(/Choose files/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalled();
    const arg = onChange.mock.calls[0][0] as File[];
    expect(arg).toHaveLength(1);
    expect(arg[0].name).toBe('a.pdf');
  });

  it('rejects file larger than maxSizeBytes', () => {
    render(
      <FilePickerField
        label="Documents"
        files={[]}
        onChange={onChange}
        maxFiles={3}
        maxSizeBytes={1024}
        accept={accept}
        hint="hint"
      />,
    );
    const big = makeFile('big.pdf', 4096, 'application/pdf');
    const input = screen.getByLabelText(/Choose files/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [big] } });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/exceeds 10MB/i)).toBeInTheDocument();
  });

  it('rejects when total would exceed maxFiles', () => {
    render(
      <FilePickerField
        label="Documents"
        files={[makeFile('a.pdf', 10, 'application/pdf'), makeFile('b.pdf', 10, 'application/pdf')]}
        onChange={onChange}
        maxFiles={2}
        maxSizeBytes={10 * 1024 * 1024}
        accept={accept}
      />,
    );
    const extra = makeFile('c.pdf', 10, 'application/pdf');
    const input = screen.getByLabelText(/Choose files/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [extra] } });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/Maximum/i)).toBeInTheDocument();
  });

  it('rejects file with disallowed MIME', () => {
    render(
      <FilePickerField
        label="Documents"
        files={[]}
        onChange={onChange}
        maxFiles={3}
        maxSizeBytes={10 * 1024 * 1024}
        accept={accept}
      />,
    );
    const txt = makeFile('notes.txt', 10, 'text/plain');
    const input = screen.getByLabelText(/Choose files/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [txt] } });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/not supported/i)).toBeInTheDocument();
  });

  it('removes a file when Remove is clicked', () => {
    const f1 = makeFile('a.pdf', 10, 'application/pdf');
    render(
      <FilePickerField
        label="Documents"
        files={[f1]}
        onChange={onChange}
        maxFiles={3}
        maxSizeBytes={10 * 1024 * 1024}
        accept={accept}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /^Remove$/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});