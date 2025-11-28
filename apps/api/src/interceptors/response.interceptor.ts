import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResponseEnvelope<T = unknown> {
  code: number;
  data: T;
  message: string;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope> {
    return next.handle().pipe(
      map((data) => {
        // 如果数据已经是 ResponseEnvelope 类型，则直接返回
        if (data && typeof data === 'object' && 'code' in data && 'data' in data && 'message' in data) {
          return data as ResponseEnvelope;
        }

        // 否则，返回默认的响应结构
        return {
          code: 0,
          data,
          message: 'success',
        } satisfies ResponseEnvelope;
      }),
    );
  }
}
