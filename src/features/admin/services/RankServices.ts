import api from "../../../lib/axios";
import {
  GetRanksParams,
  GetRanksResponse,
  CreateRankPayload,
  CreateRankResponse,
  AssignRankPayload,
  AssignRankResponse,
  UpdateRankPayload,
  UpdateRankResponse,
  DeleteRankResponse,
} from "../../../types/rank";

export const getAllRanks = async (params?: GetRanksParams): Promise<GetRanksResponse> => {
  const response = await api.get('/ranks', { params });
  return response.data;
};

export const createRank = async (payload: CreateRankPayload): Promise<CreateRankResponse> => {
  const response = await api.post('/ranks', payload);
  return response.data;
};

export const assignRankToStudent = async (payload: AssignRankPayload): Promise<AssignRankResponse> => {
  const response = await api.patch('/ranks/assign', payload);
  return response.data;
};

export const updateRank = async (id: string, payload: UpdateRankPayload): Promise<UpdateRankResponse> => {
  const response = await api.patch(`/ranks/${id}`, payload);
  return response.data;
};

export const deleteRank = async (id: string): Promise<DeleteRankResponse> => {
  const response = await api.delete(`/ranks/${id}`);
  return response.data;
};
