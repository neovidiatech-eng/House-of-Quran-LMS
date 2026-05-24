export interface Subject {
    id: string;
    name_en?: string;
    name_ar: string;
    active: boolean;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export interface SubjectsData {
    count: number;
    activeCount: number;
    subjects: Subject[];
}

export interface SubjectsResponse {
    message: string;
    status: number;
    data: SubjectsData;
}
