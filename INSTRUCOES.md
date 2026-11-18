# Como configurar e manter o sistema de aprovações

> A primeira versão usava Google Sheets como banco e Netlify como hospedagem. Hoje o banco é o Supabase e a hospedagem é o Cloudflare Pages.

## Manutenção do dia a dia
1. Edite o `index.html`. Não há build: o arquivo vai para o ar como está.
2. Teste localmente com um servidor estático, apontando para uma cópia com as gravações bloqueadas se mexer no fluxo.
3. `git add . && git commit -m "descrição" && git push origin main`. O Cloudflare Pages publica em cerca de 1 minuto.
4. Mudou o formato da mensagem do Teams? Edite o `Code.gs` no Apps Script, reimplante (**Gerenciar implantações → editar → Nova versão**) e teste enviando um conteúdo.

## Configurar do zero

### 1. Banco (Supabase)
1. Crie um projeto em supabase.com.
2. Antes de rodar o `setup.sql`, troque os nomes e e-mails de exemplo da seção 1 e deixe vazia a URL do Apps Script da seção 2. Depois cole o arquivo inteiro no **SQL Editor** e clique em **Run**.
   - A seção 9 (tempo real) pode responder "already member": é só ignorar.
   - As policies dão erro se já existirem.
3. Em **Project Settings → API**, copie a Project URL e a chave **publishable** para `SUPABASE_URL` e `SUPABASE_KEY` no `index.html`.

### 2. Hospedagem e login (Cloudflare)
1. **Hospedagem:** em **Workers e Pages → Criar → Pages → Conectar ao Git**, escolha este repositório, sem comando de build e com a pasta de saída `/`.
2. **Login:** em **Zero Trust → Access → Applications**, crie uma aplicação Self-hosted para o domínio `.pages.dev`. Use uma policy Allow por e-mail ou domínio da empresa e o login method One-time PIN. Detalhes em `SEGURANCA-cloudflare.md`.
3. **Admins:** no `index.html`, coloque em `ADMIN_EMAILS` os e-mails de quem administra. Em `PERFIS_MASTER`, coloque quem pode cancelar e reabrir qualquer card.

> Erro na policy do Access tira o acesso do time inteiro. Teste numa janela anônima antes de divulgar.

### 3. Notificações no Teams (opcional)
1. No chat do Teams, abra **••• → Workflows** e use o modelo "Publicar em um chat quando uma solicitação de webhook for recebida". Copie a URL gerada.
2. Crie uma planilha Google, abra **Extensões → Apps Script** e cole o `Code.gs`. O script precisa estar vinculado a uma planilha. Coloque a URL em `TEAMS_WEBHOOK_URL`.
3. Implante como **App da Web**, executando como você e com acesso para qualquer pessoa. Copie a URL que termina em `/exec`.
4. No Supabase, preencha a tabela `config`, chave `apps_script_notify_url`, com essa URL.
5. As @menções usam os e-mails da tabela `equipe`.

### 4. Notion (opcional)
1. Crie uma integração em notion.so/my-integrations e compartilhe o database do calendário com ela.
2. Coloque o ID do database em `NOTION_DB_CALENDARIO`, no `index.html`.
3. Coloque o token na tabela `config`, chave `notion_token`. Nunca no código.
4. O código usa as colunas "ID", "Texto", "Arte", "Status Texto", "Status Imagem/Vídeo" e "Dia de Postagem".

## Como o sistema funciona no dia a dia
1. **Envio:** o autor preenche o formulário. Para textos, passa o conteúdo no check de IA (botão "Copiar para check de IA") e marca a confirmação.
2. **Parecer do secundário:** é consultivo ("De acordo" ou "Com ressalvas") e não decide.
3. **Decisão:** só o aprovador principal aprova ou pede ajustes. Dá para comentar trechos do texto e anexar imagens.
4. **Versões:** depois de um pedido de ajuste, o autor reenvia a versão corrigida. Antes da decisão, pode enviar uma nova versão. Cada versão guarda o próprio link, e "mesmo link" indica que só o arquivo mudou.
5. **Aprovação externa:** quando marcada no envio, é registrada a qualquer momento pelo autor ou pelo aprovador principal.
6. **Cancelamento:** autor, aprovador principal ou perfil master cancelam com motivo e podem reabrir.
