import { cn } from '@linknest/utils/lib';
import { type JSX } from 'react';

export function Card({
  className,
  title,
  children,
  href,
  description,
}: {
  className?: string;
  title: string;
  children?: React.ReactNode;
  href: string;
  description?: string;
}): JSX.Element {
  return (
    <div className={cn('card card-side bg-base-100 shadow-sm', className)}>
      <figure>
        ?
      </figure>
      <div className="card-body">
        { children ? (
          children
        ) : (
          <>
            <h2 className="card-title">{title}</h2>
            <p>{description}</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={() => window.open(href, '_blank')}>
                Go to
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
