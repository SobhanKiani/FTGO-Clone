import { Food } from "../../food/models/food.model";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('restaurant')
export class Restaurant extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    address: string

    @Column()
    category: string

    @Column()
    ownerId: string

    @OneToMany(() => Food, (food) => food.restaurant)
    foods: Food[]

    @Column({
        type: "decimal",
        default: 3.0,
    })
    rate: number

    @Column({
        default: 0
    })
    rateCount: number;
}