import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class ProdutoService {
    private stripe: Stripe;

    constructor(
        @InjectRepository(Produto)
        private readonly produtoRepositorio: Repository<Produto>,
        private readonly configService: ConfigService,
    ) {
        const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    }

    async criarProduto(nome: string, preco: number): Promise<Produto> {
        if (!nome) {
            throw new Error('O nome do produto é obrigatório.');
        }
        if (preco <= 0) {
            throw new Error('O preço deve ser positivo.');
        }

        const stripeProduto = await this.stripe.products.create({
            name: nome,
        });

        const stripePreco = await this.stripe.prices.create({
            unit_amount: preco * 100,
            currency: 'brl',
            product: stripeProduto.id,
        });

        const produto = this.produtoRepositorio.create({
            nome,
            preco,
            stripeProdutoId: stripeProduto.id,
            stripePrecoId: stripePreco.id,
        });

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
        if (produto.nome !== nome) {
            await this.stripe.products.update(produto.stripeProdutoId, {
                name: nome,
            });
        }
        let stripePriceId = produto.stripePrecoId;
        if (produto.preco !== preco) {
            const stripePrice = await this.stripe.prices.create({
                unit_amount: preco * 100,
                currency: 'brl',
                product: produto.stripeProdutoId,
            });
            stripePriceId = stripePrice.id;
        }
        produto.nome = nome;
        produto.preco = preco;
        produto.stripePrecoId = stripePriceId;
        return this.produtoRepositorio.save(produto);
    }


    async deletarProduto(id: number): Promise<void> {
        const produto = await this.buscarProduto(id);

        if (produto.stripeProdutoId) {
            await this.stripe.products.del(String(produto.stripeProdutoId));
        }

        const resultado = await this.produtoRepositorio.delete(id);
        if (resultado.affected === 0) {
            throw new NotFoundException(`Produto com ID ${id} não encontrado para deletar.`);
        }
    }

    async listarTodos(): Promise<Produto[]> {
        return this.produtoRepositorio.find();
    }
}
