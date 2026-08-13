# clonajá — site

Este repositório é o código completo do site. Este guia foi escrito pra
**quem não entende de programação** conseguir baixar, rodar e publicar o
site sozinho, com a ajuda de uma IA (Claude Code, Codex, Cursor, Google
Antigravity, etc.).

Se travar em qualquer passo, copie a mensagem de erro e cole pra IA que
você estiver usando — é exatamente pra isso que o prompt lá embaixo existe.

---

## 🔗 Ver o site no ar agora

**https://clonaj.vercel.app**

---

## 📦 1. Baixar os arquivos do site

Você **não precisa saber Git nem GitHub** pra isso.

1. Acesse: **https://github.com/denisin-rodrigues/clonaj-**
2. Clique no botão verde **"Code"**
3. Clique em **"Download ZIP"**
4. Extraia (descompacte) o arquivo ZIP baixado numa pasta no seu
   computador

Pronto, você já tem todos os arquivos do site na sua máquina.

---

## 🤖 2. Rodar o site no seu computador (com ajuda de uma IA)

Você vai usar uma IA de programação pra fazer o trabalho técnico por
você. Não precisa ser nenhuma ferramenta específica — qualquer uma que
tenha um "agente" que roda comandos e mexe nos arquivos sozinho serve,
por exemplo:

- **Google Antigravity** — **totalmente gratuita**, não pede cartão de
  crédito nem assinatura. Baixe em **antigravity.google**. É a opção
  recomendada pra quem não quer pagar nada.
- Claude Code, Codex, Cursor — também funcionam, mas em geral pedem uma
  assinatura paga (ChatGPT Plus, Claude Pro, etc.) pra uso sem limite.

O prompt abaixo funciona igual em qualquer uma delas. Você só precisa:

1. Instalar uma dessas ferramentas (se ainda não tiver)
2. Abrir a pasta que você extraiu no passo anterior dentro dela
3. Colar o texto abaixo e mandar

Copie e cole esse prompt inteiro:

```
Este é o código de um site em Next.js (React + TypeScript). Preciso que
você:

1. Verifique se o Node.js está instalado no meu computador (versão 20 ou
   mais nova). Se não estiver, me explique de forma simples como instalar.
2. Instale as dependências do projeto (npm install).
3. Rode o site localmente (npm run dev) e me diga o endereço
   (normalmente http://localhost:3000) pra eu abrir no navegador e
   conferir.
4. Depois que eu confirmar que o site abriu certo, me pergunte se eu
   quero mudar algum texto, imagem, cor ou o domínio/link que aparece no
   site, e faça essas alterações comigo, uma de cada vez.
5. Quando eu disser que está pronto, me ajude a colocar o site no ar.
   Pergunte se eu quero publicar na Vercel direto da minha pasta (mais
   fácil e gratuito, não precisa de GitHub), subir os arquivos numa
   hospedagem tipo Hostinger, ou enviar o projeto pra um repositório meu
   no GitHub (nesse caso, NUNCA use a tela de "upload de arquivos" do
   site do GitHub — ela trava com projetos grandes; use os comandos de
   git pra enviar). Siga o caminho que eu escolher, me explicando cada
   passo em linguagem simples, sem termos técnicos difíceis, como se eu
   nunca tivesse programado antes.

Importante: eu não entendo de programação. Explique cada passo devagar,
uma coisa de cada vez, e espere minha confirmação antes de continuar pro
próximo passo.
```

A IA vai cuidar da parte técnica e ir te guiando passo a passo pelo chat.

---

## 🌐 3. Colocar o site no ar com o seu próprio domínio

Você pode pedir pra IA fazer isso pelo prompt acima (ela publica direto
da sua pasta, sem precisar mexer em GitHub — é o caminho mais simples),
ou seguir você mesmo um dos caminhos abaixo.

### Opção A — Vercel (mais fácil, recomendado)

