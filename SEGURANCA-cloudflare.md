# Proteger o site com login (Cloudflare Access — grátis)

Objetivo: só pessoas autorizadas (e-mails da equipe) conseguem abrir o site. Quem não estiver na lista nem vê a página. Grátis até 50 usuários.

A ideia: em vez de hospedar no Netlify, o site passa a ficar na **Cloudflare Pages** (também grátis) e ativamos o **Cloudflare Access** na frente dele. Leva ~20 min na primeira vez.

> O sistema em si não muda — é o mesmo `index.html`, mesma planilha, mesmo link do Apps Script. Só muda a hospedagem e ganha a tela de login.

---

## Parte 1 — Criar conta e hospedar na Cloudflare Pages

1. Crie uma conta grátis em [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) com o e-mail da equipe.
2. No painel, menu lateral: **Workers e Pages** → **Criar** → aba **Pages** → **Carregar ativos** (Upload assets / Direct Upload).
3. Dê um nome ao projeto (ex.: `aprovacoes-dti`). Ele vira o endereço `aprovacoes-dti.pages.dev`.
4. Arraste **apenas o `index.html`** (igual fazia no Netlify) e clique em **Implantar** (Deploy).
5. Em alguns segundos o site está no ar em `https://aprovacoes-dti.pages.dev`. Abra para conferir que funciona (ainda sem login).

## Parte 2 — Ativar o Zero Trust (uma vez só)

1. No painel da Cloudflare, menu lateral: **Zero Trust** (pode aparecer como "Acesso por Zero Trust").
2. Na primeira vez ele pede para escolher um **nome de equipe** (team name) — qualquer nome, ex.: `dti`. Confirme.
3. Pode pedir um plano: escolha o **Free** (gratuito, até 50 usuários). Em alguns casos pede cartão só para validar, mas não cobra no plano Free.

## Parte 3 — Proteger o site com login por e-mail

1. Dentro do **Zero Trust**, vá em **Access** → **Applications** (Aplicativos) → **Add an application** → **Self-hosted**.
2. Configure:
   - **Application name:** Aprovações dti
   - **Session duration:** o quanto a pessoa fica logada (ex.: 24 horas ou 1 semana)
   - **Application domain:** coloque o endereço do site — subdomínio `aprovacoes-dti`, domínio `pages.dev`.
3. Avance para **Policies** (Políticas) → **Add a policy**:
   - **Policy name:** Equipe dti
   - **Action:** Allow
   - Em **Include**, escolha **Emails** e liste os e-mails das 7 pessoas (Alice, Aline, Bruna, Luís, Pedro, Henrique, Marcela). 
   - (Alternativa: usar **Emails ending in** com o domínio da empresa, ex.: `@dtidigital.com.br`, para liberar todo mundo da empresa.)
4. Em **Login methods**, deixe ativado o **One-time PIN** (código enviado por e-mail) — assim ninguém precisa criar senha; recebe um código no e-mail a cada login.
5. Salve.

## Parte 4 — Testar

1. Abra `https://aprovacoes-dti.pages.dev` numa janela anônima.
2. Deve aparecer a tela da Cloudflare pedindo o e-mail → digite um e-mail autorizado → chega um código no e-mail → digite o código → o site abre.
3. Tente com um e-mail fora da lista: deve ser barrado.

Pronto — o site agora exige login, e o link `.pages.dev` é o que você compartilha com a equipe (pode aposentar o link do Netlify).

---

## Extra opcional — fechar o "porta dos fundos" dos dados

O Cloudflare Access protege a **página**. Mas o link do Apps Script (a planilha) continua acessível por fora para quem tiver o endereço exato. Esse endereço não está publicado em lugar nenhum, então o risco é baixo. Se quiser fechar 100%, dá para exigir uma "senha técnica" (token) nas chamadas à planilha — me avisa que eu implemento essa camada extra no `Code.gs` e no `index.html`.

## Observações

- Continua tudo grátis: Cloudflare Pages (hospedagem) e Zero Trust Free (até 50 usuários).
- Para atualizar o site no futuro: em **Workers e Pages** → seu projeto → **Criar implantação** → arraste o `index.html` novo.
- Se preferir manter o Netlify, a proteção forte e gratuita não está disponível lá (a senha do Netlify é recurso pago); por isso a migração para a Cloudflare.
