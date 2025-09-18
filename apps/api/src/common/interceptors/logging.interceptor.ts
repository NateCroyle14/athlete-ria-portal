import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>() as any;
    const started = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - started;
        const method = req?.method ?? '';
        const url = req?.originalUrl ?? req?.url ?? '';
        // Keep it terse; you can swap to Nest logger if you prefer
        console.log(`[${method}] ${url} ${ms}ms`);
      })
    );
  }
}