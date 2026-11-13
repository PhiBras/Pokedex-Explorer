# NEONDEX 3.0 — Pokédex + Arena

Projeto front-end em HTML, CSS e JavaScript puro, consumindo a [PokéAPI v2](https://pokeapi.co/docs/v2), com identidade dark futurista em laranja.

**Autor do projeto:** PhiBras.

## Como executar
1. Extraia o arquivo ZIP.
2. Abra a pasta no VS Code.
3. Inicie um servidor local (recomendado: extensão **Live Server**).
4. Abra `index.html` pelo Live Server.

Também é possível abrir `index.html` diretamente no navegador, mas um servidor local evita algumas restrições do navegador.

## Funcionalidades
- Consulta dos 1.025 Pokémon da lista da API.
- Pesquisa por nome ou número.
- Filtro por tipo e ordenação.
- Paginação.
- Modal com imagem, tipos, altura, peso, experiência, habilidades e atributos-base.
- Arena com seleção do Pokémon do jogador e do adversário controlado pela IA.
- Até quatro movimentos disponíveis por combatente, priorizando coreografias distintas, com PP e escolha estratégica da IA.
- Cálculo de dano com atributos, STAB, precisão, variação aleatória e efetividade elemental.
- Queimadura, envenenamento, paralisia, sono e congelamento, com efeitos para os dois combatentes.
- `BattleAnimator` usa os metadados oficiais do golpe (nome, tipo, categoria, poder, prioridade, dreno, alvo e meta), além do nome, formato corporal e tipos dos dois Pokémon.
- Sprites animados de batalha da geração V da PokéAPI; sprites posicionais de costas/frente e ilustração oficial como alternativas.
- Rig 2D hierárquico de três pivôs (base, tronco e cabeça), aplicado a uma única imagem íntegra do sprite, sem recortes `clip-path`.
- Idle articulado, preparação, investida/recuo, reação a impacto e nocaute sincronizados com a sequência de ataques.
- Sequência de ataque, efeito, impacto e dissipação; HP/status são atualizados no callback de impacto.
- Coordenadas dos efeitos calculadas pelos limites visuais dos combatentes, com reação do alvo e tremor da arena.
- Efeitos sincronizados com o dano e o HP; os comandos ficam bloqueados durante cada ação.
- Indicadores de status, barras de HP, log, resultado e reinício da batalha.
- Estados de carregamento, erro e ausência de resultados na Pokédex.

## Observações sobre a batalha
A arena é uma simulação didática própria, não uma reprodução integral das regras oficiais dos jogos. Usa movimentos, atributos e formato corporal da PokéAPI, além de uma tabela de efetividade elemental. Efeitos, probabilidades e cálculo de dano foram simplificados para manter o combate rápido. A aleatoriedade usada na precisão, nos status e na variação de dano pertence às regras simuladas do combate; a seleção e a geometria das animações não usam hash nem geração aleatória.

Sprites animados usam a geração V (Black/White) da PokéAPI, com o sprite de costas para o jogador e o de frente para a IA. Quando o GIF não existe, são usados `sprites.back_default` / `sprites.front_default`; a ilustração oficial serve como fallback final. `app.js` também consulta `pokemon.species.url` e envia o formato corporal e os tipos oficiais para o rig. O motor v4 escolhe coreografias por catálogo explícito de golpes e regras baseadas nos metadados da API, sem hash ou aleatoriedade nos efeitos visuais. O rig preserva o sprite inteiro: seus pivôs transformam a imagem como um todo, não separam membros individuais. As animações são aproximações visuais próprias, não animações oficiais da PokéAPI. O motor está em `battleAnimations.js` e é carregado antes de `app.js`.

## Estrutura
- `index.html` — estrutura e componentes da interface.
- `style.css` — identidade visual dark futurista e responsividade.
- `battleAnimations.js` — motor v4 de coreografias determinísticas, rig de pivôs e efeitos de ataque em pixel art.
- `app.js` — integração com API, pesquisa, detalhes e lógica da arena.

Não é necessário instalar dependências ou configurar chave de API.
