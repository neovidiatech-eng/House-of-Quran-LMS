export interface AttachedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  url: string;
}
export interface Level {
  id: number;
  name: string;
  color: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  levelId: number;
  videoUrl: string;
  thumbnailUrl: string;
  attachments: AttachedFile[];
  createdAt: string;
}


export interface CourseForm {
  title: string;
  description: string;
  category: string;
  levelId: number;
  videoUrl: string;
  thumbnailFile: File | null;
  thumbnailPreview: string;
  attachments: AttachedFile[];
}

export interface LevelColorOption {
  label: string;
  value: string;
}

export interface CourseFormFieldsProps {
  subjectCategories: { id: string; name: string }[];
  thumbnailInputRef: React.RefObject<HTMLInputElement>;
  attachInputRef: React.RefObject<HTMLInputElement>;
}