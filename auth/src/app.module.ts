import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}`,
    ),
    // MongooseModule.forRoot(`mongodb://localhost:6661/auth`)
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
