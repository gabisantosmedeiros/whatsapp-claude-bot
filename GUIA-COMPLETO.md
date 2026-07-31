# Guia completo — WhatsApp Cloud API + Claude (bot de resposta automática)

Este guia foi escrito para quem **nunca fez isso antes**. Ele cobre tudo,
do zero, até o bot respondendo mensagens no seu WhatsApp: instalar o
Node.js, extrair o projeto, criar as contas necessárias, rodar o servidor
e configurar o webhook. Inclui também os erros mais comuns que aparecem
no caminho e como resolver cada um.

> Este guia **não** cobre subir o projeto para o GitHub — isso fica para
> um segundo momento, depois que o bot já estiver funcionando no seu
> computador.

---

## Índice

1. [O que você vai precisar](#1-o-que-você-vai-precisar)
2. [Instalar o Node.js](#2-instalar-o-nodejs)
3. [Baixar e extrair o projeto](#3-baixar-e-extrair-o-projeto)
4. [Instalar as dependências do projeto](#4-instalar-as-dependências-do-projeto)
5. [Criar o arquivo de configuração (.env)](#5-criar-o-arquivo-de-configuração-env)
6. [Criar conta na Anthropic (Claude API)](#6-criar-conta-na-anthropic-claude-api)
7. [Criar conta na Meta for Developers (WhatsApp)](#7-criar-conta-na-meta-for-developers-whatsapp)
8. [Rodar o servidor local](#8-rodar-o-servidor-local)
9. [Expor o servidor com o ngrok](#9-expor-o-servidor-com-o-ngrok)
10. [Configurar o webhook no painel da Meta](#10-configurar-o-webhook-no-painel-da-meta)
11. [Testar o bot de verdade](#11-testar-o-bot-de-verdade)
12. [Checklist final](#12-checklist-final)
13. [Quanto custa tudo isso?](#13-quanto-custa-tudo-isso)
14. [Problemas comuns e como resolver](#14-problemas-comuns-e-como-resolver)

---

## 1. O que você vai precisar

- Um computador com Windows, Mac ou Linux.
- Uma conta pessoal no Facebook (é o login usado pra criar o app na Meta).
- Um cartão de crédito (só será cobrado pelo uso real da API do Claude,
  que é bem barato — veja a seção de custos).
- Um número de WhatsApp seu, no celular, pra receber as mensagens de teste.

Nada disso precisa de conhecimento técnico prévio — vamos passo a passo.

---

## 2. Instalar o Node.js

O Node.js é o "motor" que roda o código do bot no seu computador. Ele já
vem com o `npm`, uma ferramenta que baixa as peças (bibliotecas) que o
projeto precisa.

1. Acesse [nodejs.org](https://nodejs.org)
2. Baixe a versão **LTS** (é a recomendada — tem um botão grande na página)
3. Execute o instalador baixado (`.msi` no Windows) e siga o assistente.
   Pode deixar todas as opções como estão por padrão, só clicando "Next"
   até o fim.
4. **Feche qualquer terminal que já estava aberto** e abra um novo — isso
   é importante, porque o `npm` só fica disponível em terminais abertos
   *depois* da instalação.
5. Confirme que funcionou. Abra um terminal:
   - **Windows**: pesquise por "Prompt de Comando" ou "PowerShell" no menu
     iniciar.
   - **Mac**: abra o Spotlight (`Cmd + Espaço`) e digite "Terminal".
   - **Linux**: qualquer terminal.

   E digite:
   ```
   node -v
   npm -v
   ```
   Deve aparecer algo como `v22.18.1` e `11.16.0` (os números exatos podem
   variar, não tem problema).

   Se aparecer `'node' não é reconhecido como um comando`, o Node não foi
   instalado corretamente ou o terminal não foi reaberto. Reinicie o
   computador — isso resolve a grande maioria dos casos.

---

## 3. Baixar e extrair o projeto

1. Baixe o arquivo `.zip` do projeto (o link foi te enviado pelo Claude).
2. Vá até a pasta **Downloads** no seu Explorador de Arquivos.
3. Clique com o **botão direito** no arquivo `.zip` → **"Extrair tudo..."**
   → confirme o destino (pode deixar o padrão, dentro de Downloads) →
   **Extrair**.

   > ⚠️ Só dar duplo clique no zip para "abrir" não é suficiente — isso só
   > mostra o conteúdo, sem realmente copiar os arquivos pro disco. É
   > preciso usar "Extrair tudo".

4. Depois de extrair, você vai ter uma pasta chamada `whatsapp-claude-bot`.
   Às vezes, dependendo de como o zip foi baixado, o Windows cria uma
   pasta **dentro** de outra pasta com o mesmo nome — ou seja, o caminho
   real pode ser:
   ```
   Downloads\whatsapp-claude-bot\whatsapp-claude-bot\
   ```
   Para confirmar qual é a pasta certa, entre nela e veja se tem um
   arquivo chamado `package.json` e uma pasta chamada `src`. Se não tiver,
   é sinal de que ainda tem uma subpasta pra entrar.

---

## 4. Instalar as dependências do projeto

1. Abra um terminal e navegue até a pasta certa do projeto (a que tem o
   `package.json`). Exemplo:
   ```
   cd Downloads\whatsapp-claude-bot\whatsapp-claude-bot
   ```
2. Rode:
   ```
   npm install
   ```
3. Isso vai baixar e instalar tudo que o projeto precisa. Pode demorar
   alguns segundos. No final, é normal aparecerem avisos amarelos tipo:
   ```
   npm warn deprecated inflight@1.0.6: ...
   npm warn deprecated glob@7.2.3: ...
   ```
   e uma mensagem sobre "vulnerabilidades" (`high severity vulnerabilities`).
   **Isso é normal e não impede o bot de funcionar** — são apenas avisos
   sobre bibliotecas internas antigas usadas por ferramentas de
   desenvolvimento. O que importa é ver no final algo como:
   ```
   added 159 packages, and audited 160 packages in 15s
   ```
   Isso confirma que a instalação funcionou.

---

## 5. Criar o arquivo de configuração (.env)

O projeto usa um arquivo chamado `.env` para guardar suas credenciais
secretas (chaves de API, tokens). Ele **não vem pronto** por segurança —
você precisa criar a sua cópia a partir de um modelo.

No terminal, ainda dentro da pasta do projeto:

- **Windows (CMD/PowerShell):**
  ```
  copy .env.example .env
  ```
- **Mac/Linux:**
  ```
  cp .env.example .env
  ```

Isso cria um arquivo `.env` com os campos vazios, prontos para você
preencher nos próximos passos. Para editá-lo, pode usar o Bloco de Notas:
```
notepad .env
```

Os campos que vamos preencher são:
- `ANTHROPIC_API_KEY`
- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN`

---

## 6. Criar conta na Anthropic (Claude API)

1. Acesse [console.anthropic.com](https://console.anthropic.com) e crie
   uma conta (com email ou Google). Se você já usa o Claude.ai no
   navegador, pode entrar com a mesma conta.
2. No menu lateral, vá em **Billing** (ou "Plans and Billing") e adicione
   um cartão de crédito. A API funciona por uso — você paga só pelo que
   consumir, sem mensalidade fixa.
3. Recomendado: defina ali mesmo um **limite de gasto mensal** (spend
   limit), pra nunca ter surpresa na fatura. Algo como US$ 5 ou 10 já é
   mais que suficiente pra testar o bot bastante.
4. Vá em **Settings → API Keys** (ou acesse direto o endereço
   `console.anthropic.com/settings/keys`).
5. Clique em **Create Key** e dê um nome qualquer, por exemplo
   `whatsapp-bot-dev`.
6. **Copie a chave gerada imediatamente.** Ela começa com `sk-ant-...` e
   é mostrada **só uma vez** — se fechar a tela sem copiar, você vai ter
   que revogar essa chave e criar outra.
7. Abra o `.env` (com `notepad .env`) e cole a chave assim:
   ```
   ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
   ```
   Salve o arquivo.

---

## 7. Criar conta na Meta for Developers (WhatsApp)

1. Acesse [developers.facebook.com/apps](https://developers.facebook.com/apps)
   e faça login com sua conta pessoal do Facebook.
2. Se for a primeira vez, vai pedir para completar um cadastro rápido de
   desenvolvedor (aceitar os termos, confirmar email ou SMS).
3. Clique em **Criar app** (Create App).
4. Preencha o nome do app (qualquer nome, ex: "Meu Bot WhatsApp") e o
   email de contato.
5. Na seção de "Casos de uso" (Use cases), procure por **Business
   messaging** e selecione a opção **"Conectar-se com clientes usando o
   WhatsApp"**.
6. Quando pedir, escolha ou crie um **Portfólio de Negócios** (Business
   Portfolio) — pode criar um novo com seu nome, sem problema.
7. Clique para ir ao Dashboard do app.
8. No painel, entre em **WhatsApp → Configuração da API** (às vezes
   aparece como "API Setup"). Nessa tela você vai ver:
   - Um **número de teste** já disponível gratuitamente, com um
     **Phone Number ID** ao lado — esse é um código numérico, não é o
     número de telefone em si.
   - Um botão **Generate access token** (Gerar token de acesso) — clique
     nele para gerar um token temporário, válido por 24 horas. Ótimo
     para testar agora, mas vai precisar ser trocado depois (explico na
     seção de produção, que fica fora deste guia).
9. Copie o **Phone Number ID** e cole no `.env`:
   ```
   WHATSAPP_PHONE_NUMBER_ID=1234567890
   ```
10. Copie o **token de acesso** gerado e cole no `.env`:
    ```
    WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxx
    ```
11. Ainda nessa tela, tem um campo **"To"** (Para) — adicione o **seu
    próprio número de WhatsApp** (com código do país, ex: `5584999999999`)
    como destinatário de teste. A Meta permite até 5 números de teste
    enquanto o app não está em produção.
12. Clique em **Send message** (Enviar mensagem). Você deve receber, no
    seu WhatsApp, uma mensagem automática de template chamada
    "hello_world". Isso confirma que a conexão está funcionando.
13. Por fim, invente uma senha/string secreta qualquer — pode ser
    literalmente qualquer texto que você queira — e coloque no `.env`:
    ```
    WHATSAPP_VERIFY_TOKEN=meu-token-secreto-123
    ```
    Esse valor **você mesmo escolhe**. Ele só precisa ser digitado
    exatamente igual aqui e no painel da Meta, no passo 10 mais adiante.

Nesse ponto, seu `.env` deve ter os 4 campos preenchidos. Salve o arquivo.

---

## 8. Rodar o servidor local

No terminal, dentro da pasta do projeto, rode:

```
npm run dev
```

Se tudo estiver certo, deve aparecer:

```
Servidor rodando em http://localhost:3000
```

**Deixe esse terminal aberto** — ele precisa continuar rodando durante
todo o resto do processo (e sempre que você quiser usar o bot).

Se aparecer um erro dizendo que falta alguma variável de ambiente
(`Variável de ambiente obrigatória ausente: ...`), volte no `.env` e
confira se preencheu todos os 4 campos corretamente, sem espaços extras.

---

## 9. Expor o servidor com o ngrok

Seu servidor está rodando só no seu computador (`localhost`), mas a Meta
precisa conseguir chamá-lo pela internet. Para isso, usamos o ngrok, que
cria um "túnel" temporário com um endereço público.

1. Baixe o ngrok em [ngrok.com/download](https://ngrok.com/download) e
   instale (pode pedir para criar uma conta gratuita rápida no site
   deles).
2. Abra um **segundo terminal** — importante: **sem fechar** o primeiro
   terminal que está com `npm run dev` rodando.
3. No novo terminal, rode:
   ```
   ngrok http 3000
   ```
4. Vai aparecer uma tela parecida com esta:
   ```
   Forwarding    https://abcd1234.ngrok-free.app -> http://localhost:3000
   ```
5. **Copie essa URL que começa com `https://`** — vamos usar no próximo
   passo.

Deixe esse terminal também aberto, junto com o primeiro. Você vai ter
dois terminais abertos ao mesmo tempo.

> ⚠️ Na versão gratuita do ngrok, toda vez que você fecha e abre o
> `ngrok http 3000` de novo, ele gera uma **URL nova e diferente**. Se
> isso acontecer, será preciso repetir o próximo passo com a URL
> atualizada.

---

## 10. Configurar o webhook no painel da Meta

1. Volte para a aba do navegador com o painel do seu app em
   developers.facebook.com/apps
2. Vá em **WhatsApp → Configuração → Webhook** (o nome exato do menu pode
   variar um pouco conforme o idioma da interface).
3. Clique em **Editar** (Edit).
4. Preencha os dois campos pedidos:
   - **URL de callback**: cole a URL do ngrok seguida de `/webhook`.
     Exemplo:
     ```
     https://abcd1234.ngrok-free.app/webhook
     ```
   - **Verificar token**: digite exatamente o mesmo valor que você
     colocou em `WHATSAPP_VERIFY_TOKEN` no `.env` (ex:
     `meu-token-secreto-123`).
5. Clique em **Verificar e salvar**.

   Nesse momento, a Meta vai fazer uma chamada automática pro seu
   servidor (através do ngrok) para confirmar que o token bate. Para
   isso funcionar, seu servidor **precisa estar rodando** (Passo 8) e o
   ngrok **precisa estar ativo** (Passo 9) nesse exato momento.

6. Olhe no terminal do `npm run dev` — deve aparecer a linha:
   ```
   Webhook verificado com sucesso.
   ```
   Se aparecer um erro 403 no navegador, quase sempre é porque o token
   digitado no painel da Meta não é idêntico ao do `.env` — confira
   letra por letra.

7. Ainda na mesma tela, deve haver uma lista chamada **"Campos do
   Webhook"** (Webhook fields). Procure o campo **`messages`** e clique
   em **Assinar** (Subscribe) ao lado dele.

   Este é um passo **separado** da verificação da URL — muita gente
   esquece dele e depois fica sem entender por que nenhuma mensagem
   chega no bot.

---

## 11. Testar o bot de verdade

Com tudo configurado:

1. Pegue seu celular e mande uma mensagem de texto qualquer (ex: "oi")
   para o número de teste da Meta — o mesmo número que te enviou a
   mensagem "hello_world" lá no Passo 7.
2. Observe o terminal do `npm run dev`. Em alguns segundos deve aparecer:
   ```
   Mensagem recebida de 5584999999999: oi
   Resposta enviada para 5584999999999
   ```
3. Volte para o WhatsApp no seu celular — a resposta gerada pelo Claude
   deve ter chegado como uma nova mensagem.

Se isso funcionou, o bot está completo e rodando localmente. 🎉

---

## 12. Checklist final

- [ ] Node.js instalado (`node -v` retorna uma versão)
- [ ] Projeto extraído numa pasta com `package.json` visível
- [ ] `npm install` executado sem travar (os avisos amarelos são normais)
- [ ] `.env` criado a partir do `.env.example`
- [ ] `ANTHROPIC_API_KEY` preenchida
- [ ] `WHATSAPP_TOKEN` preenchida
- [ ] `WHATSAPP_PHONE_NUMBER_ID` preenchida
- [ ] `WHATSAPP_VERIFY_TOKEN` preenchida (valor inventado por você)
- [ ] Terminal 1: `npm run dev` rodando, mostrando "Servidor rodando..."
- [ ] Terminal 2: `ngrok http 3000` rodando, com a URL HTTPS copiada
- [ ] Webhook cadastrado no painel da Meta (URL do ngrok + `/webhook`)
- [ ] Terminal 1 mostrou "Webhook verificado com sucesso."
- [ ] Campo `messages` assinado (subscribe) no webhook
- [ ] Mensagem de teste enviada pelo celular e resposta recebida

---

## 13. Quanto custa tudo isso?

**WhatsApp Cloud API (Meta)**
- Criar o app, gerar o token e testar com seu próprio número (até 5
  destinatários de teste): **gratuito**.
- Cobrança só existe se você sair do modo teste (número em produção,
  campanhas de marketing reais). As tarifas variam por categoria de
  mensagem e mudam com frequência — consulte a página oficial de preços
  da Meta antes de operar em produção.

**Claude API (Anthropic)**
- Não existe um plano gratuito — é necessário adicionar um cartão de
  crédito para gerar uma chave funcional.
- A cobrança é por token (uma fração de palavra), então cada mensagem
  trocada custa uma fração de centavo. Para uso pessoal e testes, um
  crédito de US$ 5 costuma durar bastante tempo.
- Consulte [anthropic.com/pricing](https://www.anthropic.com/pricing)
  para os valores atualizados do modelo usado no projeto (configurado em
  `CLAUDE_MODEL` dentro do `.env`).

**Resumo prático:** enquanto você estiver só testando no seu próprio
número, o único custo real é o consumo (bem baixo) da API do Claude.

---

## 14. Problemas comuns e como resolver

**`'node' não é reconhecido como um comando`**
→ O Node.js não foi instalado, ou o terminal foi aberto antes da
instalação terminar. Instale o Node.js (Passo 2), depois feche e abra um
terminal novo. Se persistir, reinicie o computador.

**`'npm' não é reconhecido como um comando`**
→ Mesma causa do erro acima — o npm vem junto com o Node.js.

**`npm error code ENOENT ... Could not read package.json`**
→ Você está numa pasta que não é a do projeto (geralmente por causa de
uma subpasta duplicada criada ao extrair o zip). Rode `dir` (Windows) ou
`ls` (Mac/Linux) para listar os arquivos da pasta atual, procure a
subpasta que contém o `package.json` e entre nela com `cd nome-da-pasta`.

**`cp` não funciona no Windows**
→ No Prompt de Comando do Windows, use `copy` no lugar de `cp`.

**Muitos avisos amarelos (`npm warn deprecated`) durante o `npm install`**
→ Normal, não afeta o funcionamento do bot. São avisos sobre bibliotecas
internas usadas pelas ferramentas de desenvolvimento.

**Erro sobre variável de ambiente ausente ao rodar `npm run dev`**
→ Volte no `.env` e confirme que os 4 campos estão preenchidos, sem
espaços extras antes ou depois do valor.

**Erro 403 ao clicar em "Verificar e salvar" no webhook da Meta**
→ O `WHATSAPP_VERIFY_TOKEN` do `.env` não é exatamente igual ao valor
digitado no painel da Meta. Copie e cole em vez de digitar, para evitar
erro de digitação.

**Webhook verificado, mas nenhuma mensagem chega no bot**
→ Falta assinar (subscribe) o campo `messages` na lista de "Campos do
Webhook" — é um passo separado da verificação da URL (Passo 10, item 7).

**O bot funcionava e parou de responder depois de um dia**
→ O token de acesso temporário gerado no Passo 7 expira em 24 horas.
Volte na tela "Configuração da API" e gere um novo token, atualizando o
`WHATSAPP_TOKEN` no `.env` e reiniciando o `npm run dev`.

**A URL do webhook mudou sozinha**
→ Isso acontece toda vez que o ngrok é reiniciado (na versão gratuita).
Basta repetir o Passo 10 com a nova URL exibida pelo ngrok.
