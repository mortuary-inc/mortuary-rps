import { useState } from 'react';

interface CopyProps {
  link: string;
  className?: string;
}

const ClipboardCopy = ({ link, className }: CopyProps) => {
  const [isCopied, setIsCopied] = useState(false);

  // This is the function we wrote earlier
  async function copyTextToClipboard(text) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }

  // onClick handler function for the copy button
  const handleCopyClick = () => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(link)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <button
      onClick={handleCopyClick}
      className={
        (className || '') +
        ' text-secondary font-sansLight text-sm border border-third px-3 py-1 rounded-full relative w-20 hover:bg-third hover:text-primary transition-colors ease-in-out'
      }
    >
      <input type="text" value={link} readOnly className="hidden" />

      <span className="text-sm align-bottom leading-4">{isCopied ? 'Copied!' : 'Share'}</span>
    </button>
  );
};

export default ClipboardCopy;
