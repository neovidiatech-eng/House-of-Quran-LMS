import { AttachedFile } from './lmsCourses';

export interface CoursesResponse {
  message: string;
  status: number;
  lang: string;
  data: CoursesData;
}

export interface CoursesData {
  items: CourseItem[];
  pagination: Pagination;
}

export interface CourseItem {
  id: string;
  title: string;
  description: string;
  image: string;
  status: string;
  videoUrl: string;
  duration: number;
  pdfurl: string;
  subjectId: string;
  attatchments: string | AttachedFile | AttachedFile[] | null;
  createdAt: string;
  updatedAt: string;
  subject: Subject;
}

export interface Subject {
  id: string;
  name_en: string;
  name_ar: string;
  active: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}