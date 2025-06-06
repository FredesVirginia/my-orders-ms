import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { ShipmentEnum } from "../enums/enums";

@Entity()
export class Shipment{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @OneToOne(()=>Order, (order)=> order.shipment)
    @JoinColumn()
    order : Order;


    @Column()
    address : string;

    @Column()
    trackingNumber: string

    @Column()
    carrier:string;

    @Column({
        type:'enum',
        enum : ShipmentEnum,
        default : ShipmentEnum.PENDING
    })
    status : ShipmentEnum


}