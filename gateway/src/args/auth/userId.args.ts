import { ArgsType, Field } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class UserIdArg {
  @Field((type) => String, { nullable: false })
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  userId: string;
}
