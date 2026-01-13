import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController, PublicProductsController } from './products.controller';

@Module({
  controllers: [ProductsController, PublicProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
