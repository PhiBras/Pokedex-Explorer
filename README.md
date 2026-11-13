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
- Até quatro movimentos disponíveis por combatente, com PP e escolha estratégica da IA.
- Cálculo de dano com atributos, STAB, precisão, variação aleatória e efetividade elemental.
- Queimadura, envenenamento, paralisia, sono e congelamento, com efeitos para os dois combatentes.
- `BattleAnimator` cria um canvas transparente em pixel art sobre a arena, com efeitos escolhidos pelo tipo do movimento.
- Sprites animados de batalha da geração V da PokéAPI; sprites posicionais de costas/frente e ilustração oficial como alternativas.
- Rig articulado 2D com três juntas sobrepostas (base, tronco e cabeça/asas), usando o próprio sprite da PokéAPI em cada camada.
- Idle articulado, preparação, investida/recuo, reação a impacto e nocaute sincronizados com a sequência de ataques.
- Sequência de ataque, efeito, impacto e dissipação; HP/status são atualizados no callback de impacto.
- Coordenadas dos efeitos calculadas pelos limites visuais dos combatentes, com reação do alvo e tremor da arena.
- Efeitos sincronizados com o dano e o HP; os comandos ficam bloqueados durante cada ação.
- Indicadores de status, barras de HP, log, resultado e reinício da batalha.
- Estados de carregamento, erro e ausência de resultados na Pokédex.

## Observações sobre a batalha
A arena é uma simulação didática própria, não uma reprodução integral das regras oficiais dos jogos. Usa movimentos e atributos da API e uma tabela de efetividade elemental. Efeitos, probabilidades e cálculo de dano foram simplificados para manter o combate rápido.

Sprites animados usam a geração V (Black/White) da PokéAPI, com o sprite de costas para o jogador e o de frente para a IA. Quando o GIF não existe, são usados `sprites.back_default` / `sprites.front_default`; a ilustração oficial serve como fallback final. `ArticulatedRig` duplica o mesmo sprite em três camadas recortadas e aninhadas para permitir poses independentes de base, tronco e cabeça/asas sem desenhar o Pokémon em canvas nem substituir a imagem durante o ataque. Os movimentos são aproximações 2D genéricas: o recorte não conhece a anatomia real de cada espécie, portanto não oferece articulação individual de patas, braços, asas ou cauda. Os efeitos pixelados no canvas são genéricos por tipo e arquétipo, não animações oficiais específicas de cada golpe. A preferência de movimento reduzido desativa o idle e simplifica a sequência. Os scripts clássicos são carregados na ordem `battleAnimations.js` antes de `app.js`.

## Estrutura
- `index.html` — estrutura e componentes da interface.
- `style.css` — identidade visual dark futurista e responsividade.
- `battleAnimations.js` — rig articulado e efeitos de ataque em pixel art.
- `app.js` — integração com API, pesquisa, detalhes e lógica da arena.

Não é necessário instalar dependências ou configurar chave de API.
