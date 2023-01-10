# HighLeads - Gerenciamento de Leads

Você precisa captar leads por uma campanha de mídias digitais que levem o interessado para uma página na web (landing page) que contém um formulário
para que o interessado informe seus dados de contato (nome, email e telefone).

Geralmente as landing pages são construídas em Word Press e você utiliza um formulário que encaminha os dados do interessado para uma conta de email.

Gerenciar os leads em uma conta de email é muito trabalhoso. Assim, o HighLeads automatiza o processo de captação de leads. Ele lê a conta de email (IMAP), armazena as informações dos leads em um banco de dados e gerencia essas informações para a prospecção de futuros clientes.

Você pode ter várias landing pages apontando para a mesma conta de email.  O HighLeads envia um aviso de 'Novo Contato' para as contas de email que você indicar para cada landing page.

O Highleds possui um serviço backend para o serviço de API e o frontend - interface para o gerenciamento dos leads.  Esses serviços podem ser executados no mesmo servidor que você publica as suas landing pages.

## Executando localmente

Para executar o HighLeads localmente:

- primeiramente baixe e execute o HighLeads - backend
- baixe o HighLeads para a sua pasta local
- altere "baseURL" para apontar para o endereço local do HighLeads - backend no arquivo nuxt.config.js

Para executar o HighLeads - frontend digite "yarn dev".

# HighLeads backend

O serviço backend foi desenvolvido utilizando o framework laravel/lumen. Isso porque geralmente você hospeda sua landing page em servidores "shared hosts" que possuem o Word Press instalado, fornecem conta de email e serviço de banco de dados.  Assim, é mais fácil colocar tudo em um mesmo servidor.

veja em https://github.com/macabral/highleads-backend

# HighLeads frontend

O HighLeads frontend foi desenvolvido com framework Nuxt (Vue) - SPA (Single Page Application).



