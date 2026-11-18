# Aprovações dti

Sistema de aprovação de conteúdo do time de Comunicação da dti digital. Em produção em https://aprovacoes-dti.pages.dev, com login por e-mail da empresa.

## Funcionalidades
- **Envio:** formulário em blocos, com check de IA obrigatório para textos.
- **Aprovação:** aprovador principal (decide) e secundário (parecer consultivo). A aprovação externa pode ser registrada a qualquer momento.
- **Card do conteúdo:** linha do tempo com versões numeradas, faixa de "próximo passo" e comentários em trechos do texto.
  - **Versões:** o autor envia uma versão corrigida depois do pedido de ajuste, ou uma nova versão antes da decisão.
  - **Link por versão:** cada versão guarda o próprio link. A opção "mesmo link" marca quando só o arquivo mudou.
- **Status:** "Cancelado" com motivo e card substituto, e histórico de textos editados.
- **Telas:** Painel do aprovador, Meus envios, Fila de aprovação e Links úteis do time.
- **Atualização automática:** tempo real do Supabase mais uma busca a cada 60 s.
- **Integrações:** notificações no Teams com @menções; Notion (link do card, status na aprovação e data de publicação lida do calendário).

## Arquitetura
```
index.html (React 18 + Babel standalone, sem build, um arquivo só)
  ├── Supabase  → PostgreSQL (conteudos, equipe, config, links, links_categorias) + Realtime + Storage (imagens-ajuste)
  ├── Cloudflare Pages (hospedagem; push em main publica sozinho) + Cloudflare Access (login por e-mail)
  ├── Google Apps Script (Code.gs) → Power Automate → Teams (Adaptive Cards)
  └── Notion API (opcional)
```

## Arquivos
| Arquivo | O que é |
|---|---|
| `index.html` | O sistema inteiro |
| `setup.sql` | Tabelas, permissões, storage e tempo real do Supabase (seções numeradas, na ordem em que foram criadas) |
| `Code.gs` | Apps Script que repassa as notificações para o Teams (o trecho de planilha é legado da primeira versão) |
| `INSTRUCOES.md` | Como configurar do zero e como manter |
| `SEGURANCA-cloudflare.md` | Como configurar o Cloudflare Access |

## Configuração
- **No topo do `index.html`:** URL e chave publishable do Supabase (feita para ficar no navegador; a proteção vem do Cloudflare Access), admins, perfis master, status, canais e ID do database do Notion.
- **Na tabela `config` do Supabase:** URL do Apps Script (`apps_script_notify_url`) e token do Notion (`notion_token`). O token fica só no banco, nunca no código.
- **Na tabela `equipe`:** nomes, e-mails e quem está ativo. Pode ser editada pela tela de configuração.
- **No `Code.gs`:** URL do webhook do Power Automate.
