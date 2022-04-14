import { MouseEventHandler } from 'react';

export const Button = ({
  variant,
  children,
  onClick,
  className,
  props,
}: {
  variant: 'primary' | 'secondary' | 'cta';
  children: string | JSX.Element;
  onClick: (() => void) | MouseEventHandler<HTMLButtonElement>;
  className?: string;
  props?: JSX.IntrinsicAttributes;
}) => {
  let styles = {
    primary: 'font-serif text-2xl shadow-primus bg-primus-orange text-white py-5px rounded-3px',
    secondary:
      'font-serif text-2xl shadow-primus bg-primus-dark-grey text-white py-5px rounded-3px',
    cta: 'font-serif text-2xl shadow-primus bg-primus-orange text-white py-5 rounded-3px w-full',
  };

  return (
    <button className={`${styles[variant]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};
