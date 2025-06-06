import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { PaymentsEnum } from '../enums/enums';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn()
  order: Order;

  @Column()
  orderId: string;

  @Column()
  paymentMethod: string;

  @Column('decimal')
  total: number;

  @Column({
    type: 'enum',
    enum : PaymentsEnum,
    default : PaymentsEnum.PENDING
  })
  status: PaymentsEnum;

  @CreateDateColumn()
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
