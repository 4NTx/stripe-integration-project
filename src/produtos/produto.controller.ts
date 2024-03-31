import { Body, Controller, Delete, Get, Param, Post, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { Produto } from './produto.entity';

@Controller('produtos')
export class ProdutoController {
    constructor(private readonly produtoService: ProdutoService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async criarProduto(@Body() produtoDto: { nome: string; preco: number }): Promise<Produto> {
        return this.produtoService.criarProduto(produtoDto.nome, produtoDto.preco);
    }

    @Get(':id')
    async buscarProduto(@Param('id') id: number): Promise<Produto> {
        return this.produtoService.buscarProduto(id);
    }

    @Put(':id')
    async atualizarProduto(
        @Param('id') id: number,
        @Body() produtoDto: { nome: string; preco: number },
    ): Promise<Produto> {
        return this.produtoService.atualizarProduto(id, produtoDto.nome, produtoDto.preco);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletarProduto(@Param('id') id: number): Promise<void> {
        return this.produtoService.deletarProduto(id);
    }

    @Get()
    async listarTodosOsProdutos(): Promise<Produto[]> {
        return this.produtoService.listarTodos();
    }
}
