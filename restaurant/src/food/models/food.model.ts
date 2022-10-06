import { Restaurant } from '../../restaurant/models/restaurant.model';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('food')
export class Food extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column({
    type: 'decimal',
    default: 3.0,
  })
  price: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.foods, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @Column({ default: true })
  isAvailable: boolean;

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
