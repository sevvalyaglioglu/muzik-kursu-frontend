import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- ÇÖZÜM BURADA: CORS İZNİ ---
  // Bu satır, herhangi bir yerden gelen isteklere "Tamam, geç" der.
  app.enableCors();
  // ------------------------------

  // Gelen verileri kontrol et
  app.useGlobalPipes(new ValidationPipe());

  // Swagger (Rapor için dokümantasyon)
  const config = new DocumentBuilder()
    .setTitle('Müzik Kursu API')
    .setDescription('API Dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
