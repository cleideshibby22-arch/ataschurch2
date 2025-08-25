export interface Hino {
  numero: number;
  titulo: string;
  categoria: string;
  fonte: 'igreja' | 'lar' | 'personalizado';
}

// Hinos da Igreja de Jesus Cristo dos Santos dos Últimos Dias
const HINOS_IGREJA: Hino[] = [
  // Restauração
  { numero: 1, titulo: "A Alva Rompe", categoria: "Restauração", fonte: "igreja" },
  { numero: 2, titulo: "Tal Como um Facho", categoria: "Restauração", fonte: "igreja" },
  { numero: 3, titulo: "Alegres Cantemos", categoria: "Restauração", fonte: "igreja" },
  { numero: 4, titulo: "No Monte a Bandeira", categoria: "Restauração", fonte: "igreja" },
  { numero: 5, titulo: "Israel, Jesus Te Chama", categoria: "Restauração", fonte: "igreja" },
  { numero: 6, titulo: "Um Anjo Lá do Céu", categoria: "Restauração", fonte: "igreja" },
  { numero: 7, titulo: "O Que Vimos Lá nos Céus", categoria: "Restauração", fonte: "igreja" },
  { numero: 8, titulo: "Oração pelo Profeta", categoria: "Restauração", fonte: "igreja" },
  { numero: 9, titulo: "Graças Damos, Ó Deus, Por um Profeta", categoria: "Restauração", fonte: "igreja" },
  { numero: 10, titulo: "Vinde ao Profeta Escutar", categoria: "Restauração", fonte: "igreja" },
  { numero: 11, titulo: "Abençoa Nosso Profeta", categoria: "Restauração", fonte: "igreja" },
  { numero: 12, titulo: "Que Manhã Maravilhosa!", categoria: "Restauração", fonte: "igreja" },
  { numero: 13, titulo: "Rejubilai-vos, Ó Nações", categoria: "Restauração", fonte: "igreja" },
  { numero: 14, titulo: "Hoje, ao Profeta Louvemos", categoria: "Restauração", fonte: "igreja" },
  { numero: 15, titulo: "Um Pobre e Aflito Viajor", categoria: "Restauração", fonte: "igreja" },
  { numero: 16, titulo: "Ó Montanhas Mil", categoria: "Restauração", fonte: "igreja" },
  { numero: 17, titulo: "Por Teus Dons", categoria: "Restauração", fonte: "igreja" },
  { numero: 18, titulo: "Vede, Ó Santos", categoria: "Restauração", fonte: "igreja" },
  { numero: 19, titulo: "Sereno Finda o Dia", categoria: "Restauração", fonte: "igreja" },
  { numero: 20, titulo: "Vinde, Ó Santos", categoria: "Restauração", fonte: "igreja" },
  { numero: 21, titulo: "Ao Salvador Louvemos", categoria: "Restauração", fonte: "igreja" },
  { numero: 22, titulo: "Em Glória Resplandesce", categoria: "Restauração", fonte: "igreja" },
  { numero: 23, titulo: "Lá nos Cumes", categoria: "Restauração", fonte: "igreja" },
  { numero: 24, titulo: "Vem, Ó Dia Prometido", categoria: "Restauração", fonte: "igreja" },
  { numero: 25, titulo: "Bela Sião", categoria: "Restauração", fonte: "igreja" },
  { numero: 26, titulo: "O Mundo Desperta", categoria: "Restauração", fonte: "igreja" },
  { numero: 27, titulo: "Vinde, Ó Filhos do Senhor", categoria: "Restauração", fonte: "igreja" },
  { numero: 28, titulo: "Ó Vem, Supremo Rei", categoria: "Restauração", fonte: "igreja" },

  // Louvor e Graças
  { numero: 29, titulo: "Ó Criaturas do Senhor", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 30, titulo: "Ó Santos, Que na Terra Habitais", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 31, titulo: "Com Braço Forte", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 32, titulo: "Castelo Forte", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 33, titulo: "Glória a Deus Cantai", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 34, titulo: "Louvai a Deus", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 35, titulo: "A Deus, Senhor e Rei", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 36, titulo: "Deus É Amor", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 37, titulo: "O Senhor Meu Pastor É", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 38, titulo: "Que Toda Honra e Glória", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 39, titulo: "Corações, Pois, Exultai", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 40, titulo: "Jeová, Sê Nosso Guia", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 41, titulo: "Firmes Segui", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 42, titulo: "Que Firme Alicerce", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 43, titulo: "Grandioso És Tu", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 44, titulo: "Jesus, Minha Luz", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 45, titulo: "Ó Vós Que Amais ao Senhor", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 46, titulo: "Nossas Vozes Elevemos", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 47, titulo: "Deus nos Rege com Amor", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 48, titulo: "Ó Pai Bendito", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 49, titulo: "Pela Beleza do Mundo", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 50, titulo: "Cantando Louvamos", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 51, titulo: "Oração de Graças", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 52, titulo: "Vinde, Ó Povos, Graças Dar", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 53, titulo: "Se Tenho Fé", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 54, titulo: "Doce É o Trabalho", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 55, titulo: "Santo! Santo! Santo!", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 56, titulo: "Os Céus Proclamam", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 57, titulo: "Conta as Bênçãos", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 58, titulo: "Ao Deus de Abraão Louvai", categoria: "Louvor e Graças", fonte: "igreja" },
  { numero: 59, titulo: "Louvai o Eterno Criador", categoria: "Louvor e Graças", fonte: "igreja" },

  // Oração e Súplica
  { numero: 60, titulo: "Brilha, Meiga Luz", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 61, titulo: "Careço de Jesus", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 62, titulo: "Mais Perto Quero Estar", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 63, titulo: "Guia-me a Ti", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 64, titulo: "Ó Pai Celeste", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 65, titulo: "Jesus Cristo É Meu Senhor", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 66, titulo: "Creio em Cristo", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 67, titulo: "Vive o Redentor", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 68, titulo: "Vinde a Mim", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 69, titulo: "Vinde a Cristo", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 70, titulo: "Eu Sei Que Vive Meu Senhor", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 71, titulo: "Testemunho", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 72, titulo: "Mestre, o Mar Se Revolta", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 73, titulo: "Onde Encontrar a Paz?", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 74, titulo: "Sê Humilde", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 75, titulo: "Mais Vontade Dá-me", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 76, titulo: "Rocha Eterna", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 77, titulo: "A Luz de Deus", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 78, titulo: "Embora Cheios de Pesar", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 79, titulo: "Ó Doce, Grata Oração", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 80, titulo: "Santo Espírito de Deus", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 81, titulo: "Secreta Oração", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 82, titulo: "Eis-nos Agora Aqui", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 83, titulo: "Com Fervor Fizeste a Prece?", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 84, titulo: "Só por em Ti, Jesus, Pensar", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 85, titulo: "Deus Vos Guarde", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 86, titulo: "Nós Pedimos-te, Senhor", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 87, titulo: "Ó Bondoso Pai Eterno", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 88, titulo: "Dá-nos, Tu, ó Pai Bondoso", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 89, titulo: "Ao Partir Cantemos", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 90, titulo: "Teu Santo Espírito, Senhor", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 91, titulo: "Qual Orvalho Que Cintila", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 92, titulo: "Vai Fugindo o Dia", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 93, titulo: "Suavemente a Noite Cai", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 94, titulo: "Oração para a Noite", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 95, titulo: "Eis-nos, Hoje, a Teus Pés", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 96, titulo: "É Tarde, a Noite Logo Vem", categoria: "Oração e Súplica", fonte: "igreja" },
  { numero: 97, titulo: "Comigo Habita", categoria: "Oração e Súplica", fonte: "igreja" },

  // Hinos Sacramentais
  { numero: 98, titulo: "Ó Deus, Senhor Eterno", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 99, titulo: "Ao Partilhar de Teu Amor", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 100, titulo: "Entoai a Deus Louvor", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 101, titulo: "Deus, Escuta-nos Orar", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 102, titulo: "Nossa Humilde Prece Atende", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 103, titulo: "Enquanto unidos em Amor", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 104, titulo: "Quão Grato É Cantar Louvor", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 105, titulo: "Cantemos Todos a Jesus", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 106, titulo: "Jesus de Nazaré, Mestre e Rei", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 107, titulo: "Deus Tal Amor por Nós Mostrou", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 108, titulo: "Eis-nos à Mesa do Senhor", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 109, titulo: "Em uma Cruz Jesus Morreu", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 110, titulo: "Vede, Morreu o Redentor", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 111, titulo: "Lembrando a Morte de Jesus", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 112, titulo: "Assombro me Causa", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 113, titulo: "No Monte do Calvário", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 114, titulo: "Da Corte Celestial", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 115, titulo: "Tão Humilde ao Nascer", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 116, titulo: "Sobre o Calvário", categoria: "Hinos Sacramentais", fonte: "igreja" },
  { numero: 117, titulo: "Com Irmãos Nós Reunidos", categoria: "Hinos Sacramentais", fonte: "igreja" },

  // Páscoa
  { numero: 118, titulo: "Manhã da Ressurreição", categoria: "Páscoa", fonte: "igreja" },
  { numero: 119, titulo: "Cristo É Já Ressuscitado", categoria: "Páscoa", fonte: "igreja" },
  { numero: 120, titulo: "Cristo Já Ressuscitou", categoria: "Páscoa", fonte: "igreja" },

  // Natal
  { numero: 121, titulo: "Mundo Feliz, Nasceu Jesus", categoria: "Natal", fonte: "igreja" },
  { numero: 122, titulo: "Erguei-vos Cantando", categoria: "Natal", fonte: "igreja" },
  { numero: 123, titulo: "Lá na Judéia, Onde Cristo Nasceu", categoria: "Natal", fonte: "igreja" },
  { numero: 124, titulo: "Anjos Descem a Cantar", categoria: "Natal", fonte: "igreja" },
  { numero: 125, titulo: "Ouvi os Sinos do Natal", categoria: "Natal", fonte: "igreja" },
  { numero: 126, titulo: "Noite Feliz", categoria: "Natal", fonte: "igreja" },
  { numero: 127, titulo: "Jesus num Presépio", categoria: "Natal", fonte: "igreja" },
  { numero: 128, titulo: "Na Bela Noite Se Ouviu", categoria: "Natal", fonte: "igreja" },
  { numero: 129, titulo: "Pequena Vila de Belém", categoria: "Natal", fonte: "igreja" },
  { numero: 130, titulo: "No Céu Desponta Nova Luz", categoria: "Natal", fonte: "igreja" },
  { numero: 131, titulo: "No Dia de Natal", categoria: "Natal", fonte: "igreja" },
  { numero: 132, titulo: "Eis dos Anjos a Harmonia", categoria: "Natal", fonte: "igreja" },
  { numero: 133, titulo: "Quando o Anjo Proclamou", categoria: "Natal", fonte: "igreja" },

  // Temas Especiais
  { numero: 134, titulo: "Sim, Eu Te Seguirei", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 135, titulo: "Eu Devo Partilhar", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 136, titulo: "Neste mundo", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 137, titulo: "Oh! Falemos Palavras Amáveis", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 138, titulo: "Não Deixeis Palavras Duras", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 139, titulo: "Deus É Consolador Sem Par", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 140, titulo: "Ama o Pastor Seu Rebanho", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 141, titulo: "Trabalhemos Hoje", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 142, titulo: "Nossa Lei É Trabalhar", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 143, titulo: "Pai, Inspira-me ao Ensinar", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 144, titulo: "Mãos ao Trabalho", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 145, titulo: "Sempre Que Alguém Nos Faz o Bem", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 146, titulo: "Se a Vida É Penosa", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 147, titulo: "Faze o Bem", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 148, titulo: "Faze o Bem, Escolhendo o Que É Certo", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 149, titulo: "A Alma É Livre", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 150, titulo: "Quem Segue ao Senhor?", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 151, titulo: "Minha Alma Hoje Tem a luz", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 152, titulo: "Prolongue os Bons Momentos", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 153, titulo: "Deixa a Luz do Sol Entrar", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 154, titulo: "Enquanto o Sol Brilha", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 155, titulo: "Luz Espalhai", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 156, titulo: "Agora Não, mas Logo Mais", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 157, titulo: "Amor que Cristo Demonstrou", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 158, titulo: "Tu Jesus, Ó Rocha Eterna", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 159, titulo: "À Glória Nós Iremos", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 160, titulo: "Somos os Soldados", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 161, titulo: "As Hostes do Eterno", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 162, titulo: "Com Valor Marchemos", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 163, titulo: "Ide por Todo o Mundo", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 164, titulo: "De Um a Outro Pólo", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 165, titulo: "Semeando", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 166, titulo: "Chamados a Servir", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 167, titulo: "Aonde Mandares Irei", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 168, titulo: "Povos da Terra, Vinde, Escutai!", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 169, titulo: "Eis os Teus Filhos, Ó Senhor", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 170, titulo: "Avante, ao Mundo Proclamai", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 171, titulo: "A Verdade o Que É?", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 172, titulo: "A Verdade É Nosso Guia", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 173, titulo: "Ao Raiar o Novo Dia", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 174, titulo: "Sê Bem-vindo, Dia Santo", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 175, titulo: "Do Pó Nos Fala uma Voz", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 176, titulo: "Estudando as Escrituras", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 177, titulo: "Ó Meu Pai", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 178, titulo: "Ó Quão Majestosa É a Obra de Deus", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 179, titulo: "Ó Jeová, Senhor do Céu", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 180, titulo: "Já Refulge a Glória Eterna", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 181, titulo: "O Fim Se Aproxima", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 182, titulo: "Juventude da Promessa", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 183, titulo: "Deve Sião Fugir à Luta?", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 184, titulo: "Constantes Qual Firmes Montanhas", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 185, titulo: "Quão Belos São", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 186, titulo: "Levantai-vos, Ide ao Templo", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 187, titulo: "Nós Dedicamos Esta Casa", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 188, titulo: "Com Amor no Lar", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 189, titulo: "Pode o Lar Ser Como o Céu", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 190, titulo: "Os Teus Filhos, Pai Celeste", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 191, titulo: "As Famílias Poderão Ser Eternas", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 192, titulo: "Ó Crianças, Deus Vos Ama", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 193, titulo: "Sou um Filho de Deus", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 194, titulo: "Guarda os Mandamentos", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 195, titulo: "Eu Sei que Deus Vive", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 196, titulo: "Nas Montanhas de Sião", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 197, titulo: "Amai-vos Uns aos Outros", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 198, titulo: "Quando Vejo o Sol Raiar", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 199, titulo: "Faz-me Andar Só na Luz", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 200, titulo: "Irmãs em Sião (Vozes Femininas)", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 201, titulo: "Ó Filhos do Senhor (Vozes Masculinas)", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 202, titulo: "Brilham Raios de Clemência (Vozes Masculinas)", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 203, titulo: "Ó Élderes de Israel", categoria: "Temas Especiais", fonte: "igreja" },
  { numero: 204, titulo: "Ó Vós, Que Sois Chamados", categoria: "Temas Especiais", fonte: "igreja" }
];

