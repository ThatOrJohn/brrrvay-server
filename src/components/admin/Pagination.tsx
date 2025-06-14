
import React from 'react';

type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

interface PaginationProps {
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  label: string;
}

export default function Pagination({
  pagination,
  setPagination,
  label
}: PaginationProps) {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  
  return (
    <div className="flex items-center justify-between mt-4 pt-4 px-4 border-t border-[#333333] bg-[#1A1A1A]">
      <span className="text-sm text-[#666666]">
        {label} {pagination.total} total
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          disabled={pagination.page === 1}
          className="px-3 py-1 bg-[#2A2A2A] text-white rounded-lg disabled:opacity-50 hover:bg-[#3A3A3A] transition-colors text-sm"
        >
          Previous
        </button>
        <span className="px-3 py-1 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] text-sm min-w-[80px] text-center">
          Page {pagination.page} of {totalPages}
        </span>
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          disabled={pagination.page >= totalPages}
          className="px-3 py-1 bg-[#2A2A2A] text-white rounded-lg disabled:opacity-50 hover:bg-[#3A3A3A] transition-colors text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
