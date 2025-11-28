import { SetMetadata } from '@nestjs/common';

export const PUBLIC_API_KEY = 'isPublicApi';
export const PublicApi = () => SetMetadata(PUBLIC_API_KEY, true);
