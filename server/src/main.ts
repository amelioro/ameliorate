import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { generateZodClientFromOpenAPI } from 'openapi-zod-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Ameliorate API')
    .setDescription('The Ameliorate API description')
    .setVersion('1.0')
    .addTag('ameliorate')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const apiSchemaPath = resolve(process.cwd(), '..', 'common', 'api-schema');
  const swaggerOutputPath = resolve(apiSchemaPath, 'swagger.json');
  writeFileSync(swaggerOutputPath, JSON.stringify(document), {
    encoding: 'utf-8',
  });

  const zodiosOutputPath = resolve(apiSchemaPath, 'zodios.ts');
  await generateZodClientFromOpenAPI({
    openApiDoc: document as any,
    distPath: zodiosOutputPath,
    options: { withAlias: true },
  });

  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
