import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoService } from './produto.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Produto } from './produto.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ProdutoService', () => {
    let servico: ProdutoService;
    let repositorioMock: Partial<Record<keyof Repository<Produto>, jest.Mock>>;

    beforeEach(async () => {
        repositorioMock = {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((produto) => Promise.resolve({ id: Date.now(), ...produto })),
            findOne: jest.fn().mockImplementation((options) => Promise.resolve({ id: options.where.id, nome: 'Produto Existente', preco: 100 })),
            delete: jest.fn().mockImplementation((id) => Promise.resolve({ affected: 1 })),
            find: jest.fn().mockImplementation(() => Promise.resolve([{ id: 1, nome: 'Produto 1', preco: 100 }])),
        };


        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProdutoService,
                {
                    provide: getRepositoryToken(Produto),
                    useValue: repositorioMock,
                },
            ],
        }).compile();

        servico = module.get<ProdutoService>(ProdutoService);
    });

    it('deve criar um produto corretamente', async () => {
        const produtoDto = { nome: 'Produto Teste', preco: 100 };
        const produto = await servico.criarProduto(produtoDto.nome, produtoDto.preco);

        expect(produto).toBeDefined();
        expect(produto.id).toBeDefined();
        expect(produto.nome).toBe(produtoDto.nome);
        expect(produto.preco).toBe(produtoDto.preco);
    });

    it('deve buscar um produto por ID', async () => {
        const produto = await servico.buscarProduto(1);
        expect(produto).toBeDefined();
        expect(produto.id).toBe(1);
        expect(repositorioMock.findOne).toHaveBeenCalled();
    });

    it('deve lançar erro se o produto não for encontrado', async () => {
        repositorioMock.findOne.mockResolvedValueOnce(null);
        await expect(servico.buscarProduto(999)).rejects.toThrow(NotFoundException);
    });

    it('deve atualizar um produto corretamente', async () => {
        const produtoAtualizado = await servico.atualizarProduto(1, 'Produto Atualizado', 150);
        expect(produtoAtualizado).toBeDefined();
        expect(produtoAtualizado.nome).toBe('Produto Atualizado');
        expect(produtoAtualizado.preco).toBe(150);
    });

    it('deve deletar um produto', async () => {
        await expect(servico.deletarProduto(1)).resolves.not.toThrow();
        expect(repositorioMock.delete).toHaveBeenCalledWith(1);
    });

    it('deve listar todos os produtos', async () => {
        const produtos = await servico.listarTodos();
        expect(produtos).toHaveLength(1);
        expect(produtos[0].nome).toBe('Produto 1');
    });
});
