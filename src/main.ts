import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import mysql from 'mysql2/promise';

async function ensureDatabaseExists() {
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = Number(process.env.DATABASE_PORT || 3306);
  const user = process.env.DATABASE_USER || 'root';
  const password = process.env.DATABASE_PASSWORD || '';
  const database = process.env.DATABASE_NAME || 'user_api_db';

  const connection = await mysql.createConnection({ host, port, user, password });
  const [rows] = await connection.query('SHOW DATABASES LIKE ?', [database]);

  if ((rows as Array<any>).length === 0) {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Created database ${database}`);
  }

  await connection.end();
}

async function bootstrap() {
  await ensureDatabaseExists();

  const app = await NestFactory.create(AppModule);

  // Enable CORS for localhost:3000
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('User & Auth API')
    .setDescription(
      'A comprehensive User Management and Authentication API with JWT support',
    )
    .setVersion('1.0.0')
    .addTag('users', 'User management endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application is running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();

