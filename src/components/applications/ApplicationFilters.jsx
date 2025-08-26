
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

export default function ApplicationFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    onFiltersChange({
      status: "all",
      purpose: "all", // changed from loan_purpose
      amount_range: "all"
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== "all").length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-600">Filters:</span>
        {activeFilterCount > 0 && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {activeFilterCount} active
          </Badge>
        )}
      </div>

      <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Submitted">Submitted</SelectItem>
          <SelectItem value="Under Review">Under Review</SelectItem>
          <SelectItem value="Approved">Approved</SelectItem>
          <SelectItem value="Rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.purpose} onValueChange={(value) => handleFilterChange('purpose', value)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Purpose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Purposes</SelectItem>
          <SelectItem value="debt_consolidation">Debt Consolidation</SelectItem>
          <SelectItem value="home_improvement">Home Improvement</SelectItem>
          <SelectItem value="business">Business</SelectItem>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="auto">Auto</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.amount_range} onValueChange={(value) => handleFilterChange('amount_range', value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Amount" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Amounts</SelectItem>
          <SelectItem value="0-10000">$0 - $10K</SelectItem>
          <SelectItem value="10000-25000">$10K - $25K</SelectItem>
          <SelectItem value="25000-50000">$25K - $50K</SelectItem>
          <SelectItem value="50000-100000">$50K - $100K</SelectItem>
          <SelectItem value="100000">$100K+</SelectItem>
        </SelectContent>
      </Select>

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="text-slate-600 hover:text-slate-800"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
