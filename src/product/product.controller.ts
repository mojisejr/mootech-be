import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductGetInput } from './dto/product-get.input';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @HttpCode(200)
  async getProduct(@Query() input: ProductGetInput): Promise<any> {
    return await this.productService.getProduct(input);
  }
}
