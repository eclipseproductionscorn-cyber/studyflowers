WITH new_trails AS (
  INSERT INTO public.study_trails (title, description, objective, icon, color, total_phases, difficulty, subjects, is_published)
  SELECT v.title, v.description, v.objective, v.icon, v.color, 5, v.difficulty, v.subjects, true
  FROM (VALUES
    ('Inglês em Contexto', 'Do vocabulário cotidiano à leitura de pequenos textos.', 'Comunicar ideias com clareza', '✒️', '#70513b', 'easy', ARRAY['Inglês']),
    ('Oficina de Escrita', 'Observe, planeje, escreva e revise suas próprias histórias.', 'Escrever e revisar textos', '📝', '#70513b', 'medium', ARRAY['Português', 'Redação']),
    ('Astronomia & Universo', 'Uma viagem do céu noturno ao Sistema Solar e além.', 'Investigar o cosmos', '✧', '#70513b', 'medium', ARRAY['Ciências', 'Geografia'])
  ) AS v(title, description, objective, icon, color, difficulty, subjects)
  WHERE NOT EXISTS (SELECT 1 FROM public.study_trails t WHERE t.title = v.title)
  RETURNING id, title
)
INSERT INTO public.trail_phases (trail_id, phase_number, title, description, phase_type, xp_reward, coin_reward)
SELECT n.id, p.phase_number, p.title, p.description, p.phase_type, 30, 15
FROM new_trails n
JOIN (VALUES
  ('Inglês em Contexto', 1, 'Palavras do dia a dia', 'Reconheça objetos, lugares e ações comuns.', 'lesson'),
  ('Inglês em Contexto', 2, 'Frases que fazem sentido', 'Monte frases afirmativas e perguntas simples.', 'quiz'),
  ('Inglês em Contexto', 3, 'Leia e descubra', 'Encontre ideias principais em um texto curto.', 'lesson'),
  ('Inglês em Contexto', 4, 'Revisão de vocabulário', 'Recupere palavras aprendidas sem consultar anotações.', 'review'),
  ('Inglês em Contexto', 5, 'Desafio de interpretação', 'Use contexto e vocabulário para interpretar uma passagem.', 'challenge'),
  ('Oficina de Escrita', 1, 'Observe a cena', 'Descreva um lugar com detalhes sensoriais.', 'lesson'),
  ('Oficina de Escrita', 2, 'Personagens e motivos', 'Crie um personagem com um objetivo claro.', 'quiz'),
  ('Oficina de Escrita', 3, 'Começo, meio e fim', 'Organize acontecimentos em uma sequência coerente.', 'lesson'),
  ('Oficina de Escrita', 4, 'Reescreva melhor', 'Revise clareza, pontuação e escolha de palavras.', 'review'),
  ('Oficina de Escrita', 5, 'Sua própria história', 'Escreva uma narrativa curta e releia com olhar crítico.', 'challenge'),
  ('Astronomia & Universo', 1, 'O céu da Terra', 'Observe ciclos do dia, da noite e das estações.', 'lesson'),
  ('Astronomia & Universo', 2, 'Nosso Sistema Solar', 'Relacione planetas, órbitas e a estrela central.', 'quiz'),
  ('Astronomia & Universo', 3, 'Lua e eclipses', 'Explique as fases da Lua e como ocorrem eclipses.', 'lesson'),
  ('Astronomia & Universo', 4, 'Revisão espacial', 'Relembre conceitos essenciais do céu e do espaço.', 'review'),
  ('Astronomia & Universo', 5, 'Missão: explique o universo', 'Conecte suas descobertas em uma explicação própria.', 'challenge')
) AS p(trail_title, phase_number, title, description, phase_type) ON p.trail_title = n.title;