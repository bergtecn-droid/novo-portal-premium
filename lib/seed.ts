import { DEFAULT_EDITORIAS } from "./settings";
import type { Article } from "./types";

const img = (seed: string, w = 1200, h = 700) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const EDITORIAS: string[] = DEFAULT_EDITORIAS;

export const seedArticles: Article[] = [
  {
    id: "a1",
    slug: "luzes-da-avenida-central-sao-acesas",
    title: "Luzes da Avenida Central são acesas e transformam o centro da cidade",
    subtitle:
      "Nova iluminação em LED reduz consumo em 60% e amplia a segurança nos bairros centrais.",
    editoria: "Cidade",
    tags: ["Iluminação", "Obras", "Centro"],
    author: "Marina Duarte",
    cover: img("nova-avenida", 1600, 900),
    coverCaption: "Avenida Central ganhou 480 novas luminárias em LED",
    blocks: [
      {
        type: "text",
        content:
          "A transformação começou no fim da tarde de sexta-feira, quando os primeiros postes da Avenida Central acenderam com o novo sistema de iluminação em LED. Em cerca de duas horas, mais de 480 pontos de luz passaram a operar em toda a extensão da via, mudando por completo a paisagem do centro da cidade.",
        },
      {
        type: "text",
        content:
          "Segundo a Secretaria de Obras, o projeto reduz o consumo de energia em 60% e amplia a cobertura de iluminação em áreas que ficavam às escuras há anos. Comerciantes já relatam movimento maior no início da noite.",
        },
      {
        type: "image",
        size: "grande",
        media: {
          src: img("nova-poste", 1200, 720),
          captionTop: "Infraestrutura",
          captionBottom:
            "Cada luminária tem sensor automático e vida útil estimada em 12 anos",
        },
      },
      {
        type: "heading",
        content: "Segurança e economia",
      },
      {
        type: "text",
        content:
          "A prefeitura afirma que a nova iluminação também facilita o trabalho das câmeras de monitoramento instaladas nos cruzamentos. O investimento total foi de R$ 3,2 milhões, com contrapartida estadual.",
        },
      {
        type: "quote",
        content:
          "A rua estava apagada há mais de cinco anos. Hoje, à noite, dá vontade de ficar na calçada conversando com o vizinho.",
        author: "Carlos Menezes, comerciante há 22 anos",
      },
      {
        type: "gallery",
        items: [
          {
            src: img("nova-g1", 900, 640),
            captionTop: "Obra concluída",
            captionBottom: "Equipes finalizaram a instalação na madrugada de sábado",
          },
          {
            src: img("nova-g2", 900, 640),
            captionTop: "Comércio",
            captionBottom: "Restaurantes e bares do centro já sentem movimento maior",
          },
          {
            src: img("nova-g3", 900, 640),
            captionTop: "Detalhe",
            captionBottom: "Luminárias em LED trocam as antigas lâmpadas de vapor",
          },
          {
            src: img("nova-g4", 900, 640),
            captionTop: "Panorama",
            captionBottom: "Vista da Avenida Central pouco depois do acendimento",
          },
        ],
      },
      {
        type: "text",
        content:
          "A próxima etapa do programa alcança os bairros São Judas e Boa Vista, com previsão de conclusão para dezembro. A prefeitura abre consultoria pública para priorizar mais trechos.",
      },
    ],
    publishedAt: "2025-09-20T09:00:00.000Z",
    status: "publicado",
    views: 0,
    featured: true,
  },
  {
    id: "a2",
    slug: "time-da-cidade-classifica-a-final",
    title: "Time da cidade vence de virada e garante vaga na final do estadual",
    subtitle:
      "Gol nos acréscimos do segundo tempo encerra jejum de 14 anos sem finais.",
    editoria: "Esportes",
    tags: ["Futebol", "Estadual", "Virada"],
    author: "Rafael Costa",
    cover: img("nova-time", 1600, 900),
    coverCaption: "Jogadores comemoram a vaga na final do campeonato estadual",
    blocks: [
      {
        type: "text",
        content:
          "Parecia derrota garantida. O time saía perdendo por 2 a 0 até os 60 minutos, e o Estádio Municipal convivia com o silêncio. Quando o técnico mudou o time e pôs três atacantes em campo, a história começou a virar.",
        },
      {
        type: "text",
        content:
          "Dois gols em cinco minutos empataram a partida, e aos 47 do segundo tempo, o meia Marquinhos recebeu na entrada da área e acertou o canto esquerdo do goleiro adversário: 3 a 2 e classificação garantida.",
      },
      {
        type: "video",
        media: {
          youtubeId: "y6120QOlsfU",
          captionTop: "O gol da classificação",
          captionBottom: "Melhores momentos da virada histórica do time da cidade",
        },
      },
      {
        type: "text",
        content:
          "É a primeira final estadual do clube em 14 anos. O jogo decisivo acontece no próximo domingo, fora de casa, e a diretoria estima cerca de 15 mil torcedores viajando.",
      },
      {
        type: "image",
        size: "medio",
        media: {
          src: img("nova-torcida", 1000, 700),
          captionTop: "O resultado",
          captionBottom: "Torcida invade o gramado após o apito final",
        },
      },
    ],
    publishedAt: "2025-09-19T22:30:00.000Z",
    status: "publicado",
    views: 0,
    featured: true,
  },
  {
    id: "a3",
    slug: "feira-de-tecnologia-hoje-no-parque",
    title: "Feira de Tecnologia volta ao Parque de Exposições com entrada gratuita",
    subtitle:
      "Mais de 90 expositores, palestras e o primeiro hackathon aberto da região.",
    editoria: "Tecnologia",
    tags: ["Inovação", "Feira", "Startups"],
    author: "Camila Serra",
    cover: img("nova-feira", 1200, 720),
    coverCaption: "Última edição da feira reuniu mais de 12 mil visitantes",
    blocks: [
      {
        type: "text",
        content:
          "De estandes de segurança digital a um espaço de domótica montado por estudantes do ensino médio, a Feira de Tecnologia volta maior. A organização espera 15 mil visitantes ao longo do fim de semana.",
      },
      {
        type: "text",
        content:
          "O evento conta com a primeira edição do hackathon aberto da região, com R$ 20 mil em prêmios e vagas de estágio para os melhores times.",
      },
      {
        type: "image",
        size: "grande",
        media: {
          src: img("nova-feira2", 1200, 720),
          captionTop: "Programação",
          captionBottom: "Palestras acontecem em três palcos simultâneos",
        },
      },
      {
        type: "text",
        content:
          "As entradas são gratuitas mediante credenciamento pelo site oficial do evento, aberto até sábado. Confira a programação completa no portal.",
      },
    ],
    publishedAt: "2025-09-19T14:00:00.000Z",
    status: "publicado",
    views: 0,
    featured: true,
  },
  {
    id: "a4",
    slug: "carnaval-fora-de-tempo-recebe-aprovacao",
    title: "Carnaval fora de tempo é aprovado pela câmara e deve ocorrer em novembro",
    subtitle:
      "Projeto do vereador J. Andrade foi aprovado por 8 votos a 1 e segue para sanção.",
    editoria: "Política",
    tags: ["Câmara", "Cultura", "Carnaval"],
    author: "Marina Duarte",
    cover: img("nova-camara", 1200, 720),
    coverCaption: "Sessão da câmara aprovou o projeto do carnaval fora de tempo",
    blocks: [
      {
        type: "text",
        content:
          "A câmara municipal aprovou na noite desta quinta o projeto que institui o Carnaval fora de tempo, previsto para o segundo fim de semana de novembro na orla da cidade.",
      },
      {
        type: "text",
        content:
          "O texto garante linha de crédito para blocos comunitários e isenção de licença sonora para as três noites de festa.",
      },
      {
        type: "image",
        size: "medio",
        media: {
          src: img("nova-bloco", 1000, 700),
          captionTop: "O resultado",
          captionBottom: "Votação terminou em 8 votos favoráveis e 1 contra",
        },
      },
    ],
    publishedAt: "2025-09-18T20:10:00.000Z",
    status: "publicado",
    views: 0,
  },
  {
    id: "a5",
    slug: "lotes-do-mais-oeste-recebem-agua-encanada",
    title: "Lotes do mais oeste recebem água encanada pela primeira vez",
    subtitle: "A obra atendeu 1,2 mil famílias que dependiam de poços artesianos.",
    editoria: "Cidade",
    tags: ["Saneamento", "Bairros"],
    author: "Paulo Lemos",
    cover: img("nova-agua", 1200, 720),
    coverCaption: "Moradores comemoram a chegada do encanamento no bairro",
    blocks: [
      {
        type: "text",
        content:
          "O projeto de saneamento levou 18 meses para ficar pronto e inclui 14 quilômetros de rede nova, além de três estações de bombeamento de abastecimento.",
      },
      {
        type: "text",
        content:
          "A companhia de água afirma que a próxima fase conecta o distrito de Montes Claros até dezembro, beneficiando mais 800 famílias.",
      },
      {
        type: "gallery",
        items: [
          {
            src: img("nova-a-g1", 900, 640),
            captionTop: "O resultado",
            captionBottom: "Primeira torneira aberta na casa de Dona Lurdes",
          },
          {
            src: img("nova-a-g2", 900, 640),
            captionTop: "O resultado",
            captionBottom: "Rede tem 14 quilômetros de extensão",
          },
        ],
      },
    ],
    publishedAt: "2025-09-18T11:00:00.000Z",
    status: "publicado",
    views: 0,
  },
  {
    id: "a6",
    slug: "litoral-tem-fim-de-semana-de-sol",
    title: "Litoral tem fim de semana de sol e temporada recorde de Visitantes",
    subtitle:
      "Prefeituras preparam reforço no transporte e nas equipes de salvamento.",
    editoria: "Cidade",
    tags: ["Litoral", "Turismo", "Verão"],
    author: "Camila Serra",
    cover: img("nova-litoral", 1200, 720),
    coverCaption: "Orla movimentada no começo da temporada",
    blocks: [
      {
        type: "text",
        content:
          "A previsão do tempo aponta sol forte e mar calmo até domingo. A expectativa é de mais de 200 mil visitantes na região.",
      },
      {
        type: "text",
        content:
          "Três bairros ganham linhas extras de ônibus, e o posto de plantão turístico funciona das 8h às 22h.",
      },
    ],
    publishedAt: "2025-09-17T08:30:00.000Z",
    status: "publicado",
    views: 0,
  },
  {
    id: "a7",
    slug: "lotes-do-mais-oeste-agenda-cultural",
    title: "Agenda cultural da semana tem teatro, jazz e cinema ao ar livre",
    subtitle: "Doze atrações gratuitas espalhadas por praças e centros culturais.",
    editoria: "Entretenimento",
    tags: ["Cultura", "Agenda"],
    author: "Redação Portal Nova",
    cover: img("nova-cultura", 1200, 720),
    coverCaption: "Apresentação na praça central durante edição anterior",
    blocks: [
      {
        type: "text",
        content:
          "A agenda abre na quinta com a peça 'Fita Branca', às 20h, no Teatro Vitória. Já no sábado, tem big band de jazz na Praça dos Ipês.",
      },
      {
        type: "text",
        content:
          "Já o cinema ao ar livre exibe clássicos brasileiros nas terças e quintas, sempre às 19h, com pipoca gratuita.",
      },
    ],
    publishedAt: "2025-09-16T09:15:00.000Z",
    status: "publicado",
    views: 0,
  },
  {
    id: "a8",
    slug: "lotes-economia-ganha-hub-de-empresas",
    title: "Economia da região ganha hub de empresas com 400 vagas de emprego",
    subtitle:
      "Espaço concentrará startups, agências e indústrias de pequeno porte.",
    editoria: "Economia",
    tags: ["Emprego", "Negócios"],
    author: "Paulo Lemos",
    cover: img("nova-hub", 1200, 720),
    coverCaption: "Sede do novo hub em fase final de acabamento",
    blocks: [
      {
        type: "text",
        content:
          "O hub ocupa um antigo galpão de 4 mil m² reformado, com coworking, laboratório e auditório para 220 pessoas.",
      },
      {
        type: "text",
        content:
          "As vagas vão de atendente a desenvolvedor de software, e os cadastros abrem na segunda-feira pelo site da prefeitura.",
      },
    ],
    publishedAt: "2025-09-15T10:00:00.000Z",
    status: "revisao",
    views: 0,
  },
  {
    id: "a9",
    slug: "lotes-saude-municipio-expande-vacinacao",
    title: "Município expande vacinação para bairros distantes com unidades móveis",
    subtitle: "Duas vans equipadas vão percorrer 14 bairros até o fim do mês.",
    editoria: "Saúde",
    tags: ["Vacinação", "Saúde pública"],
    author: "Marina Duarte",
    cover: img("nova-saude", 1200, 720),
    coverCaption: "Unidade móvel preparada para atendimento nos bairros",
    blocks: [
      {
        type: "text",
        content:
          "A campanha foca em idosos e crianças com carteirinha de vacinação atrasada. As vans contam com sala de espera climatizada.",
      },
    ],
    publishedAt: "2025-09-14T09:00:00.000Z",
    status: "rascunho",
    views: 0,
  },
];
