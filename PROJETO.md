# PressaoApp — Documento de Definição do Projeto

> Versão 1.0 — criado em 2026-04-15

---

## 1. Visão Geral

**PressaoApp** é uma aplicação web SaaS para monitoramento diário de pressão arterial. O objetivo é ajudar pessoas com hipertensão a registrar suas medições, acompanhar a evolução por meio de gráficos, gerenciar seus medicamentos e receber lembretes por e-mail — tudo de forma simples, visual e acessível direto pelo navegador, inclusive no celular.

O projeto é desenvolvido por um único desenvolvedor, como projeto de portfólio para transição de carreira para desenvolvimento fullstack, e será disponibilizado publicamente com modelo freemium.

---

## 2. Problema que Resolve

Pessoas com hipertensão frequentemente:

- Esquecem de medir a pressão com regularidade
- Esquecem de tomar os medicamentos nos horários corretos
- Não têm um histórico organizado para apresentar ao médico
- Não entendem o que os números da pressão significam no dia a dia

O app resolve esses problemas oferecendo registro fácil, visualização clara dos dados e lembretes automáticos.

---

## 3. Público-Alvo

- Pessoas com hipertensão arterial (pressão alta) que fazem acompanhamento médico
- Qualquer pessoa que queira monitorar a pressão no dia a dia
- Perfil: adultos com acesso à internet, sem necessidade de conhecimento técnico na área de saúde

---

## 4. Referência Clínica — Classificação da Pressão Arterial

O app deve usar as seguintes faixas para classificar e colorir os dados registrados:

| Classificação       | Sistólica (mmHg) | Diastólica (mmHg) | Cor sugerida |
|---------------------|------------------|-------------------|--------------|
| Normal              | < 120            | < 80              | Verde        |
| Elevada             | 120–129          | < 80              | Amarelo      |
| Hipertensão Grau 1  | 130–139          | 80–89             | Laranja      |
| Hipertensão Grau 2  | >= 140           | >= 90             | Vermelho     |
| Crise Hipertensiva  | > 180            | > 120             | Vermelho escuro / Alerta |

> Fonte de referência: American Heart Association (AHA) — diretrizes amplamente utilizadas no Brasil também.
> **Importante:** o app auxilia o acompanhamento, mas não substitui orientação médica. Isso deve estar claro na interface.

---

## 5. Funcionalidades

### 5.1 Landing Page (página pública)

- Apresentação do produto
- Explicação das funcionalidades
- Chamada para cadastro (call to action)
- Comparação dos planos gratuito e pago

### 5.2 Autenticação

- Cadastro com e-mail e senha
- Login e logout
- Recuperação de senha por e-mail
- Cada usuário acessa apenas os próprios dados

### 5.3 Registro de Medição

Cada registro deve conter:

| Campo               | Tipo / Opções                                           |
|---------------------|---------------------------------------------------------|
| Pressão sistólica   | Número (mmHg)                                           |
| Pressão diastólica  | Número (mmHg)                                           |
| Frequência cardíaca | Número (bpm)                                            |
| Data e hora         | Data + hora da medição                                  |
| Braço utilizado     | Esquerdo / Direito                                      |
| Como estava se sentindo | Campo de seleção ou texto livre (ex: cansado, estressado, com dor de cabeça, normal) |
| Tomou os remédios?  | Sim / Não / Parcialmente                                |

### 5.4 Histórico de Medições

- Lista de todas as medições registradas
- Classificação visual por cor conforme faixa de pressão
- Filtro por período (7 dias, 30 dias, 3 meses, personalizado)
- **Plano gratuito:** acesso aos últimos 30 dias
- **Plano pago:** histórico completo

### 5.5 Gráficos e Visualização

- Gráfico de linha mostrando a evolução da pressão ao longo do tempo
- Exibição separada de sistólica, diastólica e frequência cardíaca
- Linhas de referência coloridas para indicar as faixas normais
- Médias do período (sistólica, diastólica, pulso)
- **Plano gratuito:** sem gráficos (ou gráfico simplificado dos últimos 7 dias)
- **Plano pago:** gráficos completos com filtros de período

### 5.6 Gerenciamento de Medicamentos

- Usuário cadastra seus remédios (nome + horário(s) do dia)
- Suporte a múltiplos remédios e múltiplos horários
- Cada remédio pode ter horários diferentes
- **Plano pago apenas**

### 5.7 Lembretes por E-mail

- Envio automático de e-mail diário nos horários configurados para cada remédio
- Lembrete para medir a pressão (horário configurável pelo usuário)
- **Plano pago apenas**

### 5.8 Exportação de Dados

- Exportar histórico em PDF ou CSV para levar ao médico
- **Plano pago apenas**

---

## 6. Modelo de Negócio

### Plano Gratuito
- Registro de medições
- Histórico dos últimos 30 dias (somente lista, sem gráficos)
- Sem gerenciamento de medicamentos
- Sem lembretes por e-mail

### Plano Premium — R$ 9,90/mês
- Histórico completo sem limite de período
- Gráficos e visualização avançada
- Gerenciamento de medicamentos
- Lembretes por e-mail (remédios e medição)
- Exportação em PDF/CSV

### Pagamento
- Integração com **Mercado Pago** (foco no mercado brasileiro) ou **Stripe**
- Cobrança recorrente mensal
- Cancelamento a qualquer momento

---

## 7. Requisitos Não-Funcionais

- **Responsivo:** funciona em qualquer tamanho de tela (celular, tablet, desktop)
- **Acessível pelo navegador:** não requer instalação de app nativo
- **Segurança:** senhas armazenadas com hash, dados do usuário isolados
- **Performance:** carregamento rápido, especialmente em redes móveis
- **Disponibilidade:** hospedado online, acessível 24h

---

## 8. Stack Tecnológica Recomendada

### Backend
- **Linguagem:** Python
- **Framework:** FastAPI (moderno, rápido, excelente para portfólio fullstack)
- **Autenticação:** JWT (JSON Web Tokens)
- **ORM:** SQLAlchemy

### Frontend
- **Framework:** React (referência de mercado, essencial no portfólio fullstack)
- **Estilização:** Tailwind CSS (produtivo e responsivo)
- **Gráficos:** Recharts ou Chart.js

### Banco de Dados
- **PostgreSQL** (robusto, gratuito, amplamente usado em produção)

### E-mail
- **SendGrid** ou **Resend** (planos gratuitos suficientes para começar)

### Pagamentos
- **Mercado Pago** (melhor para usuários brasileiros, PIX incluso)

### Hospedagem
- **Backend + Banco:** Railway ou Render (gratuitos para começar)
- **Frontend:** Vercel (gratuito, deploy automático via GitHub)

---

## 9. Premissas e Restrições

- Projeto desenvolvido por uma única pessoa
- Sem prazo definido — ritmo de aprendizado e portfólio
- O app não oferece diagnóstico médico — apenas acompanhamento de dados
- Primeira versão sem notificações push nativas (apenas e-mail)
- Primeiro idioma: Português Brasileiro

---

## 10. O que Fica Para Versões Futuras

- Notificações push no navegador (PWA)
- App nativo (Android / iOS)
- Integração com aparelhos de pressão via Bluetooth
- Relatório automático para compartilhar com médico por link
- Suporte a múltiplos idiomas
- Dashboard para médicos acompanharem pacientes

---

## 11. Aviso Legal (a incluir no app)

> "Este aplicativo é uma ferramenta de apoio ao monitoramento pessoal da pressão arterial e não substitui a avaliação, o diagnóstico ou o tratamento médico. Em caso de valores muito alterados ou sintomas graves, procure atendimento médico imediatamente."
