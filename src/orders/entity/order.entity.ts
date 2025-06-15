import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './orderItem.entity';

import { Payment } from './payment.entity';
import { Shipment } from './shipped.entity';
import { Coupon } from 'src/coupon/entity/coupon.entity';
@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;



  @OneToMany(()=>OrderItem , (item)=> item.order , { cascade : true})
  items : OrderItem[]
  


  @OneToMany(()=>Payment , (payment)=> payment.order , {cascade : true})
  payment : Payment

  @Column("decimal")
  total:string


  
  @Column("decimal" , { nullable: true })
  subTotal:string

  @OneToOne(()=>Shipment , (shipment)=> shipment.order , { cascade : true})
  shipment : Shipment

  // Relación ManyToOne opcional a Coupon
  @ManyToOne(() => Coupon, coupon => coupon.orders, { nullable: true, eager: true })
  @JoinColumn({ name: 'coupon_id' }) // Nombre explícito de la FK en la tabla orders
  coupon?: Coupon;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


}
