import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { LoggingRepository } from '../repositories/logging.repository';
import { logGlobalError } from '../common/logger';

/**
 * 全局异常过滤器（NestJS ExceptionFilter）
 *
 * 作用：
 * - 捕获应用中未被处理的异常，统一格式化 HTTP 响应
 * - 将异常记录到日志系统，并附带请求级关联 ID（correlationId）方便追踪
 * - 与 `nestjs-cls` 集成，在响应体中透出关联 ID
 *
 * 使用方式：
 * - 在应用入口通过 `app.useGlobalFilters(new GlobalExceptionFilter(...))` 注册
 * - 也可在模块或控制器维度进行注册（全局优先）
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter<Error> {
  constructor(
    private logger: LoggingRepository,
    private cls: ClsService,
  ) {
    // 设置日志上下文名称，便于区分日志来源
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  /**
   * 框架自动调用的异常捕获入口
   * @param error 抛出的错误实例
   * @param host NestJS 提供的上下文对象，用于获取 HTTP 响应对象
   */
  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const { status, body } = this.fromError(error);
    // 避免在响应已发送后再次写入（可能发生于流式/文件响应等场景）
    if (!response.headersSent) {
      response.status(status).json({ ...body, statusCode: status, correlationId: this.cls.getId() });
    }
  }

  /**
   * 在框架外部或自定义流程中也可复用的错误处理方法
   * @param res Express Response 实例
   * @param error 错误实例
   */
  handleError(res: Response, error: Error) {
    const { status, body } = this.fromError(error);
    // 与 catch 保持一致的 headersSent 防御
    if (!res.headersSent) {
      res.status(status).json({ ...body, statusCode: status, correlationId: this.cls.getId() });
    }
  }

  /**
   * 将任意 Error 规范化为 HTTP 响应对象
   * - 若为 HttpException：沿用其中的状态码与响应体
   * - 其他错误：统一返回 500
   * 同时会记录结构化日志，便于排障
   */
  private fromError(error: Error) {
    // 统一记录全局异常（包含堆栈、上下文等）
    logGlobalError(this.logger, error);

    if (error instanceof HttpException) {
      const status = error.getStatus();
      let body = error.getResponse();

      // 某些场景（比如直接抛出字符串消息）可能返回字符串，这里统一转为对象
      if (typeof body === 'string') {
        body = { message: body };
      }

      return { status, body };
    }

    return {
      status: 500,
      body: {
        message: 'Internal server error',
      },
    };
  }
}