// Hinos Para o Lar e para a Igreja
const HINOS_LAR: Hino[] = [
  // Dia do Senhor e dias da semana
  { numero: 1001, titulo: "Ó Senhor de toda bênção", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1002, titulo: "Quando o Salvador voltar", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1003, titulo: "Minha alma tem paz", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1004, titulo: "Quero andar com Cristo", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1005, titulo: "Do passarinho cuida", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1006, titulo: "Pense na canção", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1007, titulo: "Partido o pão", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1008, titulo: "Pão do Céu, Água Viva", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1009, titulo: "Getsêmani", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1010, titulo: "Sublime graça", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1011, titulo: "De mãos dadas em união", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1012, titulo: "A qualquer hora ou lugar", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1013, titulo: "O amor de Deus", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1014, titulo: "O meu Pastor vai me amparar", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1015, titulo: "O profundo amor de Cristo", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1016, titulo: "Olhai as mãos do Redentor", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1017, titulo: "Este é o Cristo", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1018, titulo: "Vem, ó Jesus! Vem!", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1019, titulo: "Desejo me tornar como Cristo", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1020, titulo: "O Salvador ternamente nos chama", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1021, titulo: "Que Cristo me ama eu sei", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1022, titulo: "Fé a cada passo", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1023, titulo: "Firme nas promessas", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1024, titulo: "Tenho fé em Jesus, meu Senhor", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1025, titulo: "Consagro meu coração em retidão", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1026, titulo: "Lugares santos", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1027, titulo: "Ao virmos, hoje, adorar", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1028, titulo: "Tenho uma luz em mim", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1029, titulo: "Muitas bênçãos recebo", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1030, titulo: "Tão perto ao orar", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1031, titulo: "Ó, vinde, ouvi a voz divina", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1032, titulo: "Buscai a Cristo", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1033, titulo: "Oh, que grande alegria é servir", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1034, titulo: "Pioneiros como eu", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1035, titulo: "Neste Dia do Senhor", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1036, titulo: "O Livro de Mórmon vou ler", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1037, titulo: "Vou viver para a Deus servir", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1038, titulo: "O meu Senhor é meu Pastor", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1039, titulo: "Porque", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1040, titulo: "Sua voz a soar", categoria: "Dia do Senhor", fonte: "lar" },
  { numero: 1041, titulo: "Meu coração é Teu, Jesus", categoria: "Dia do Senhor", fonte: "lar" },

  // Páscoa e Natal
  { numero: 1201, titulo: "Eis a Páscoa do Senhor", categoria: "Páscoa e Natal", fonte: "lar" },
  { numero: 1202, titulo: "O menino Jesus nasceu", categoria: "Páscoa e Natal", fonte: "lar" },
  { numero: 1203, titulo: "Quem é o menino?", categoria: "Páscoa e Natal", fonte: "lar" },
  { numero: 1204, titulo: "Estrela brilhante e bela", categoria: "Páscoa e Natal", fonte: "lar" },
  { numero: 1205, titulo: "Na Páscoa do Senhor", categoria: "Páscoa e Natal", fonte: "lar" },
  { numero: 1206, titulo: "Você viu?", categoria: "Páscoa e Natal", fonte: "lar" },
  { numero: 1207, titulo: "Noite de paz", categoria: "Páscoa e Natal", fonte: "lar" }
];

