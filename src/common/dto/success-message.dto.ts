import { ApiProperty } from '@nestjs/swagger';

export class SuccessMessageDto {
  @ApiProperty({ example: 'Operation successful', description: 'Success message' })
  message: string;
}
