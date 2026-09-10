import { useEffect, useMemo, useState } from "react";

export interface PagedList<T> {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  pageItems: T[];
  pageSize: number;
}

/** Paginates `items` client-side and resets to page 1 whenever the underlying list changes
 *  (e.g. a new search/filter produced a different result set). */
export function usePagedList<T>(items: T[], pageSize = 20): PagedList<T> {
  const [page, setPage] = useState(1);

  // items is a new array reference on every filter/search change — reset paging then.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPage(1);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((clampedPage - 1) * pageSize, clampedPage * pageSize),
    [items, clampedPage, pageSize],
  );

  return { page: clampedPage, setPage, totalPages, pageItems, pageSize };
}