// Combinar todas as listas
export let HINOS: Hino[] = [...HINOS_IGREJA, ...HINOS_LAR];

// Categorias disponíveis
export const CATEGORIAS_HINOS = [
  "Todos",
  "Restauração",
  "Louvor e Graças",
  "Oração e Súplica",
  "Hinos Sacramentais",
  "Páscoa",
  "Natal",
  "Temas Especiais",
  "Dia do Senhor",
  "Páscoa e Natal",
  "Personalizado"
];

// Fontes disponíveis
export const FONTES_HINOS = [
  "Todos",
  "Igreja",
  "Lar",
  "Personalizado"
];

export const getHinosPorCategoria = (categoria: string): Hino[] => {
  if (categoria === "Todos") {
    return HINOS;
  }
  return HINOS.filter(hino => hino.categoria === categoria);
};

export const getHinosPorFonte = (fonte: string): Hino[] => {
  if (fonte === "Todos") {
    return HINOS;
  }
  const fonteMap: { [key: string]: string } = {
    "Igreja": "igreja",
    "Lar": "lar",
    "Personalizado": "personalizado"
  };
  return HINOS.filter(hino => hino.fonte === fonteMap[fonte]);
};

export const buscarHinos = (termo: string): Hino[] => {
  const termoBusca = termo.toLowerCase();
  return HINOS.filter(hino => 
    hino.titulo.toLowerCase().includes(termoBusca) ||
    hino.numero.toString().includes(termoBusca)
  );
};

