import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ChannelType } from '@prisma/client';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}

export class CreateConversationDto {
  @IsEnum(ChannelType)
  channel: ChannelType;

  @IsString()
  channelUserId: string;

  @IsOptional()
  @IsString()
  channelUsername?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
