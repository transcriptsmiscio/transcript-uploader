import React, { useRef } from "react";

type Props = {
  accept?: string;
  required?: boolean;
  onFileSelected: (file?: File) => void;
  buttonClassName?: string;
};

export default function FileButton({ accept, required, onFileSelected, buttonClassName }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : undefined;
    onFileSelected(file);
    if (inputRef.current) {
      // Reset to allow selecting the same file again
      inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        required={required}
        onChange={handleChange}
        className="sr-only"
      />
      <button
        type="button"
        className={
          buttonClassName ||
          "w-full h-12 px-4 py-2 rounded-xl bg-brand-navy text-white border border-brand-navy hover:bg-brand-navy/90 focus:outline-none focus:ring-2 focus:ring-brand-navy/40 transition"
        }
        onClick={handleClick}
      >
        Choose File
      </button>
    </>
  );
}