export const adicionarHino = (hino: Omit<Hino, 'fonte'>): void => {
  // Validar dados do hino
  if (!hino.numero || !hino.titulo || !hino.categoria) {
    throw new Error('Dados do hino são obrigatórios');
  }
  
  // Verificar se já existe
  if (HINOS.find(h => h.numero === hino.numero)) {
    throw new Error('Já existe um hino com este número');
  }
  
  const novoHino: Hino = {
    ...hino,
    fonte: 'personalizado'
  };
  HINOS.push(novoHino);
  
  try {
    // Salvar no localStorage
    const hinosPersonalizados = JSON.parse(localStorage.getItem('hinos-personalizados') || '[]');
    hinosPersonalizados.push(novoHino);
    localStorage.setItem('hinos-personalizados', JSON.stringify(hinosPersonalizados));
  } catch (error) {
    console.error('Erro ao salvar hino personalizado:', error);
  }
};

export const removerHino = (numero: number): void => {
  HINOS = HINOS.filter(hino => hino.numero !== numero);
  
  // Atualizar localStorage
  const hinosPersonalizados = HINOS.filter(hino => hino.fonte === 'personalizado');
  localStorage.setItem('hinos-personalizados', JSON.stringify(hinosPersonalizados));
};

export const carregarHinosPersonalizados = (): void => {
  const hinosPersonalizados = JSON.parse(localStorage.getItem('hinos-personalizados') || '[]');
  
  // Remover hinos personalizados existentes
  HINOS = HINOS.filter(hino => hino.fonte !== 'personalizado');
  
  // Adicionar hinos personalizados carregados
  HINOS.push(...hinosPersonalizados);
};

// Carregar hinos personalizados ao inicializar
carregarHinosPersonalizados();