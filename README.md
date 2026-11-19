# Anilhas

PWA de registro de treino, feito primeiro para o celular. HTML, CSS e módulos JavaScript, sem dependências de execução e sem servidor de dados.

## Usar

Abra o endereço publicado no Chrome do Android e escolha **Adicionar à tela inicial → Instalar**. O primeiro acesso precisa de internet. Depois, sessões, cargas, histórico e cronômetro funcionam offline. Os vídeos tocam dentro do app (YouTube) e precisam de conexão.

Informe a carga real na primeira série. Depois de confirmá-la, a mesma carga preenche as séries seguintes ainda vazias. No próximo treino, o app usa os valores do histórico daquele exercício. Halteres usam o peso de **um** halter. Repetições são informadas manualmente.

Confirme cada série para iniciar o descanso. O tempo usa um horário de término e se recupera ao reabrir a página. Som e vibração podem não tocar com o app em segundo plano ou com a tela bloqueada; a tentativa de manter a tela acesa depende do navegador e do aparelho.

Para fazer o treino de outro dia hoje, use **Trocar treino do dia** antes de iniciar. O registro fica na data de hoje, com o treino escolhido, e aparece no histórico com o nome desse treino.

## Dados

Os registros ficam no `localStorage` do navegador, sem cadastro, analytics ou sincronização. Em **Ajustes → Exportar**, baixe um arquivo de backup. Importe o arquivo no outro aparelho. A importação é validada antes de substituir dados e pede confirmação. Limpar dados do navegador pode apagar o histórico.

O ciclo avança às segundas a partir da data configurada em Ajustes. A semana 4 reduz as séries à metade, arredondando para cima. Treinos já iniciados preservam a prescrição original. Carga só é sugerida para progressão quando todas as séries atingem o topo da faixa e a reserva é confirmada; nunca aumenta automaticamente.

## Plano

Esta versão retoma o impacto aos poucos. Corridas e saltos entram com volume baixo; a passagem de semana no app não equivale a liberação médica. Qualquer exercício que provoque dor deve ser interrompido. As orientações não são diagnóstico ou reabilitação individual presencial.

## Desenvolvimento

```powershell
python -m http.server 8765
npm test
npm run check
```

Sirva por HTTP local; módulos e service worker não funcionam abrindo `index.html` como arquivo. Publique os arquivos desta pasta na raiz de um repositório com GitHub Pages, fonte `main` e pasta `/`. `.nojekyll` desativa o processamento Jekyll.

Ao alterar recursos em cache, atualize a versão no `sw.js`. Atualizações aguardam o usuário aplicá-las em Ajustes, depois de finalizar a sessão.

## Créditos

Fonte Archivo: Omnibus-Type / Google Fonts, sob SIL Open Font License, em `fonts/OFL.txt`. Ícones e ilustrações vetoriais foram desenhados para este projeto. Os vídeos são links para seus respectivos criadores; títulos, durações e popularidade foram consultados em 16/11/2026 nos resultados do YouTube e podem mudar.

Referências de uso: Gymnamic, Strong e Hevy. Referências de cuidados: [AAOS](https://orthoinfo.aaos.org/en/diseases--conditions/stress-fractures) e [Health NZ](https://www.healthnz.govt.nz/health-topics/conditions-treatments/feet-and-ankles/stress-fractures-of-the-foot-and-shin-bone).
