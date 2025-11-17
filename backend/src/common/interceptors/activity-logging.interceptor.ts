import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ActivityLogService } from '../../activity-log/activity-log.service';
import { ActivityAction } from '../enums/activity-action.enum';

@Injectable()
export class ActivityLoggingInterceptor implements NestInterceptor {
  constructor(private readonly activityService: ActivityLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, originalUrl, body, user, ip } = request;

    return next.handle().pipe(
      tap(() => {
        if (!user) {
          return;
        }

        const action = this.mapMethodToAction(method);
        if (!action) {
          return;
        }

        void this.activityService.createLog({
          userId: user.userId,
          userType: user.userType,
          action,
          metadata: {
            path: originalUrl,
            body,
            statusCode: response.statusCode,
          },
          ipAddress: ip,
        });
      }),
    );
  }

  private mapMethodToAction(method: string): ActivityAction | undefined {
    switch (method.toUpperCase()) {
      case 'POST':
        return ActivityAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return ActivityAction.UPDATE;
      case 'DELETE':
        return ActivityAction.DELETE;
      default:
        return undefined;
    }
  }
}
