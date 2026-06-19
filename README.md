# Vikings — Valhalla Survivor

## Identificação

| Nome | Número |
|------|--------|
| Vasco da Nova Miranda | nº 33371 |
| Tiago do Rosário Eiras Fernandes | nº 33399 |

**Versão do Phaser:** 3.90.0 (incluída via CDN jsDelivr no `index.html`)

---

## Descrição do Jogo

**Valhalla Survivor** é um jogo de sobrevivência *survivor-like* (no estilo *Vampire Survivors*) com temática **viking/nórdica**. O jogador assume o papel de um guerreiro viking que tem de sobreviver às hordas de Ragnarok para chegar a Valhalla.

O guerreiro **ataca automaticamente** com machados, sempre contra o inimigo mais próximo, sem necessidade de apontar ou premir botão de ataque. As vagas de inimigos, serpentes, lobos, trolls e dragões, tornam-se progressivamente mais rápidas e numerosas, culminando num **chefe final**, Nidhogg, o Devorador.

O objetivo é sobreviver **3 minutos** às hordas. A estética viking é reforçada através dos sprites, do ambiente nevado, da música e dos efeitos sonoros.

### Implementações

- Combate automático com mira ao inimigo mais próximo
- Sistema de XP e subida de nível, com gemas de alma largadas pelos inimigos
- Runas/upgrades por nível (mais vida, machados mais rápidos, multishot, perfuração, escudo, íman de gemas, corvo aliado, etc.)
- Escudo que bloqueia um ataque e se quebra ao ser usado
- Vagas de inimigos diferenciadas (serpentes, lobos, trolls, dragões) e chefe final
- Ecrãs de menu, instruções, pausa, vitória e derrota
- Som ambiente, efeitos sonoros e música de fundo
- Internacionalização em **português**, **inglês** e **norueguês**, guardada no `localStorage`

---

## Jogabilidade

### Objetivo
Sobreviver 3 minutos às hordas de inimigos, subindo de nível e escolhendo upgrades, até derrotar o chefe final e chegar a Valhalla.

### Controlos

| Ação | Teclas |
|------|--------|
| Mover o guerreiro | `W` `A` `S` `D` / setas direcionais |
| Atacar | Automático (machados disparados sozinhos no inimigo mais próximo) |
| Pausar / voltar ao menu | `ESC` |
| Recomeçar (no fim de jogo) | `R` |

> Não é necessário rato para jogar, toda a mira e o disparo são automáticos.

### Regras

- O guerreiro ataca automaticamente sempre o inimigo mais próximo
- Derrotar inimigos larga **gemas de alma** que dão XP
- Ao subir de nível, o jogador escolhe uma **runa/upgrade**
- O **escudo** bloqueia um único ataque e quebra-se ao ser usado
- As vagas ficam mais rápidas e numerosas com o passar do tempo
- O jogo termina ao perder toda a vida (derrota) ou ao sobreviver 3 minutos e derrotar o chefe (vitória)

---

## Como Executar o Projeto

### Pré-requisitos
- Um **browser** moderno
- Um **servidor local** (o `index.html` não funciona com `file://` porque `src/main.js` é carregado como módulo ES)

### Passos
1. Clonar o repositório:
   ```bash
   git clone https://github.com/vascomiranda2019/Vikings.git
   ```
2. Servir os ficheiros estáticos com uma das opções:
   - **Live Server (VS Code):** instalar a extensão "Live Server", abrir a pasta e clicar em **Go Live** sobre o `index.html`
   - **npx serve:**
     ```bash
     npx serve .
     ```
   - **Servidor Python:**
     ```bash
     python -m http.server
     ```
3. Abrir no browser o endereço indicado (ex.: `http://localhost:3000` ou `http://localhost:8000`)

> Não existe build step nem `package.json` — o Phaser é carregado por CDN e o restante código como módulos ES nativos.

---

## Assets Multimédia

### Sprites
- **Formato:** PNG (spritesheets, com transparência)
- **Localização:** `src/assets/images/`
- **Conteúdo:** herói viking, corvo aliado, inimigos (lobos, serpente, troll, dragão) e elementos de cenário (árvores, bonecos de neve, cabana, piso)
- **Origem:** sprites de temática viking/nórdica obtidos no **itch.io**
- **Justificação:** spritesheets permitem animação fluida (idle/walk) sem multiplicar ficheiros; PNG preserva a transparência dos sprites

### Imagens de Menu
- **Formato:** JPG
- **Localização:** `src/assets/images/`
- **Conteúdo:** fundo do menu principal (`menu.jpg`) e ilustração de vitória/Valhalla (`valhala_imagem.jpg`)
- **Origem:** imagens geradas com **Gemini** (IA)
- **Justificação:** JPG por serem imagens full-screen sem transparência, beneficiando da compressão com perda do formato

### Sons e Música
- **Formato:** MP3
- **Localização:** `src/assets/audio/`
- **Conteúdo:** música de fundo, som de ataque do machado, som de subida de nível e sons de inimigos (lobo, dragão, troll, serpentes)
- **Origem:** efeitos sonoros e música obtidos no **freesound.org**
- **Justificação:** MP3 por ser comprimido e amplamente suportado pelos browsers, mantendo ficheiros leves para carregamento rápido

### Fontes
- **Fonte:** Cinzel / Cinzel Decorative (Google Fonts), carregada via link no `index.html`
- **Justificação:** fonte decorativa que reforça a estética viking/nórdica nos títulos e menus

---

## Observações e Lacunas Identificadas

- O jogo foi desenvolvido para teclado; não existe suporte para comando/gamepad
- Não é possível jogar com rato — toda a mira e disparo são automáticos
- As imagens de menu foram geradas por IA (Gemini) e podem apresentar pequenas imperfeições
- A narrativa é transmitida apenas através da estética visual e sonora, sem cinemáticas
- Requer um servidor local para correr; abrir o `index.html` diretamente (`file://`) não funciona
