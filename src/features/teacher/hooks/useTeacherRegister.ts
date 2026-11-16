import { useMutation } from '@tanstack/react-query';
import { registerTeacher } from '../../../services/AuthServices';
import { TeacherRegisterInput } from '../../../lib/schemas/RegisterSchema';

export const useTeacherRegister = () => {
    return useMutation({
        mutationFn: async (data: Omit<TeacherRegisterInput, 'age'> & { timezone: string, comfirmPassword?: string, age?: number }) => {
            return await registerTeacher(data);
        },
    });
};
