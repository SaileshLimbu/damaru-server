import { SetMetadata } from '@nestjs/common';

export const EXCLUDE_INTERCEPTOR_KEY = 'ExcludeInterceptor';

export const ExcludeInterceptor = () => SetMetadata(EXCLUDE_INTERCEPTOR_KEY, true);