A Vercel é gratuita para esse tipo de site e é a forma mais simples de
colocar no ar. **Você não precisa de conta no GitHub pra isso** — é só
pedir pra IA no prompt acima (passo 5) publicar direto da pasta do seu
computador.

Se preferir fazer você mesmo, sem IA:

1. Crie uma conta em **vercel.com** (dá pra entrar com e-mail)
2. Instale a ferramenta de publicação: abra o terminal na pasta do
   projeto e rode `npx vercel login`, depois `npx vercel --prod`
3. Siga as perguntas que aparecem no terminal (aceite as opções padrão
   apertando Enter)
4. Pra usar seu próprio domínio: dentro do projeto no site da Vercel, vá
   em **Settings → Domains**, digite seu domínio (ex: `meusite.com.br`) e
   a Vercel mostra exatamente quais dados cadastrar lá onde você comprou
   o domínio (Registro.br, GoDaddy, Hostinger, etc.)

> ⚠️ **Não tente arrastar o projeto inteiro (ou o .zip baixado) pra
> dentro do GitHub pelo site** ("Add file → Upload files" ou a tela de
> "arraste arquivos aqui"). Esse jeito só aceita arquivos de até 25MB
> cada, trava fácil com muitos arquivos de uma vez e não é feito pra
> subir um projeto inteiro. Se você quiser mesmo ter uma cópia no seu
> GitHub (por exemplo, pra Vercel publicar sozinha toda vez que algo
> mudar), o jeito certo é: criar um repositório **vazio** no GitHub (só
> clicar em "New repository", sem enviar nenhum arquivo) e depois pedir
> pra IA, usando o prompt acima, "subir esse projeto pro meu repositório
> [link do repositório vazio]" — ela faz isso por comandos, sem passar
> pela tela de upload.

### Opção B — Hostinger (ou qualquer hospedagem)

Esse site é 100% "estático" (não precisa de servidor especial), então dá
pra hospedar em qualquer plano, até o mais simples.

1. No computador, dentro da pasta do projeto, rode: `npm run build`
2. Isso vai criar uma pasta chamada **`out`** com o site pronto
3. Entre no painel da sua hospedagem (na Hostinger: **hPanel → Gerenciador
   de Arquivos**)
4. Vá até a pasta **`public_html`** (ou a pasta do seu domínio) e envie
   **todo o conteúdo de dentro da pasta `out`** pra lá
5. Pronto — acessando seu domínio o site já aparece

---

## ✏️ Personalizar (textos, cores, domínio, etc.)

Você não precisa editar código na mão. É só pedir pra IA no chat, por
exemplo:

- "troca o texto do botão principal para XXXX"
- "troca a cor azul do site para verde"
- "troca o e-mail/instagram que aparece no rodapé"

Ela encontra o arquivo certo e faz a alteração pra você.

---

## ❓ Perguntas frequentes

**Preciso saber programar?**
Não. Todo o trabalho técnico é feito pela IA, você só confirma cada
passo.

**Preciso pagar alguma coisa?**
Não é obrigatório. A Vercel tem plano gratuito que já é suficiente pra
esse site, e o Google Antigravity (a IA que faz o trabalho técnico) também
é gratuito. Você só paga se já tiver (ou comprar) um domínio próprio e/ou
uma hospedagem como a Hostinger.

**Não tenho Claude Code nem Codex, posso usar outra IA?**
Sim. Qualquer IA que consiga rodar comandos no terminal e editar arquivos
sozinha serve — o **Google Antigravity** é a opção gratuita recomendada
(antigravity.google). O prompt do passo 2 funciona igual em qualquer uma
delas, é só colar.

**Posso usar meu próprio domínio (ex: meusite.com.br)?**
Sim — em ambas as opções acima (Vercel ou Hostinger) tem um passo
específico pra isso.

**E se eu travar em algum passo?**
Copie a mensagem de erro (ou tire um print) e cole no chat da IA
pedindo ajuda. Ela consegue ler o erro e te explicar o que fazer.
