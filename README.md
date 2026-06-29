[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/IDEzcQ6G)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=23250858)
# :checkered_flag: ContratAki

O projeto visa o desenvolvimento de um aplicativo web que facilite a busca, a contratação e a comunicação com trabalhadores autônomos, promovendo uma conexão mais eficiente entre clientes e prestadores de serviço na cidade de Quixadá. A proposta surge da necessidade de centralizar, em uma única plataforma, informações sobre profissionais de diferentes áreas, como manutenção, serviços domésticos e reparos em geral.

## :technologist: Membros da equipe

581908 - MATHEUS DE SOUSA MENDES - ES

579500 - NYCOLAS RIBEIRO OLIVEIRA - ES

579915 - YURI FAGUNDES DA SILVA - ES

## :bulb: Objetivo Geral
Desenvolver uma aplicação web que conecte trabalhadores autônomos a clientes, facilitando a busca, contratação e comunicação entre as partes, por meio de uma plataforma intuitiva, acessível e segura.

A aplicação permitirá que usuários encontrem profissionais de acordo com suas necessidades, visualizem serviços disponíveis e realizem contratações de forma prática, enquanto os trabalhadores poderão divulgar seus serviços e gerenciar solicitações recebidas.

## :eyes: Público-Alvo
Clientes (contratantes)

Trabalhadores Autônomos

## :star2: Impacto Esperado
Para trabalhadores:

Melhorar a visibilidade de seus serviços, facilitar contato com clientes e garantir mais oportunidades de prestação de serviço


Para clientes:

Reduzir a dificuldade de encontrar profissionais, centralizar contratação de serviços e garantir que  o processo seja mais rápido e seguro

## :people_holding_hands: Papéis ou tipos de usuário da aplicação

Usuário não-logado (visitante)

Cliente (autenticado)

Trabalhador (autenticado)

Administrador

> Tenha em mente que obrigatoriamente a aplicação deve possuir funcionalidades acessíveis a todos os tipos de usuário e outra funcionalidades restritas a certos tipos de usuários.

## :triangular_flag_on_post:	 Principais funcionalidades da aplicação

Funcionalidades acessíveis

* RF01: Permitir a visualização de trabalhadores cadastrados
* RF02: Listar os serviços disponíveis para os clientes
* RF03: Disponibilizar busca e filtro por tipo de serviço
* RF04: Permitir visualização de descrição de serviços e experiência dos profissionais

Funcionalidade restritas

Cliente

* RF05: Permitir contratação de serviços
* RF06: Permitir a visualização do histórico de serviços solicitados/concluídos
* RF07: Garantir a possibilidade do acompanhamento do status dos serviços em andamento
* RF08: Liberar o envio de mensagens para trabalhadores

Trabalhadores

* RF09: Permitir o cadastro, edição e remoção de serviços pelo trabalhador  
* RF10: Permitir a visualização dos pedidos recebidos  
* RF11: Permitir aceitar ou recusar solicitações de serviços  

Administrador

* RF12: Permitir a visualização de todos os usuários cadastrados
* RF13: Permitir a remoção de usuários da plataforma
* RF14: Permitir a visualização e remoção de serviços cadastrados
* RF15: Permitir a visualização de todos os pedidos realizados na plataforma

## :spiral_calendar: Entidades ou tabelas do sistema

Usuário

Trabalhador

Serviço Oferecido

Contratação


----

:warning::warning::warning: As informações a seguir devem ser enviadas juntamente com a versão final do projeto. :warning::warning::warning:


----

## :desktop_computer: Tecnologias e frameworks utilizados

**Frontend:**

- JavaScript 
- HTML5 
- CSS3
- BootStrap

**Backend:**

- Node.js 
- Strapi v5 
- JavaScript 
- SQLite




## :shipit: Operações implementadas para cada entidade da aplicação

| Entidade | Criação | Leitura | Atualização | Remoção |
| --- | :---: | :---: | :---: | :---: |
| Usuário | X | X |  | X |
| Perfil | X | X | X | X |
| Categoria de Serviço | X | X | X | X |
| Serviço | X | X | X | X |
| Solicitação | X | X | X | X |

> Lembre-se que é necessário implementar o CRUD de pelo menos duas entidades.

---

## :neckbeard: Rotas da API REST utilizadas

| Método HTTP | URL | Descrição |
| --- | --- | --- |
| POST | `/api/auth/local` | Login do usuário. |
| POST | `/api/auth/local/register` | Cadastro de usuário. |
| POST | `/api/account/create-profile` | Cria o perfil do usuário autenticado. |
| POST | `/api/account/delete` | Exclui a conta do usuário autenticado. |
| GET | `/api/admin/users` | Lista todos os usuários (Administrador). |
| DELETE | `/api/admin/users/:documentId` | Exclui um usuário (Administrador). |
| GET | `/api/perfils` | Lista todos os perfis. |
| GET | `/api/perfils/:documentId` | Busca um perfil pelo documentId. |
| POST | `/api/perfils` | Cria um perfil. |
| PUT | `/api/perfils/:documentId` | Atualiza um perfil. |
| DELETE | `/api/perfils/:documentId` | Remove um perfil. |
| GET | `/api/categoria-servicos` | Lista as categorias de serviço. |
| GET | `/api/categoria-servicos/:documentId` | Busca uma categoria. |
| POST | `/api/categoria-servicos` | Cria uma categoria. |
| PUT | `/api/categoria-servicos/:documentId` | Atualiza uma categoria. |
| DELETE | `/api/categoria-servicos/:documentId` | Remove uma categoria. |
| GET | `/api/servicos` | Lista os serviços. |
| GET | `/api/servicos/:documentId` | Busca um serviço. |
| POST | `/api/servicos` | Cria um serviço. |
| PUT | `/api/servicos/:documentId` | Atualiza um serviço. |
| DELETE | `/api/servicos/:documentId` | Remove um serviço. |
| GET | `/api/solicitacaos` | Lista as solicitações. |
| GET | `/api/solicitacaos/:documentId` | Busca uma solicitação. |
| POST | `/api/solicitacaos` | Cria uma solicitação. |
| PUT | `/api/solicitacaos/:documentId` | Atualiza uma solicitação. |
| DELETE | `/api/solicitacaos/:documentId` | Remove uma solicitação. |

Ao acessar a plataforma, o usuário é direcionado para a tela de login. Caso ainda não possua uma conta, pode selecionar a opção "Cadastre-se" e preencher as informações necessárias para realizar o cadastro. Também é possível continuar como visitante, acessando as funcionalidades públicas da plataforma sem a necessidade de autenticação.