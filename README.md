# WhatsApp Cloud API + Claude — Bot de resposta automática

Bot em Node.js/TypeScript que recebe mensagens do WhatsApp (via Cloud API
da Meta), envia o texto para a API do Claude (Anthropic) e responde ao
usuário automaticamente.

> Guia pensado para quem nunca configurou nada disso antes — sem pular
> passos, sem assumir conhecimento prévio de terminal ou APIs.

## Índice

- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Passo 1 — Instalar o projeto](#passo-1--instalar-o-projeto)
- [Passo 2 — Conta na Anthropic (Claude API)](#passo-2--conta-na-anthropic-claude-api)
- [Passo 3 — Conta na Meta for Developers (WhatsApp)](#passo-3--conta-na-meta-for-developers-whatsapp)
- [Passo 4 — Rodar o servidor local](#passo-4--rodar-o-servidor-local)
- [Passo 5 — Expor o servidor com ngrok](#passo-5--expor-o-servidor-com-ngrok)
- [Passo 6 — Configurar o webhook na Meta](#passo-6--configurar-o-webhook-na-meta)
- [Passo 7 — Testar](#passo-7--testar)
- [Checklist rápido](#checklist-rápido)
- [Quanto custa?](#quanto-custa)
- [Solução de problemas](#solução-de-problemas)
- [Indo para produção](#indo-para-produção)
- [Limitações desta versão](#limitações-desta-versão)

---

## Estrutura do projeto

```
src/
  config.ts    -> lê e valida as variáveis de ambiente
  types.ts     -> tipos do payload do webhook do WhatsApp
  whatsapp.ts  -> envia mensagens e extrai texto recebido
  claude.ts    -> chama a API do Claude
  index.ts     -> servidor Express (rotas /webhook)
```

## Pré-requisitos

- **Node.js** instalado (versão 18 ou mais recente). Baixe em
  [nodejs.org](https://nodejs.org) — o instalador já inclui o `npm`.
  Verifique com:
  ```bash
  node -v
  npm -v
  ```
- Uma conta pessoal no Facebook (necessária para criar o app na Meta).
- Um cartão de crédito (para ativar a API da Anthropic — o uso em si é
  bem barato, ver seção [Quanto custa?](#quanto-custa)).

## Passo 1 — Instalar o projeto

1. Baixe e descompacte o projeto (zip) em uma pasta de fácil acesso, ex:
   `Downloads`.
2. Abra um terminal (PowerShell/CMD no Windows, Terminal no Mac/Linux) e
   navegue até a pasta do projeto:
   ```bash
   cd Downloads/whatsapp-claude-bot
   ```
   > Se o zip criou uma pasta duplicada (`whatsapp-claude-bot` dentro de
   > `whatsapp-claude-bot`), entre na pasta de dentro, que é onde está o
   > `package.json`.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Crie o arquivo de variáveis de ambiente a partir do exemplo:
   ```bash
   # Linux/Mac
   cp .env.example .env

   # Windows (CMD)
   copy .env.example .env
   ```

Nos próximos passos vamos preencher o `.env` com 4 valores:
`ANTHROPIC_API_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` e
`WHATSAPP_VERIFY_TOKEN`.

## Passo 2 — Conta na Anthropic (Claude API)

1. Acesse [console.anthropic.com](https://console.anthropic.com) e crie
   uma conta (email ou Google).
2. Vá em **Billing** (ou "Plans and Billing") e adicione um cartão de
   crédito. A API é pré-paga por uso, sem mensalidade fixa.
3. Recomendado: defina um **limite de gasto mensal** (spend limit) ali
   mesmo, para nunca ter surpresa — US$ 5 ou 10 já é mais que suficiente
   para testar.
4. Vá em **Settings → API Keys** (ou acesse direto
   `console.anthropic.com/settings/keys`).
5. Clique em **Create Key**, dê um nome (ex: `whatsapp-bot-dev`).
6. **Copie a chave imediatamente** — ela começa com `sk-ant-...` e só é
   exibida uma vez.
7. Cole no `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

## Passo 3 — Conta na Meta for Developers (WhatsApp)

1. Acesse [developers.facebook.com/apps](https://developers.facebook.com/apps)
   e faça login com sua conta do Facebook (na primeira vez, complete o
   cadastro de desenvolvedor: aceitar termos, verificar email/SMS).
2. Clique em **Criar app** (Create App).
3. Em "Casos de uso" (Use cases), filtre por **Business messaging** e
   selecione **"Conectar-se com clientes usando o WhatsApp"**.
4. Escolha ou crie um **Portfólio de Negócios** quando solicitado e vá
   para o Dashboard.
5. No painel do app, entre em **WhatsApp → Configuração da API** (API
   Setup). Você vai encontrar:
   - Um **número de teste** pronto, com um **Phone Number ID** → copie
     para `WHATSAPP_PHONE_NUMBER_ID` no `.env`.
   - Um botão **Generate access token** → gera um token temporário
     (válido 24h), ideal para testar → copie para `WHATSAPP_TOKEN`.
6. Adicione **seu próprio número de WhatsApp** como destinatário de
   teste (campo "To") e clique em **Send message** — você deve receber
   uma mensagem de template ("hello_world") no seu WhatsApp.
7. Invente uma string secreta qualquer e coloque em
   `WHATSAPP_VERIFY_TOKEN` no `.env` (ex: `meu-token-secreto-123`). Você
   mesmo escolhe esse valor — ele só precisa ser igual aqui e no painel
   da Meta (próximo passo).

Nesse ponto o `.env` deve estar completo com os 4 valores.

## Passo 4 — Rodar o servidor local

Em um terminal, dentro da pasta do projeto:

```bash
npm run dev
```

Deve aparecer:

```
Servidor rodando em http://localhost:3000
```

Deixe esse terminal aberto — ele precisa ficar rodando o tempo todo
enquanto você testa.

## Passo 5 — Expor o servidor com ngrok

A Meta só consegue chamar seu webhook via HTTPS público. Em
desenvolvimento local, use um túnel como o [ngrok](https://ngrok.com/download).

1. Baixe e instale o ngrok.
2. Em um **novo terminal** (sem fechar o do `npm run dev`), rode:
   ```bash
   ngrok http 3000
   ```
3. Copie a URL HTTPS que aparece, algo como:
   ```
   Forwarding   https://abcd1234.ngrok-free.app -> http://localhost:3000
   ```

Deixe esse terminal também aberto.

> Toda vez que reiniciar o ngrok (na versão gratuita), a URL muda — será
> preciso repetir o Passo 6 com a nova URL.

## Passo 6 — Configurar o webhook na Meta

1. No painel do app, vá em **WhatsApp → Configuração → Webhook**.
2. Clique em **Editar** e preencha:
   - **URL de callback**: `https://SEU_DOMINIO_NGROK/webhook`
   - **Verificar token**: o mesmo valor de `WHATSAPP_VERIFY_TOKEN` do `.env`
3. Clique em **Verificar e salvar**. A Meta vai chamar seu servidor
   local (via ngrok) para validar o token — o servidor precisa estar
   rodando nesse momento (Passo 4).
4. Confira no terminal do `npm run dev` se apareceu:
   ```
   Webhook verificado com sucesso.
   ```
5. Na lista de **Campos do Webhook**, clique em **Assinar** (Subscribe)
   no campo **messages** — sem isso o webhook fica configurado mas não
   recebe nada.

## Passo 7 — Testar

Pelo seu celular, mande uma mensagem de texto para o número de teste da
Meta (o mesmo que recebeu o "hello_world" no Passo 3). No terminal do
`npm run dev` deve aparecer:

```
Mensagem recebida de 55XXXXXXXXXX: sua mensagem
Resposta enviada para 55XXXXXXXXXX
```

E a resposta gerada pelo Claude deve chegar no seu WhatsApp.

---

## Checklist rápido

- [ ] Node.js instalado (`node -v` funciona)
- [ ] `npm install` rodado sem erros
- [ ] `.env` criado a partir do `.env.example`
- [ ] `ANTHROPIC_API_KEY` preenchida (console.anthropic.com)
- [ ] `WHATSAPP_TOKEN` preenchida (developers.facebook.com/apps)
- [ ] `WHATSAPP_PHONE_NUMBER_ID` preenchida
- [ ] `WHATSAPP_VERIFY_TOKEN` preenchida (valor inventado por você)
- [ ] Terminal 1: `npm run dev` rodando, mostrando "Servidor rodando..."
- [ ] Terminal 2: `ngrok http 3000` rodando, com URL HTTPS copiada
- [ ] Webhook cadastrado no painel da Meta com a URL do ngrok + `/webhook`
- [ ] Terminal 1 mostrou "Webhook verificado com sucesso."
- [ ] Campo `messages` assinado no webhook
- [ ] Mensagem de teste enviada e resposta recebida no WhatsApp

## Quanto custa?

**WhatsApp Cloud API (Meta)**
- Criar o app, gerar token e testar com seu próprio número (até 5
  destinatários de teste): **gratuito**.
- Cobrança só existe fora do modo teste (número em produção, campanhas
  reais), com tarifas por categoria de mensagem (marketing, utilidade,
  autenticação). Consulte a página oficial de preços da Meta antes de ir
  para produção, pois os valores mudam com frequência.

**Claude API (Anthropic)**
- Não há tier gratuito — é preciso adicionar crédito/cartão para gerar
  uma chave funcional.
- Cobrança por token (fração de centavo por mensagem trocada). Para uso
  pessoal/teste, US$ 5 de crédito costuma durar bastante tempo.
- Consulte [anthropic.com/pricing](https://www.anthropic.com/pricing)
  para os valores atualizados do modelo configurado (`CLAUDE_MODEL` no
  `.env`).

## Solução de problemas

**`'npm' não é reconhecido como um comando`**
→ Node.js não instalado ou terminal aberto antes da instalação. Instale
o Node.js, feche e abra um novo terminal.

**`npm error ... Could not read package.json`**
→ Você está numa pasta errada, provavelmente uma pasta duplicada criada
pela extração do zip. Rode `dir` (Windows) ou `ls` (Mac/Linux) e procure
a subpasta que contém o `package.json`; entre nela com `cd`.

**Erro 403 ao verificar o webhook na Meta**
→ O `WHATSAPP_VERIFY_TOKEN` do `.env` não é exatamente igual ao digitado
no painel da Meta. Confira caractere por caractere.

**Webhook verificado, mas nada acontece ao mandar mensagem**
→ Confira se assinou (subscribe) o campo `messages` nos campos do
webhook (Passo 6, item 5) — é um passo separado da verificação da URL.

**Token parou de funcionar depois de um dia**
→ O token gerado em "API Setup" expira em 24h. Gere um novo ali, ou
crie um token permanente (ver [Indo para produção](#indo-para-produção)).

## Indo para produção

- **Token permanente**: crie um *System User* em Business Settings
  (business.facebook.com), gere um token permanente com a permissão
  `whatsapp_business_messaging` e substitua `WHATSAPP_TOKEN`.
- **Deploy**: publique em qualquer serviço Node.js (Render, Railway,
  Fly.io, VPS...), configure as mesmas variáveis de ambiente lá, e
  aponte a URL do webhook na Meta para o domínio final (em vez do
  domínio do ngrok).
- **Validação de assinatura**: implemente a verificação do header
  `X-Hub-Signature-256` no webhook para garantir que as requisições
  realmente vêm da Meta (não incluída nesta versão inicial).

## Limitações desta versão

- Não há memória de conversa entre mensagens (cada mensagem é enviada
  isoladamente ao Claude). Para manter contexto, guarde um histórico por
  número de telefone (`from`) em um banco de dados ou cache (ex: Redis)
  e passe esse histórico no array `messages` em `src/claude.ts`.
- Suporta apenas mensagens de texto e botões recebidos; mídia (áudio,
  imagem, documento) é ignorada por padrão — pode ser adicionada em
  `extractIncomingTextMessage` em `src/whatsapp.ts`.
- Não valida a assinatura `X-Hub-Signature-256` do webhook (recomendado
  para produção).
