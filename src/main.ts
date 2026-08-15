import { NestFactory, Reflector } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { JwtAuthGuard } from "./module/auth/guards/jwt-auth.guard";
import { RolesGuard } from "./module/auth/guards/roles.guard";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import cookieParser from "cookie-parser";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      "http://localhost:5173",
      // Dominio de producción fijo (no cambia entre deploys).
      "https://figus-play.vercel.app",
      // Acepta cualquier deploy preview del proyecto en Vercel.
      /^https:\/\/figus-app-front[a-z0-9-]*-manuelsas-projects\.vercel\.app$/,
    ],
    credentials: true,
  });

  app.setGlobalPrefix("api/v1");

  app.useGlobalGuards(
    new JwtAuthGuard(app.get(Reflector)),
    new RolesGuard(app.get(Reflector)),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});