import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoController } from './produto.controller';
import { ProdutoService } from './produto.service';
import { Produto } from './produto.entity';

describe('ProdutoController', () => {
    let controller: ProdutoController;
    let mockProdutoService: Partial<ProdutoService>;

    beforeEach(async () => {
        mockProdutoService = {
            criarProduto: jest.fn().mockImplementation((nome: string, preco: number) => Promise.resolve({ id: 1, nome, preco })),
            buscarProduto: jest.fn().mockImplementation((_id: number) => Promise.resolve(new Produto())),
            atualizarProduto: jest.fn().mockImplementation((id: number, nome: string, preco: number) => Promise.resolve({ id, nome, preco })),
            deletarProduto: jest.fn().mockImplementation((_id: number) => Promise.resolve()),
            listarTodos: jest.fn().mockImplementation(() => Promise.resolve([new Produto()])),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProdutoController],
            providers: [{ provide: ProdutoService, useValue: mockProdutoService }],
        }).compile();

        controller = module.get<ProdutoController>(ProdutoController);
    });

    it('deve criar um produto', async () => {
        expect(await controller.criarProduto({ nome: 'Teste', preco: 100 })).toEqual({
            id: expect.any(Number),
            nome: 'Teste',
            preco: 100,
        });
    });

    it('deve buscar um produto por ID', async () => {
        await expect(controller.buscarProduto(1)).resolves.toBeInstanceOf(Produto);
    });

    it('deve atualizar um produto', async () => {
        const atualizado = await controller.atualizarProduto(1, { nome: 'Atualizado', preco: 200 });
        expect(atualizado.nome).toBe('Atualizado');
        expect(atualizado.preco).toBe(200);
    });

    it('deve deletar um produto', async () => {
        await expect(controller.deletarProduto(1)).resolves.toBeUndefined();
    });

    it('deve listar todos os produtos', async () => {
        await expect(controller.listarTodosOsProdutos()).resolves.toBeInstanceOf(Array);
        expect(await controller.listarTodosOsProdutos()).toHaveLength(1);
    });
});
