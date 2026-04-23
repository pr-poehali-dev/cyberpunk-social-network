INSERT INTO t_p9483625_cyberpunk_social_net.users (name, handle, avatar_url, bio, status, posts_count, followers_count, following_count, rating, tags)
VALUES
  ('NEXUS_X77', '@nexus_x77', 'https://cdn.poehali.dev/projects/e3101b69-ea70-472c-90da-0df04c7ea68d/files/968dcd57-0329-4e54-8130-bca43699052e.jpg',
   'Хакер. Нейронавт. Исследователь цифровой пустоши. Взламываю корпоративные узлы ради свободы данных.', 'online', 342, 12400, 891, 99.2,
   ARRAY['NETRUNNER LVL.77','CORPO ENEMY','DATA FREE','GHOST PROTOCOL']),
  ('V0ID_RUNNER', '@void_runner', 'https://cdn.poehali.dev/projects/e3101b69-ea70-472c-90da-0df04c7ea68d/files/968dcd57-0329-4e54-8130-bca43699052e.jpg',
   'Призрак в сети. Никаких следов.', 'ghost', 87, 4200, 312, 88.5, ARRAY['GHOST','STEALTH']),
  ('AURORA_9', '@aurora_9', 'https://cdn.poehali.dev/projects/e3101b69-ea70-472c-90da-0df04c7ea68d/files/968dcd57-0329-4e54-8130-bca43699052e.jpg',
   'Хрупкий свет в тёмной сети.', 'online', 215, 7800, 560, 94.1, ARRAY['AURORA','LIGHT']);

INSERT INTO t_p9483625_cyberpunk_social_net.posts (user_id, content, image_url, tags, likes_count, comments_count, reposts_count)
VALUES
  (1, 'Взломал матрицу корпоративного протокола. Данные в свободном доступе. Система не знает, что мы уже внутри. #NEXUS #HACK',
   'https://cdn.poehali.dev/projects/e3101b69-ea70-472c-90da-0df04c7ea68d/files/c698a86e-c01e-490e-9dcf-2a8cbd2120b8.jpg',
   ARRAY['#NEXUS','#HACK'], 342, 2, 124),
  (2, 'Новый имплант нейроинтерфейса. Задержка 0.003мс. Реальность стала расширением кода. Ощущения не поддаются описанию.',
   NULL, ARRAY['#AUGMENT','#NEURO'], 218, 1, 73),
  (3, 'Слои голограмм над городом сегодня особенно красивы. Реклама Arasaka перекрывает закат. Уродство и красота одновременно.',
   'https://cdn.poehali.dev/projects/e3101b69-ea70-472c-90da-0df04c7ea68d/files/c698a86e-c01e-490e-9dcf-2a8cbd2120b8.jpg',
   ARRAY['#CITY','#HOLO'], 509, 0, 234);

INSERT INTO t_p9483625_cyberpunk_social_net.comments (post_id, user_id, text)
VALUES
  (1, 2, 'Красиво. Чисто. Ни следа.'),
  (1, 3, 'Ты легенда, NEXUS. Ждём координаты.'),
  (2, 1, 'Какой производитель? Icebreaker или PsyTech?');