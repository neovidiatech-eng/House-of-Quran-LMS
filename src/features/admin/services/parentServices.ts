import api from '../../../lib/axios';
import { ParentFormData } from '../../../lib/schemas/ParentSchema';
import { ParentChildrenResponse, CreateParentResponse } from '../../../types/parent';
import { Parent, ParentsResponse } from '../../../types/parentsAdmin';

export const getParentChildren = async (): Promise<ParentChildrenResponse> => {
  const response = await api.get('/parent/students');
  return response.data;
};

export const createParent = async (parentData: ParentFormData): Promise<CreateParentResponse> => {
  const response = await api.post('/system/stuff/create-parent', parentData);
  return response.data;
};

export const getAllParents = async (): Promise<ParentsResponse> => {
  const response = await api.get(`/parent/admins`);
  return response.data;
};

export const getParentById = async (parentId: string): Promise<Parent> => {
  const response = await api.get(`/parent/admins/${parentId}`);
  return response.data.data;
}

export const updateParentStatus = async (parentId: string, data:Parent): Promise<CreateParentResponse> => {
  const response = await api.patch(`/parent/admins/${parentId}`, data);
  return response.data;
}

export const deleteParent = async (parentId: string): Promise<CreateParentResponse> => {
  const response = await api.delete(`/parent/admins/${parentId}`);
  return response.data;
}