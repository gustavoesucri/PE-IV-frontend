# Checklist - Próximos Passos

  MARCAR COM ✅ O QUE JÁ FOR FEITO.

## Páginas e funcionalidades relacionadas aos documentos:

### DOCUMENTO "Avaliação experiência 1.doc":

- **"Nome"**:
  - ✅ Há uma opção de escolher um aluno cadastrado.
  - ✅ Modificações de "Aluno" para "Nome" ou "Usuário". (Justificativa: Não compete a nós decidirmos os nomes que eles usam para identificar as pessoas nesse contexto.)

- **"Data da entrada"**:
  - ✅ Está como "data de envio", deve ser alterado para "Data da entrada".
  OBS: Alterado para "Data de entrada". (Justificativa: Soa ligeiramente melhor e mais formal, sem alterar o sentido. Mas pode ser que seja necessário retornar para "Data da entrada".)
  - 💫 ESTILOS, ESTRUTURA E ORGANIZAÇÃO:
    - ❔ (Opcional) Colocar os campos "Data da Entrada" e "Data 1a Avaliação" abaixo de "Nome", conforme estilo do formulário.

- **"1ª Avaliação" (campo de data)**:
  - ✅ Necessário criar esse campo de data para que tenha tanto o "Data da entrada" quanto o "1a Avaliação". (A princípio, não devemos forçar que a data da avaliação seja a mesma data de envio do questionário virtual.)
  - ✅ Colocar um seletor que permita marcar a data como "1ª Avaliação" ou "2ª Avaliação" (não há necessidade de vinculação, pode ser um campo em separado próximo do campo de data, é só para distinção de formulários utilizando-se de mesma UI).
  - ⚠️ Criar validação para seletor de Avaliação a ser selecionado antes de submeter os dados.
  - ⚠️ Criar validação "Data da Avaliação" a ser selecionada antes de submeter os dados.
  - ⚠️ Criar validação da pergunta 47 a ser escrita antes de submeter os dados.
  - ⚠️ Criar validação da pergunta de * para os casos de 'Sim' e 'Maioria das vezes'. (Pode ser importante perguntar se eles querem que isso seja validado também no caso de 'Raras vezes.)

- **"Questionário"**:
  - ✅ As perguntas estão sem os asteriscos * e **. Adicionar.
  - ✅ Pergunta 47 inexistente. Criar (campo de texto).
  - ✅ Pergunta de um asterisco (*) inexistente. Criar (campo de texto).
  - ✅ Campo de dois asteriscos (**) (junto de "Observações") inexistente. Criar (campo de texto).

- **"Nome do professor(a)"**:
  - ✅ A princípio, desnecessário, pois já está vinculado ao login. (⚠️ Conferir/confirmar se nome do professor é quem está fazendo a avaliação (quem está logado) ou não.)
  
- **"Assinatura"**:
  - ✅ A princípio, desnecessário, pois já está vinculado ao login.

- **Extras**:
  - ❔ Colocar um modo de exportar para pdf e/ ou doc e/ou xls.

  - ❔ No documento exportado, colocar os dados complementares do instituto que já constam do documento, tais como: nome, endereço, cnpj, telefone, e-mail...

  ### DOCUMENTO "Avaliação experiência 2.doc":

- ✅ USARÁ A MESMA PÁGINA DO DOCUMENTO "Avaliação experiência 2.doc", porém deve ser passível de escolher se é a primeira ou segunda avaliação.

- **"2ª Avaliação" (campo de data)**:
  - ✅ Este campo deve ser selecionável, alternando entre as opções "1ª Avaliação" e "2ª Avaliação".

 ### Sugestão do Professor
 - Professor Sugeriu Que o Menu presente em administration seja feito para todas as páginas no lugar do botão voltar porque geralmente ao implementar esse tipo de menu. ele fica presente em todas as páginas. No caso. se decidir fazer. necessário implementar mais uma aba para que seja possível acessar Administration pelo Menu

 ### Administration
 - Feito alterações. Mudamos "Alunos Cadastrados" para "Alunos em acompanhamento" para melhor interpretação. adicionado botão para adicionar os alunos em acompanhamento e feito mais algumas descrições necessárias dos alunos. A aba de adicionar Aluno adiciona um aluno com informações Básicas, enquanto informações posteriores virão depois que ele for registrado no mercado de trabalho!


### DOCUMENTO "CONTROLE INTERNO AVALIAÇÃO USUÁRIOS PERÍODO EXPERIÊNCIA.docx":

- ✔️ Página Criada (rota '/control') com as informações devidas. ao selecionar um aluno que não está no mercado de trabalho. você pode cadastra-lo devidamente. ao selecionar um aluno que ja está. mostra informações. se já fez avaliações ou entrevistas assim como no "Alunos em Acompanhamento. (Necessário Fazer página referente a entrevista com os país!)


Talvez ela possa ser feita usando os dados cadastrados na parte de "Avaliação experiência"(rota /assessment), pois o nome de usuário já estará lá, a data de entrada (muito provavelmente - perguntar) é o "INGRESSO", enquanto "1 AVAL" e "2 AVAL" seriam as datas da primeira e segunda avaliação.

Entretanto, para consolidar essa 'página-lista resultante' é necessário ter um campo também para colocar os dados das entrevistas com os pais ("1 ENTREVISTA PAIS" e "2 ENTREVISTA PAIS").

Em sendo o "RESULTADO" também um campo de data(Date), isso significa que ele poderia(ou deveria) ser editável por meio da lista.

Talvez o campo dos pais também poderia ser editável via lista (principalmente se isso não ficar registrado em nenhuma parte do virtual - o que faria pouco sentido)

Já o ingresso e avaliação, talvez melhor não. Ou seja, deve vir importados já das avaliações (/assessment).

<u>**SUGESTÃO**: Criar um modelo UI em forma de lista (para facilitar buscas), mas que simule uma tabela. Ou seja, como uma lista com cabeçalho.</u>

- **Campos da tabela/lista**:
  Pelo fato de o documento original ter uma interface de lista/tabela, é interessante replicar isso, contudo permitindo a busca por nome de usuário e outros filtros de data(Date).

  - ⚠️ Criar cabeçalho fixo (não há necessidade de vir do banco de dados).

  - ⚠️ Criar o campo de lista que receberá os dados importados do banco de dados, essa lista deve simular a apresentação dos dados como no modelo original (com os campos na horizontal).

- **Extras**:
  - ❔ Criar campo para pesquisa de nomes.

  - ❔ Pesquisa deve poder ser filtrada por nome.

  - ❔ Pesquisa deve poder ser filtrada por data, usando qualquer dos tipos de coluna (INGRESSO, 1 AVAL...). Por exemplo, a pessoa pode pesquisar os ingressos ocorridos entre data X e data Y.

  - ❔ Pesquisa pode ser filtrada por nome e um dos tipos de coluna de data (INGRESSO, 1 AVAL...). Por exemplo, a pessoa pode pesquisar os ingressos ocorridos entre data X e data Y que se relacionam ao nome Pedro.

  - ❔ Colocar um modo de exportar para pdf e/ ou doc e/ou xls.
  
  - ❔ No documento exportado, colocar os dados complementares do instituto que já constam do documento, tais como: nome, endereço, cnpj, telefone, e-mail...

  - 〰️  Verificar necessidade: Dados de 'entrevistas pais' podem ser editáveis diretamente na tabela.
  
  - 〰️  Verificar necessidade: Dados de 'resultados' podem ser editáveis diretamente na tabela.

  ### DOCUMENTO "Ficha de acompanhamento.doc":

- ✅ ESTA PÁGINA NÃO EXISTE AINDA. Criar a página! (pode ser rota '/follow-up')

- **"Nome"**:
  - ✅ Colocar o componente de escolher um aluno já cadastrado previamente.

- **"Data de admissão"**:
  Verificar se este campo pode ter a ver com outros campos de nome diferente em outras páginas/documentos.
  - ✅ Criar o componente 'Data de admissão' que armazenará os dados que serão utilizados em outras páginas/documentos ou usar um que importe a data de admissão (é necessário análisar onde será o local a inicialmente colocar a data de admissão, se nesta página/documento ou em outra).

- **"Empresa"**:
  - ✅ Colocar o componente de escolher uma empresa já cadastrada previamente.

- **"Responsável RH"**:
  IMPORTANTE: Verificar antes se esse responsável não poderia ser alguém do próprio Instituto, ao invés da empresa. Isso alteraria muitas coisas do componente e de como cadastrar.
  Se cada empresa comportar mais de um RH, é necessário criar um cadastro de pessoas do RH e vincular cada pessoa a uma única empresa cadastrada. Aí, permitir a seleção da pessoa do RH de uma lista que seja pré-filtrada pelo vínculo com a empresa selecionada no componente anterior. Por exemplo, se na empresa Y houver 2 Responsáveis pelo RH, ao selecionar a empresa Y, permitir somente a escolha entre esses 2 responsáveis.
  - ✅ Colocar o componente de escolher um Responsável RH já cadastrado previamente, vinculado à empresa se puder haver mais de um; do contrário, pré-selecionar ele ao selecionar a empresa.

- **"Data da visita"**:
  - ✅ Criar/inserir o componente de 'Data da visita'.

- **"Contato com"**:
  - ✅ Criar/inserir o componente de 'Contato com'. Provavelmente, campo aberto string, de modo que a pessoa possa colocar tanto nome, telefone ou e-mail, de maneira mais flexível. Entretanto, podemos solicitar se esse campo é algo em específico como um telefone ou um e-mail, por exemplo.

- **"Parecer Geral"**:
  - ✅ Criar o componente de 'Parecer geral'. Um campo string, no banco de dados provavelmente um campo 'text', que permita textos longos. (OBS: é interessante perguntar se gostariam de mais algum campo aqui, de modo a permitir que o parecer geral tenha opções pré-selecionáveis para preenchimento, talvez algumas strings prontas, por exemplo.)

- **Extras**:
  - ❔ Permitir ir até a página de cadastro de aluno ao clicar em algo como 'Cadastrar novo aluno', podendo ser um elemento da lista ou um botão ao lado dela.

  - ❔ Permitir ir até a página de cadastro de empresa ao clicar em algo como 'Cadastrar nova empresa', podendo ser um elemento da lista ou um botão ao lado dela.
  
  - ❔ Colocar um modo de exportar para pdf e/ ou doc e/ou xls.
  
  - ❔ No documento exportado, colocar os dados complementares do instituto que já constam do documento, tais como: nome, endereço, cnpj, telefone, e-mail...

  - 〰️  Verificar necessidade: Se houver a possibilidade de mais de uma pessoa 'Responsável RH' por empresa, permitir ir até a página de cadastro de 'Responsável RH' ao clicar em algo como 'Cadastrar novo responsável RH', podendo ser um elemento da lista ou um botão ao lado dela. (se houver hierarquia para esse cadastro, enviar solicitação que ficará pendente a quem autoriza)

  - 〰️  Verificar necessidade: Verificar se o Parecer Geral pode ficar melhor se usar algo como campos string pré-selecionáveis, permitindo um preenchimento mais rápido do parecer. Exemplo, pode ser que os 2 primeiros parágrafos digam respeito observações que costumam ter 2 ou 3 opções e sempre escritos de maneira igual, enquanto o restante do campo seria uma string. No banco de dados, se as strings seriam um array de strings ou um grande text com as strings pré-selecionadas sendo concatenadas é algo a ser verificado posteriormente.

  ### DOCUMENTO "Lista de Usuarios encaminhados - modelo.docx":

  ESSE DOCUMENTO É EM FORMA DE LISTA, PORÉM SEUS DADOS PRECISAM SER CADASTRADOS. É BEM PROVÁVEL QUE POSSAMOS INSERIR 'Função' E 'Provável data desligamento IEEDF' EM OUTRO FORMULÁRIO, DEIXANDO ESSE SOMENTE PARA LISTAR.

  Do meu ponto de vista, o ideal é criarmos uma página dessa para cadastro individual e outra para listagem dos cadastros. Então vou subdividir:

- ### CADASTRO INDIVIDUAL -> DOCUMENTO "Lista de Usuarios encaminhados - modelo.docx":

- ⚠️ ESTA PÁGINA NÃO EXISTE AINDA. Criar a página! (pode ser rota '/employment-placement')

  Observar que a maioria dos campos aqui é semelhante aos do documento "Ficha de acompanhamento.doc", os campos extras desse aqui são 'Função' e 'Provável data desligamento IEEDF'. Nesse sentido, é bem provável que esse formulário deva ser feito antes e o "Ficha de acompanhamento.doc" deva importar os dados deste.

- **"Nome"**:
  - ⚠️ Colocar o componente de escolher um aluno já cadastrado previamente.

- **"Data de admissão"**:
  Verificar se este campo pode ter a ver com outros campos de nome diferente em outras páginas/documentos. Talvez este seja o campo inicial, onde essa data deverá ser cadastrada.
  - ⚠️ Criar o componente 'Data de admissão' que armazenará os dados que serão utilizados em outras páginas/documentos ou usar um que importe a data de admissão (é necessário análisar onde será o local a inicialmente colocar a data de admissão, se nesta página/documento ou em outra. Provavelmente é nesta.).

- **"Empresa"**:
  - ⚠️ Colocar o componente de escolher uma empresa já cadastrada previamente.

- **"Função"**:
  - ⚠️ Colocar o componente de campo string (no futuro poderá ser um campo selecionável de funções).

- **"Contato RH"**:
  - ⚠️ OBS: Necessário verificar se este campo se correlaciona ao campo 'Responsável RH' ou 'Contato com' do formulário "Ficha de acompanhamento.doc".
  - ⚠️ Independementemente de qual for a opção acima, ela deverá ser passível de exportação para o formulário "Ficha de acompanhamento.doc", a menos que já venha pré-cadastrada junto da empresa.

- **"Provável data desligamento IEEDF"**:
  - ⚠️ Criar o campo de data.

- ### LISTAGEM -> DOCUMENTO "Lista de Usuarios encaminhados - modelo.docx":

- ⚠️ ESTA PÁGINA NÃO EXISTE AINDA. Criar a página! (pode ser rota '/employment-placement-list')

- **"Campos da tabela/lista"**:
  Pelo fato de o documento original ter uma interface de lista/tabela, é interessante replicar isso, contudo permitindo a busca por nome de usuário e outros filtros de data(Date).

  - ⚠️ Criar cabeçalho fixo (não há necessidade de vir do banco de dados).

  - ⚠️ Criar o campo de lista que receberá os dados importados do banco de dados, essa lista deve simular a apresentação dos dados como no modelo original (com os campos na horizontal).


## Design UX/UI:

- **Botão de retornar de cada página**:
  - ⚠️ O botão de retorno de cada página deve voltar para a página anterior da aplicação, ao invés de funcionar de forma idêntica ao botão "voltar" do navegador. Será necessário implementar uma chamada específica para o endereço de retorno, mesmo que a página não tenha sido visitada anteriormente. Isso é importante porque, ao acessar diretamente via URL, a função de retornar à página anterior do navegador fica sem sentido (pois pode voltar para uma página externa, como google.com).
