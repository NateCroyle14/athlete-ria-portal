import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All routes under /v1
  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ---- tiny auth for Swagger ----
  const user = process.env.DOCS_USER;
  const pass = process.env.DOCS_PASS;
  if (user && pass) {
    app.use(
      ['/docs', '/docs-json'],
      basicAuth({
        challenge: true,
        users: { [user]: pass },
      }),
    );
  }
  // -------------------------------

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Athlete RIA API')
    .setDescription('REST API for the portal')
    .setVersion('1.0')
    .addServer('/v1', 'v1')
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`[api] http://localhost:${port}/v1`);
  console.log(`[docs] http://localhost:${port}/docs`);
}
bootstrap();