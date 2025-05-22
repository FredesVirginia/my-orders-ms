import {Column,CreateDateColumn,Entity,ManyToOne,PrimaryGeneratedColumn,UpdateDateColumn} from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

   @Column()
  productId: string;

  @Column()
  price:string;
  
  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
