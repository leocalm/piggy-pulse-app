import { CategoryResponse } from '@/types/category';

export interface BudgetResponse {
  id: string;
  name: string;
  start_day: number;
}

export interface BudgetRequest {
  name: string;
  start_day: number;
}

export interface BudgetCategoryResponse {
  id: string;
  category_id: string;
  budgeted_value: number;
  category: CategoryResponse;
}

export interface BudgetCategoryRequest {
  category_id: string;
  budgeted_value: number;
}
