insert into public.question (id, thematique_id, ordonnancement, types_collectivites_concernees, type, description, formulation)
values  ('dechets_1', 'dechets', null, null, 'binaire', '', 'La collectivité a-t-elle la compétence collecte des déchets ?'),
        ('dechets_2', 'dechets', null, null, 'binaire', '', 'La collectivité a-t-elle la compétence traitement des déchets ?'),
        ('dechets_3', 'dechets', null, null, 'binaire', '', 'La collectivité est-elle chargée de la réalisation d''un "Programme local de prévention des déchets ménagers et assimilés" (PLPDMA) du fait de sa compétence collecte et/ou par délégation d''une autre collectivité ?'),
        ('REOM', 'dechets', null, null, 'binaire', '', 'La collectivité a-t-elle mise en place la redevance d’enlèvement des ordures ménagères (REOM) ?'),
        ('dechets_4', 'dechets', null, '{EPCI}', 'proportion', '', 'Si la collectivité a transféré le traitement des déchets à un syndicat compétent en la matière, quelle est la part de la collectivité dans ce syndicat ?'),
        ('dev_eco_1', 'developpement_economique', null, null, 'binaire', '<p>Il s''agit de la compétence &quot;Développement et aménagement économique&quot;.</p>
', 'La collectivité a-t-elle la compétence développement économique ?'),
        ('dev_eco_2', 'developpement_economique', null, null, 'proportion', '<p>La part se rapporte au nombre d''habitants (nombre d''habitants de la collectivité / nombre d''habitants de la structure compétente) ou au pouvoir de la collectivité dans la structure compétente (nombre de voix d''élu de la collectivité / nombre de voix total dans l''organe délibératoire de la structure compétente) si cette part est supérieure à celle liée au nombre d''habitants.</p>
', 'Quelle est la part de la collectivité dans la structure compétente en matière de développement économique ?'),
        ('dev_eco_3', 'developpement_economique', null, null, 'binaire', '', 'La collectivité se préoccupe-t-elle de la publicité extérieure et des enseignes ?'),
        ('dev_eco_4', 'developpement_economique', null, null, 'binaire', '', 'Le territoire de la collectivité dispose-t-il d''un tissu économique propice à l’émergence de projets d’écologie industrielle ?'),
        ('eau_1', 'eau_assainissement', null, null, 'binaire', '', 'La collectivité a-t-elle la compétence "Traitement, adduction et distribution de l''eau" ?'),
        ('assainissement_1', 'eau_assainissement', null, null, 'binaire', '', 'La collectivité a-t-elle la compétence "assainissement collectif" ?'),
        ('assainissement_2', 'eau_assainissement', null, null, 'binaire', '', 'La collectivité a-t-elle la compétence "assainissement non collectif" ?'),
        ('assainissement_3', 'eau_assainissement', null, '{EPCI}', 'proportion', '<p>La part se rapporte au nombre d''habitants (nombre d''habitants de la collectivité / nombre d''habitants de la structure compétente) ou au pouvoir de la collectivité dans la structure compétente (nombre de voix d''élu de la collectivité / nombre de voix total dans l''organe délibératoire de la structure compétente) si cette part est supérieure à celle liée au nombre d''habitants.</p>
', 'En cas de compétence partagée ou variable sur le territoire pour la compétence assainissement, quelle est la part des communes ayant délégué leur compétence assainissement ?'),
        ('assainissement_4', 'eau_assainissement', null, null, 'binaire', '', 'Existe-t-il un potentiel de valorisation énergétique (méthanisation ou récupération de chaleur) attesté par une étude portant sur la totalité du périmètre d’assainissement ?'),
        ('EP_1', 'energie', null, null, 'choix', '', 'La collectivité a-t-elle la compétence "éclairage public" ?'),
        ('EP_2', 'energie', null, null, 'proportion', '<p>La part se rapporte au nombre d''habitants (nombre d''habitants de la collectivité / nombre d''habitants de la structure compétente) ou au pouvoir de la collectivité dans la structure compétente (nombre de voix d''élu de la collectivité / nombre de voix total dans l''organe délibératoire de la structure compétente) si cette part est supérieure à celle liée au nombre d''habitants.</p>
', 'Quelle est la part de la collectivité dans la structure compétente en matière d''éclairage public ?'),
        ('AOD_elec', 'energie', null, null, 'binaire', '', 'La collectivité est-elle autorité organisatrice de la distribution (AOD) pour l''électricité ?'),
        ('AOD_gaz', 'energie', null, null, 'binaire', '', 'La collectivité est-elle autorité organisatrice de la distribution (AOD) pour le gaz ?'),
        ('AOD_chaleur', 'energie', null, null, 'binaire', '', 'La collectivité est-elle autorité organisatrice de la distribution (AOD) pour la chaleur ?'),
        ('fournisseur_energie', 'energie', null, null, 'binaire', '', 'Existe-t-il des fournisseurs d’énergie maîtrisés par la collectivité (Société d''économie mixte (SEM) ou régie ou exploitants de réseau de chaleur urbain liés à la collectivité par délégation de service public) ?'),
        ('recuperation_cogeneration', 'energie', null, null, 'binaire', '', 'Existe-t-il des activités industrielles, en nombre assez important, adaptées pour la récupération de chaleur fatale ou du potentiel pour la cogénération voir la micro-cogénération (soit des chaufferies ou des consommateurs suffisants en chaleur ou des producteurs-consommateurs visant l’autoconsommation) ?'),
        ('SPASER', 'identite', null, null, 'binaire', '<p>Les SPASER concernent les collectivités ayant un montant total annuel des achats supérieur à 100 millions d’euros hors-taxes.</p>
<p>L’article D. 2111-3 du code de la commande publique précise les contrats à prendre en compte afin de déterminer le montant total annuel des achats et en déduire l’obligation d’établir un schéma de promotion des achats publics socialement et écologiquement responsables.</p>
<p>Sont ainsi concernés les marchés publics conclus en application du code de la commande publique qu’il s’agisse de marchés ou de marchés de partenariat.</p>
<p>Seuls les contrats conclus doivent être pris en compte, c''est-à-dire ceux dont la signature est intervenue au cours de l’année civile de référence. Pour les accords-cadres (à bons de commandes ou à marchés subséquents), c’est le montant des bons de commande émis et des marchés subséquents conclus sur l’année qui doit être pris en compte.</p>
', 'Le montant annuel des achats publics de la collectivité est-il inférieur à 100 000 000 € hors-taxes ?'),
        ('formation', 'identite', null, null, 'binaire', '', 'Existe-t-il des établissements de formation initiale et continue sur le territoire ?'),
        ('scolaire_1', 'identite', null, null, 'binaire', '', 'La collectivité est-elle en charge des équipements de l''enseignement pré-élementaire et élémentaire et/ou des activités périscolaires ?'),
        ('scolaire_2', 'identite', null, null, 'binaire', '', 'Des établissements scolaires et/ou des structure d’accueil de jeunes enfants sont-ils présents sur le territoire ?'),
        ('SAU', 'identite', null, null, 'binaire', '', 'La collectivité possède-t''elle moins de 3 % de surfaces agricoles ?'),
        ('foret', 'identite', null, null, 'binaire', '', 'La collectivité possède-t''elle moins de 10 % de surfaces forestières (publiques ou privées) ?'),
        ('centre_polarite', 'identite', null, null, 'binaire', '', 'La collectivité possède-t-elle des centres-bourgs (dans le cas d''une commune) ou des communes (dans le cas d''un EPCI) de plus de 2 000 habitants ?'),
        ('AOM_1', 'mobilite', null, null, 'binaire', '', 'La collectivité est-elle autorité organisatrice de la mobilité (AOM) ?'),
        ('AOM_2', 'mobilite', null, null, 'proportion', '<p>La part se rapporte au nombre d''habitants (nombre d''habitants de la collectivité / nombre d''habitants de la structure compétente) ou au pouvoir de la collectivité dans la structure compétente (nombre de voix d''élu de la collectivité / nombre de voix total dans l''organe délibératoire de la structure compétente) si cette part est supérieure à celle liée au nombre d''habitants.</p>
', 'Quelle est la part de la collectivité autorité organisatrice de la mobilité (AOM) ?'),
        ('voirie_1', 'mobilite', null, null, 'choix', '', 'La collectivité a-t-elle la compétence voirie ?'),
        ('voirie_2', 'mobilite', null, '{commune}', 'proportion', '', 'Si la commune a transféré la compétence voirie (création, aménagement, entretien) et stationnement à l''EPCI, quelle est la part de la commune dans l''EPCI ?'),
        ('TC_1', 'mobilite', null, null, 'binaire', '', 'Les locaux de la collectivité sont-ils desservis ou desservables par les transports en commun ?'),
        ('vehiculeCT_1', 'mobilite', null, null, 'binaire', '', 'La collectivité dispose-t-elle de véhicules ?'),
        ('pouvoir_police', 'mobilite', null, null, 'binaire', '', 'la collectivité dispose-t-elle des compétences en matière de circulation/gestion du trafic (pouvoir de police) ?'),
        ('trafic', 'mobilite', null, null, 'binaire', '', 'Existe-t-il un potentiel d''action ou des problèmes liés à la limitation et réduction du trafic et de la vitesse sur les axes principaux ou dans certaines zones ?'),
        ('cyclable', 'mobilite', null, null, 'binaire', '', 'La collectivité dispose t''elle de compétences en matière de politique cyclable (AOM ou compétente en matière d’infrastructures vélos, de stationnement vélos, de services associés aux vélos) ?'),
        ('versement_mobilite', 'mobilite', null, null, 'binaire', '', 'La collectivité est-elle concernée par le versement mobilité ?'),
        ('tourisme_1', 'tourisme', null, '{commune}', 'proportion', '<p>La part se rapporte au nombre d''habitants (nombre d''habitants de la collectivité / nombre d''habitants de la structure compétente) ou au pouvoir de la collectivité dans la structure compétente (nombre de voix d''élu de la collectivité / nombre de voix total dans l''organe délibératoire de la structure compétente) si cette part est supérieure à celle liée au nombre d''habitants.</p>
', 'Quelle est la part de la collectivité dans la structure compétente en matière de tourisme ?'),
        ('tourisme_2', 'tourisme', null, '{EPCI}', 'binaire', '', 'Le territoire est-il touristique (doté d''un office de tourisme, d''un syndicat d''initiative, d''un bureau d''information touristique) ?'),
        ('ECS', 'ultramarin', null, null, 'binaire', '', 'La collectivité a-t-elle des besoins en eau chaude sanitaire ?'),
        ('amenagement_1', 'urbanisme_habitat', null, null, 'binaire', '', 'La collectivité (y compris tous les organismes liés) possède-t-elle des terrains utilisables ou vendables (depuis au plus 10 ans) ?'),
        ('amenagement_2', 'urbanisme_habitat', null, null, 'binaire', '', 'La collectivité a-t-elle conclu des ventes ou des contrats d''utilisation (comme des contrats de construction) sur les 10 dernières années ?'),
        ('urba_1', 'urbanisme_habitat', null, null, 'binaire', '', 'La collectivité a-t-elle la compétence "élaboration du Plan Local d''Urbanisme" (PLU) ?'),
        ('SCoT', 'urbanisme_habitat', null, null, 'binaire', '<p>Il s''agit de la compétence Banatic 4505</p>
', 'La collectivité a-t-elle la compétence "Schéma de Cohérence Territoriale" (SCoT) ?'),
        ('urba_2', 'urbanisme_habitat', null, null, 'binaire', '', 'La collectivité a-t-elle la compétence d''instruction des permis de construire ?'),
        ('urba_3', 'urbanisme_habitat', null, null, 'binaire', '<p>Il s''agit de la compétence Banatic 4560</p>
', 'La collectivité a-t-elle la compétence d''octroi des permis de construire ?'),
        ('habitat_1', 'urbanisme_habitat', null, null, 'binaire', '<p>Il s''agit des compétences liées à l''habitat et au logement</p>
', 'La collectivité a-t-elle la compétence habitat ?'),
        ('habitat_2', 'urbanisme_habitat', null, '{commune}', 'proportion', '<p>La part se rapporte au nombre d''habitants (nombre d''habitants de la collectivité / nombre d''habitants de la structure compétente) ou au pouvoir de la collectivité dans la structure compétente (nombre de voix d''élu de la collectivité / nombre de voix total dans l''organe délibératoire de la structure compétente) si cette part est supérieure à celle liée au nombre d''habitants.</p>
', 'Quelle est la part de la collectivité dans la structure compétente en matière de logement et d''habitat ?'),
        ('habitat_3', 'urbanisme_habitat', null, '{commune}', 'binaire', '', 'La collectivité participe-t-elle au conseil d''administration d''un bailleur social ?');