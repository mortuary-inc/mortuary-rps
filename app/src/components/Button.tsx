import { MouseEventHandler } from 'react';

export const Button = ({
  variant,
  children,
  onClick,
  className,
  props,
}: {
  variant: 'primary' | 'secondary';
  children: string | JSX.Element;
  onClick: (() => void) | MouseEventHandler<HTMLButtonElement>;
  className?: string;
  props?: JSX.IntrinsicAttributes;
}) => {
  let styles = `font-serif text-2xl shadow-primus bg-${
    variant === 'primary' ? 'primus-orange text-white' : 'primus-dark-grey text-white'
  } py-5px rounded-3px`;

  return (
    <button className={`${styles} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};
