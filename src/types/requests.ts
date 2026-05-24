export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type RequestType = 'reschedule' | 'cancel' | 'other';

export interface RequestedData {
    new_end_time: string;
    new_start_time: string;
    suggested_notes: string;
}

export interface Requester {
    name: string;
    email: string;
}

export interface RequestSchedule {
    id: string;
    teacherId: string;
    studentId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    notes: string | null;
    description: string;
    link: string;
    title: string;
    type: string;
    end_time: string;
    start_time: string;
    day_of_week: string;
    is_recurring: boolean;
    parent_recurring_id: string | null;
    subjectId: string;
    rescheduledToId: string | null;
    rescheduledFromId: string | null;
}

export interface UserRequest {
    id: string;
    sessionId: string;
    requesterId: string;
    requesterRole: string;
    type: RequestType;
    status: RequestStatus;
    reason: string;
    requestedData: RequestedData;
    adminId: string | null;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
    requester: Requester;
    schedule: RequestSchedule;
}

export interface GetRequestsResponse {
    message: string;
    status: number;
    dir: 'en' | 'ar';
    data: UserRequest[];
}

export interface CreateRequestParams {
    sessionId: string;
    type: RequestType;
    reason: string;
    requestedData: RequestedData;
}

export interface CreateRequestResponse {
    message: string;
    status: number;
    data: UserRequest;
}
