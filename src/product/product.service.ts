import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entity/product-entity.model';
import { ProductGetInput } from './dto/product-get.input';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProduct(input: ProductGetInput): Promise<any> {
    const query = await this.productRepository.createQueryBuilder('product');
    query.where('is_show = true');
    query.andWhere("product_type != ''");
    if (input.page == 'LOVE') {
      if (input.percentage_love > 50) {
        query.andWhere(
          '((product_type = :product_type) OR ( product_type = :product_holy ))',
          {
            product_type: 'UPSKILL_LOVE',
            product_holy: 'HOLY',
          },
        );
      } else {
        query.andWhere(
          '((product_type = :product_type) OR ( product_type = :product_holy ))',
          {
            product_type: 'LOVE',
            product_holy: 'HOLY',
          },
        );
      }
    } else if (input.page == 'WORK') {
      query.andWhere(
        '((product_type = :product_type) OR ( product_type = :product_work ) OR ( product_type = :product_holy ))',
        {
          product_type: 'WORK',
          product_work: 'UPSKILL_WORK',
          product_holy: 'HOLY',
        },
      );
    } else if (input.page == 'PROFILE') {
      query.andWhere(
        '(( element = :element AND  product_type = :product_type ) OR ( product_type != :product_type ))',
        { element: input.element, product_type: 'ELEMENT' },
      );
    }

    query.select('product.id', 'id');
    query.addSelect('product.name', 'name');
    query.addSelect('product.description', 'description');
    query.addSelect('product.image', 'image');
    query.addSelect('product.url', 'url');
    const result = await query.getRawMany();

    return result;
  }
}
