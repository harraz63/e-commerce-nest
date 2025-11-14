import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import chalk from 'chalk';

// Class Based
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(this: void, req: Request, res: Response, next: NextFunction) {
    const { url, method } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const { statusCode } = res;

      // Color based on HTTP method
      let methodColor;
      switch (method) {
        case 'GET':
          methodColor = chalk.green;
          break;
        case 'POST':
          methodColor = chalk.blue;
          break;
        case 'PUT':
        case 'PATCH':
          methodColor = chalk.yellow;
          break;
        case 'DELETE':
          methodColor = chalk.red;
          break;
        default:
          methodColor = chalk.white;
      }

      // Color based on status code
      let statusColor;
      if (statusCode >= 500) {
        statusColor = chalk.red.bold;
      } else if (statusCode >= 400) {
        statusColor = chalk.yellow.bold;
      } else if (statusCode >= 300) {
        statusColor = chalk.cyan.bold;
      } else if (statusCode >= 200) {
        statusColor = chalk.green.bold;
      } else {
        statusColor = chalk.white;
      }

      // Color response time based on speed
      let timeColor;
      if (responseTime < 100) {
        timeColor = chalk.green;
      } else if (responseTime < 500) {
        timeColor = chalk.yellow;
      } else {
        timeColor = chalk.red;
      }

      console.log(
        `${methodColor(method)} ${chalk.gray(url)} ${statusColor(statusCode)} ${timeColor(responseTime + 'ms')}`,
      );
    });

    next();
  }
}
