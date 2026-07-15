# Aprovações dti

Sistema de aprovações de conteúdo para redes sociais da dti digital.

## Funcionalidades

- Envio de conteúdo com check de IA obrigatório (para textos)
- Aprovador principal e aprovador secundário (parecer consultivo)
- Aprovação externa como etapa após aprovação interna
- Comentários em trechos específicos do texto
- Exclusão de envios pelo autor
- Notificações no Microsoft Teams com @menções

## Equipe

Alice, Aline, Bruna, Luís, Pedro, Henrique, Marcela.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | App completo (React num arquivo só, roda no navegador) |
| `Code.gs` | Backend Google Apps Script (conecta ao Google Sheets) |
| `INSTRUCOES.md` | Passo a passo para colocar no ar |
| `SEGURANCA-cloudflare.md` | Configuração do Cloudflare Access (login por e-mail) |

## Configuração

As URLs e chaves de acesso ficam nas variáveis de ambiente do Cloudflare Pages — não ficam no código.
