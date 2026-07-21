import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  as?: 'th' | 'td';
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto rounded-xl border border-gray-200">
      <table className={cn('w-full border-collapse text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }: TableHeaderProps) {
  return (
    <thead className={cn('bg-gray-50', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody className={cn('divide-y divide-gray-100', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr className={cn('hover:bg-gray-50 transition-colors', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableCell({ children, as = 'td', className, ...props }: TableCellProps) {
  const Component = as;
  const baseStyles = 'px-4 py-3 text-left';
  const headerStyles = as === 'th' ? 'font-semibold text-gray-900' : 'text-gray-700';

  return (
    <Component className={cn(baseStyles, headerStyles, className)} {...props}>
      {children}
    </Component>
  );
}