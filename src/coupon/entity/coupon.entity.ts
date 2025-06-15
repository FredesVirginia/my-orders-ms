// src/coupon/coupon.entity.ts
import { Order } from 'src/orders/entity/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name : string

  // @Column({ unique: true })
  // code: string;  // Código único para el cupón

  // @Column('decimal', { nullable: true })
  // discountAmount?: number;  // Descuento fijo (ej: $10)

  @Column('decimal', { nullable: true })
  discountPercent?: number; // Descuento porcentual (ej: 15%)

  @Column({ type: 'timestamp', nullable: true })
  validFrom?: Date;

  @Column({ type: 'timestamp', nullable: true })
  validUntil?: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  usageCount: number; // Cuántas veces se ha usado

  @Column({ nullable: true })
  maxUsage?: number; // Límite de usos


   // Relación inversa: un cupón puede estar en muchas órdenes
  @OneToMany(() => Order, order => order.coupon)
  orders: Order[];
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
