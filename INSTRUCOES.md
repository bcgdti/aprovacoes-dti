# Como colocar o sistema de aprovações no ar

São 3 passos: criar a planilha, publicar o script e hospedar o site. Leva uns 15 minutos e não precisa saber programar.

---

## Passo 1 — Criar a planilha (banco de dados)

1. Acesse [sheets.google.com](https://sheets.google.com) com a conta do time e crie uma planilha nova.
2. Dê o nome **"Redes sociais - Aprovações dti"** (ou outro de sua preferência).
3. Não precisa criar colunas — o script cria tudo sozinho no primeiro uso.

## Passo 2 — Publicar o script (a "ponte" entre o site e a planilha)

1. Na planilha, vá em **Extensões → Apps Script**.
2. Apague o código que aparecer e cole **todo o conteúdo do arquivo `Code.gs`** (está nesta pasta).
3. Clique no ícone de salvar (💾).
4. Clique em **Implantar → Nova implantação**.
5. Clique na engrenagem ⚙️ ao lado de "Selecionar tipo" e escolha **App da Web**.
6. Configure:
   - **Executar como:** Eu (sua conta)
   - **Quem pode acessar:** Qualquer pessoa
7. Clique em **Implantar** e autorize o acesso quando o Google pedir (pode aparecer um aviso de "app não verificado" — clique em "Avançado" → "Acessar... (não seguro)". É seguro: o app é o seu próprio script).
8. **Copie a URL do App da Web** (termina com `/exec`). Você vai usá-la no passo 3.

## Passo 3 — Configurar e hospedar o site

1. Abra o arquivo `index.html` (desta pasta) num editor de texto (Bloco de Notas serve).
2. Logo no início, localize a linha:
   ```
   const API_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";
   ```
3. Substitua `COLE_AQUI_A_URL_DO_APPS_SCRIPT` pela URL copiada no passo 2 (mantenha as aspas). Salve.
4. Hospede o arquivo — opção mais fácil, sem criar conta:
   - Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
   - Arraste a **pasta** contendo o `index.html` para a página
   - O Netlify gera um link público na hora (ex.: `https://nome-aleatorio.netlify.app`)
   - Dica: criando uma conta grátis no Netlify você pode personalizar o nome do link e ele fica permanente.
5. Compartilhe o link com o time: Alice, Aline, Bruna, Luís, Pedro, Henrique e Marcela.

---

## Passo 4 (opcional) — Notificações no Microsoft Teams

Cada novo envio e cada atualização (aprovação, ajustes, reenvio, comentário, parecer) podem virar uma mensagem num **chat de grupo** do Teams. Os webhooks antigos do Teams foram aposentados; o método atual é via **Power Automate "Workflows"**:

1. No Teams, vá no chat de grupo onde quer receber as mensagens → clique nos **três pontinhos (•••)** do chat → **Workflows** (ou abra o app "Workflows" / "Fluxos de Trabalho").
2. Procure o modelo **"Publicar em um chat quando uma solicitação de webhook for recebida"** (em inglês: *"Post to a chat when a webhook request is received"*).
3. Confirme a conta, selecione o chat de grupo e clique em **Adicionar / Criar**.
4. O Power Automate vai gerar uma **URL de webhook (HTTP POST)**. Copie essa URL.
5. Abra o `Code.gs` no Apps Script, localize no topo a linha:
   ```
   const TEAMS_WEBHOOK_URL = "";
   ```
   Cole a URL entre as aspas e salve.
6. Reimplante o script: **Implantar → Gerenciar implantações → ✏️ → Versão: Nova versão → Implantar**.
7. A mensagem que chega tem o campo `text` pronto (ex.: *"Aprovações dti — Novo conteúdo enviado — C-019 …"*). Se o modelo do Workflow pedir, mapeie o conteúdo do cartão para o campo **text** do corpo recebido.

Se a URL ficar vazia, o sistema funciona normalmente — só não envia notificações.

---

## Como o sistema funciona no dia a dia

1. **Check de IA antes de enviar** (só para tipo "Texto" ou "Ambos" — "Arte" não exige): no próprio formulário, clicar em "Copiar conteúdo para check de IA", colar no Projeto do Claude com as diretrizes da dti, ajustar se preciso e marcar a caixa **"Passei esse conteúdo no check de IA"** (obrigatória para enviar).
2. **Enviar conteúdo**: preencher autor, canal, tipo, título, conteúdo, link de mídia, data de postagem, **aprovador principal** e, se quiser, um **aprovador secundário** (opcional). O conteúdo já entra direto na fila do aprovador.
3. **Parecer do secundário** (consultivo): quem foi marcado como secundário vê o item em "Para meu parecer (secundário)" no Painel do aprovador e registra "De acordo" ou "Com ressalvas". Isso fica visível para todos, mas **não decide** a aprovação.
4. **Decisão do principal**: só o aprovador principal Aprova ou Solicita ajustes. Ambos podem **comentar trechos específicos do texto** (selecionando com o mouse).
5. **Ajustes e versão corrigida**: se o principal pedir ajustes, o autor abre o item em "Meus envios", edita a **versão corrigida** (que aparece lado a lado com a original) e reenvia — refazendo o check de IA quando for texto.

Tudo fica gravado na planilha — você pode abrir o Google Sheets a qualquer momento para auditar ou exportar.

## Avisos

- A lista atualiza sozinha a cada 60 segundos; o botão "Atualizar" na barra lateral força a atualização.
- Se aparecer "Não consegui conectar à planilha", confira se a URL do passo 3 está certa e se a implantação do script está com acesso "Qualquer pessoa".
- **Sempre que editar o `Code.gs`** (inclusive ao colar a URL do Teams), reimplante: **Implantar → Gerenciar implantações → ✏️ → Versão: Nova versão → Implantar**. As colunas novas da planilha são criadas automaticamente.
