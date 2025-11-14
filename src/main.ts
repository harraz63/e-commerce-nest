import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnifiedResponseInterceptor } from './Common/Interceptors';
import { ValidationPipe } from '@nestjs/common';
import { LoggerMiddleware } from './Common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new UnifiedResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(new LoggerMiddleware().use)

  const port = process.env.PORT ?? 5000;
  await app.listen(port);

  console.log('✅ MongoDB Connected Successfully');
  console.log(`🚀 Server Is Running On Port ${port}`);
}
bootstrap();
