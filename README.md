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
- Sequência de avanço, projétil/efeito, impacto e dissipação; HP/status são atualizados no callback de impacto.
- Sprites animados de batalha da PokeAPI quando disponíveis; ilustração oficial como alternativa.
- Animações SpriteCollab de repouso e de fim de batalha quando há créditos e licença identificáveis; o sprite-base não é trocado durante os ataques.
- Animações de repouso variadas por tipo, entrada, preparação, avanço, impacto, vitória e desmaio como alternativas para espécies sem sprites de ação disponíveis.
- Coordenadas dos efeitos calculadas pelos limites visuais dos combatentes, com reação do alvo e tremor da arena.
- Efeitos sincronizados com o dano e o HP; os comandos ficam bloqueados durante cada ação.
- Indicadores de status, barras de HP, log, resultado e reinício da batalha.
- Estados de carregamento, erro e ausência de resultados na Pokédex.

## Observações sobre a batalha
A arena é uma simulação didática própria, não uma reprodução integral das regras oficiais dos jogos. Usa movimentos e atributos da API e uma tabela de efetividade elemental. Efeitos, probabilidades e cálculo de dano foram simplificados para manter o combate rápido.

Sprites animados usam a geração V (Black/White) fornecida pela PokéAPI e podem ter aparência pixelada. Quando a espécie não possui uma animação compatível, a arena usa a arte oficial com animações CSS. `battleAnimations.js` fornece efeitos pixelados no canvas por tipo de movimento; eles são efeitos visuais genéricos, não animações oficiais específicas de cada golpe. A preferência de movimento reduzido do sistema operacional desativa a sequência visual, mas mantém a aplicação do golpe e o combate. O script clássico é carregado antes de `app.js`.

### Sprites corporais SpriteCollab

Para Charizard (#0006), Lucario (#0448) e Greninja (#0658), a arena pode buscar `AnimData.xml` e spritesheets na revisão fixada do [PMDCollab/SpriteCollab](https://github.com/PMDCollab/SpriteCollab/tree/0babe7c2aeb7c494e420fca1964af8db78015205). Os quadros são exibidos em canvas e usados nas animações de repouso e de fim de batalha. Os clips fornecidos pelos artistas são reutilizáveis, não animações desenhadas individualmente para cada golpe. Durante os ataques, o app mantém o sprite-base visível e anima seu avanço/recuo com os efeitos do `BattleAnimator`; isso evita que pose e escala mudem para um desenho diferente no meio da ação.

PhiBras é o único autor do projeto. Os nomes abaixo são atribuições dos artistas dos sprites exigidas pelas respectivas licenças, não coautores da aplicação. Créditos e licenças também são mostrados junto a cada combatente:

- Charizard: Emboarger; ações permitidas pelo perfil `PMDCollab_1`.
- Lucario: Emmuffin e Soulja; `CC BY-NC 4.0`.
- Greninja: JHONY_REX e ◥θ┴θ◤; `CC BY-NC 4.0`.

Os sprites CC BY-NC exigem atribuição e permitem apenas uso não comercial sob os termos da [licença](https://creativecommons.org/licenses/by-nc/4.0/). O projeto está sendo usado sem fins comerciais. Verifique os créditos e os termos vinculados na interface antes de redistribuir ou reutilizar qualquer arte; os arquivos não são incorporados ao projeto. Pikachu (#0025), Gengar (#0094) e outras espécies sem permissão/ação verificada não carregam essas spritesheets e usam o fallback da arena.

As animações de ação dependem de conexão com o GitHub. Se os arquivos não carregarem, a interface informa a indisponibilidade e o combate continua com os efeitos e animações de fallback. A preferência `prefers-reduced-motion` também desativa a reprodução dos quadros corporais.

## Estrutura
- `index.html` — estrutura e componentes da interface.
- `style.css` — identidade visual dark futurista e responsividade.
- `battleAnimations.js` — efeitos de ataque em pixel art e reação ao impacto.
- `app.js` — integração com API, pesquisa, detalhes e lógica da arena.

Não é necessário instalar dependências ou configurar chave de API.
