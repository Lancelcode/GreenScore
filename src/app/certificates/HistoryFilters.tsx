'use client';

import Form from 'next/form';
import { useRef } from 'react';

interface HistoryFiltersProps {
  sort: 'newest' | 'oldest';
  level: string;
  levels: string[];
}

/** Sort and award filters; changing either one reloads the list. */
export function HistoryFilters({ sort, level, levels }: HistoryFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();

  return (
    <Form action="/certificates" ref={formRef} className="d-flex gap-2 flex-wrap">
      <label htmlFor="sortSelect" className="visually-hidden">
        Sort order
      </label>
      <select name="sort" id="sortSelect" className="form-select form-select-sm w-auto" defaultValue={sort} onChange={submit}>
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
      <label htmlFor="levelSelect" className="visually-hidden">
        Filter by award
      </label>
      <select name="level" id="levelSelect" className="form-select form-select-sm w-auto" defaultValue={level} onChange={submit}>
        <option value="">All Awards</option>
        {levels.map((l) => (
          <option value={l} key={l}>
            {l}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="btn btn-sm btn-light">
          Apply
        </button>
      </noscript>
    </Form>
  );
}
