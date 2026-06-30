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
      "https://figus-app-front-end.vercel.app",
      // Acepta cualquier deploy preview de tu proyecto en Vercel.
      // Vercel trunca el nombre del proyecto en la URL si no entra en el
      // límite de 63 caracteres del subdominio (por eso a veces queda
      // "front-end" y a veces "front" a secas), así que el patrón es
      // flexible justo ahí. El scope "manuelsas-projects" lo acota a tus
      // propios deploys.
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