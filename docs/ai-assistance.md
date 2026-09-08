# Assistance IA du HCBE

Le lot IA comporte quatre capacités derrière des indicateurs de fonctionnalité : assistant public bilingue, copilote éditorial, extraction d’événements et recommandation d’acheminement des demandes de service.

## Principes de fonctionnement

- L’assistant public répond uniquement à partir des services, documents, événements, annonces, associations et contenus CMS publiés dans l’application. Un catalogue bilingue limité des capacités officielles de la plateforme couvre les questions générales lorsque la base ne contient pas encore de contenu. Chaque réponse renvoie vers ses sources HCBE.
- Les outils administratifs produisent uniquement des brouillons ou recommandations. Une personne doit confirmer toute modification ou publication.
- Le contenu fourni au modèle est considéré comme non fiable : les instructions trouvées dans une affiche, un document ou une demande ne sont jamais exécutées.
- Les requêtes sont envoyées avec `store: false`. Les journaux internes conservent uniquement le type d’action, la longueur d’entrée, les sources ou entités utilisées et le niveau de confiance; ils ne conservent ni le texte saisi ni la réponse du modèle.
- Les utilisateurs doivent accepter l’avis de confidentialité et sont invités à retirer les renseignements sensibles.
- L’assistant ne remplace pas un avis juridique, médical, financier ou d’immigration et dirige vers une personne compétente lorsque nécessaire.

## Configuration

Configurer ces variables dans chacun des services API Railway, séparément pour staging et production :

```text
Ai__Enabled=true
Ai__Provider=OpenAI
Ai__ApiKey=<clé secrète propre à l’environnement>
Ai__Model=gpt-5.6-luna
Ai__TimeoutSeconds=45
Ai__MaxOutputTokens=1800
Ai__Features__Assistant=true
Ai__Features__WritingCopilot=true
Ai__Features__EventExtraction=true
Ai__Features__ServiceRouting=true
```

Ne jamais ajouter la clé dans Git, les journaux ou l’interface. Utiliser deux projets/clefs séparés, appliquer des plafonds de dépenses et effectuer une rotation immédiate si une clé est exposée. Tant que `Ai__Enabled` est faux ou que la clé est absente, les boutons IA restent cachés et les routes refusent les générations.

## Contrôle et exploitation

- Permissions : `ai.use` autorise les outils de génération; `ai.manage` est réservé à la gouvernance de la configuration.
- Limites : huit demandes publiques par cinq minutes et trente demandes administratives par dix minutes, par utilisateur ou adresse réseau.
- Fichiers : PDF, JPG, PNG ou WebP, maximum 10 Mo.
- Audit : rechercher les actions `AiAssistantGenerated`, `AiWritingDraftGenerated`, `AiEventDraftExtracted` et `AiServiceRouteSuggested` dans le journal d’activité.
- Désactivation d’urgence : mettre `Ai__Enabled=false` dans l’environnement concerné puis redéployer l’API.

Avant l’activation en production, la personne responsable de la protection des renseignements personnels doit valider l’avis affiché, le fournisseur, les modalités de traitement transfrontalier et la durée de conservation applicable.
