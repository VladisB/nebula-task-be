import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/exception-filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const configService = app.get(ConfigService);
  const PORT = configService.get("app.port");

  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}
bootstrap();
