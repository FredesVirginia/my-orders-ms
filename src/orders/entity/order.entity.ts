import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './orderItem.entity';
import { Coupon } from './coupon.entity';
import { Payment } from './payment.entity';
import { Shipment } from './shipped.entity';
@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;



  @OneToMany(()=>OrderItem , (item)=> item.order , { cascade : true})
  items : OrderItem[]
  
  @ManyToOne(()=>Coupon , (coupon)=> coupon.orders , {nullable : true})
  coupon: Coupon

  @OneToMany(()=>Payment , (payment)=> payment.order , {cascade : true})
  payment : Payment

  @Column("decimal")
  total:string

  @OneToOne(()=>Shipment , (shipment)=> shipment.order , { cascade : true})
  shipment : Shipment

  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


}
