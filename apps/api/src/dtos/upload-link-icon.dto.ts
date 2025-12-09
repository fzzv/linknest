import { ApiProperty } from '@nestjs/swagger';

export class UploadLinkIconResponseDto {
  @ApiProperty({ example: '/uploads/linkicons/0cc175b9c0f1b6a831c399e269772661.png' })
  url!: string;
}
