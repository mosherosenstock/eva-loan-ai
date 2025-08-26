
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

export default function BusinessApplicationFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    onFiltersChange({
      status: "all",
      sugef_rating: "all",
      amount_range: "all",
      business_type: "all",
      ml_recommendation: "all"
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

        <Select value={filters.sugef_rating} onValueChange={(value) => handleFilterChange('sugef_rating', value)}>
            <SelectTrigger className="w-36">
                <SelectValue placeholder="SUGEF Rating" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All SUGEF</SelectItem>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
                <SelectItem value="D">D</SelectItem>
            </SelectContent>
        </Select>

        <Select value={filters.amount_range} onValueChange={(value) => handleFilterChange('amount_range', value)}>
            <SelectTrigger className="w-32">
            <SelectValue placeholder="Amount" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All Amounts</SelectItem>
            <SelectItem value="0-50000">$0 - $50K</SelectItem>
            <SelectItem value="50000-100000">$50K - $100K</SelectItem>
            <SelectItem value="100000-250000">$100K - $250K</SelectItem>
            <SelectItem value="250000-500000">$250K - $500K</SelectItem>
            <SelectItem value="500000">$500K+</SelectItem>
            </SelectContent>
        </Select>

        <Select value={filters.business_type} onValueChange={(value) => handleFilterChange('business_type', value)}>
            <SelectTrigger className="w-36">
            <SelectValue placeholder="Business Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="new">New Business</SelectItem>
                <SelectItem value="existing">Existing Business</SelectItem>
            </SelectContent>
        </Select>

        <Select value={filters.ml_recommendation} onValueChange={(value) => handleFilterChange('ml_recommendation', value)}>
            <SelectTrigger className="w-40">
                <SelectValue placeholder="AI Recommendation" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Recommendations</SelectItem>
                <SelectItem value="APPROVE">Approve</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="DENY">Deny</SelectItem>
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
