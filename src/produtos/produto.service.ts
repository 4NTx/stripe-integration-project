import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';

@Injectable()
export class ProdutoService {
    constructor(
        @InjectRepository(Produto)
        private readonly produtoRepositorio: Repository<Produto>,
    ) { }

    async criarProduto(nome: string, preco: number): Promise<Produto> {
        if (!nome) {
            throw new Error('O nome do produto é obrigatório.');
        }
        if (preco <= 0) {
            throw new Error('O preço deve ser positivo.');
        }
        const produto = this.produtoRepositorio.create({ nome, preco });
        return this.produtoRepositorio.save(produto);
    }

    async buscarProduto(id: number): Promise<Produto> {
        const produto = await this.produtoRepositorio.findOne({ where: { id } });
        if (!produto) {
            throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
        }
        return produto;
    }

    async atualizarProduto(id: number, nome: string, preco: number): Promise<Produto> {
        const produto = await this.buscarProduto(id);
        produto.nome = nome;
        produto.preco = preco;
        return this.produtoRepositorio.save(produto);
    }

    async deletarProduto(id: number): Promise<void> {
        const resultado = await this.produtoRepositorio.delete(id);
        if (resultado.affected === 0) {
            throw new NotFoundException(`Produto com ID ${id} não encontrado para deletar.`);
        }
    }

    async listarTodos(): Promise<Produto[]> {
        return this.produtoRepositorio.find();
    }
}
