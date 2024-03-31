import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nome: string;

  @Column('decimal', { precision: 10, scale: 2 })
  preco: number;

  @BeforeInsert()
  private beforeInsertActions() {
    this.nome = this.nome.trim();
    this.validarNome();
    this.validarPreco();
  }

  private validarNome() {
    if (!this.nome) {
      throw new Error('O nome do produto é obrigatório.');
    }
  }

  private validarPreco() {
    if (this.preco <= 0) {
      throw new Error('O preço do produto deve ser maior que zero.');
    }
  }
}
