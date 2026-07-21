import type { ApiErrorBody } from '@mrms/types';
import {
  type ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Global exception filter. Maps every error to the standard MRMS error envelope
 * (Doc 09 §5, error-handling convention §3) and attaches the request
 * correlation id. Internal details never leak to clients; unexpected errors are
 * logged in full with the correlation id for diagnosis.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();
    const correlationId = this.resolveCorrelationId(request);

    const { status, code, message, details } = this.mapException(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${correlationId}] ${request.method} ${request.url} -> ${status} ${code}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiErrorBody = {
      error: { code, message, ...(details ? { details } : {}) },
      correlationId,
    };
    response.status(status).json(body);
  }

  private resolveCorrelationId(request: Request & { id?: string }): string {
    const header = request.headers['x-correlation-id'];
    if (typeof header === 'string' && header.length > 0) return header;
    if (Array.isArray(header) && header[0]) return header[0];
    return request.id ?? 'unknown';
  }

  private mapException(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return this.mapHttpException(status, res, exception.message);
    }
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    };
  }

  private mapHttpException(
    status: number,
    res: string | object,
    fallbackMessage: string,
  ): { status: number; code: string; message: string; details?: Record<string, unknown> } {
    // Nest ValidationPipe returns { message: string[], error, statusCode }.
    if (typeof res === 'object' && res !== null) {
      const record = res as Record<string, unknown>;
      const rawMessage = record.message;
      if (status === HttpStatus.BAD_REQUEST && Array.isArray(rawMessage)) {
        return {
          status,
          code: 'VALIDATION_ERROR',
          message: 'One or more fields are invalid.',
          details: { violations: rawMessage },
        };
      }
      const message = typeof rawMessage === 'string' ? rawMessage : fallbackMessage;
      return { status, code: this.codeForStatus(status), message };
    }
    return { status, code: this.codeForStatus(status), message: res || fallbackMessage };
  }

  private codeForStatus(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.GONE]: 'GONE',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
      [HttpStatus.BAD_GATEWAY]: 'UPSTREAM_ERROR',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    };
    return map[status] ?? (status >= 500 ? 'INTERNAL_ERROR' : 'ERROR');
  }
}
