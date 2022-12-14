import { Food } from './food.model';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('restaurant')
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  category: string;

  @Column()
  ownerId: string;

  @OneToMany(() => Food, (food) => food.restaurant)
  foods: Food[];

  @Column({
    type: 'decimal',
    default: 3.0,
  })
  rate: number;

  @Column({
    default: 0,
  })
  rateCount: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
