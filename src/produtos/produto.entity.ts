import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import { IsNotEmpty, Min } from 'class-validator';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({ message: 'O nome do produto é obrigatório.' })
  @Column({ length: 255 })
  nome: string;

  @Min(0, { message: 'O preço do produto deve ser maior que zero.' })
  @Column('decimal', { precision: 10, scale: 2 })
  preco: number;
}