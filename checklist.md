# Checklist - Próximos Passos

## Páginas e funcionalidades relacionadas aos documentos:

### DOCUMENTO "Avaliação experiência 1.doc":

- **"Nome"**:
  - ✅ Há uma opção de escolher um aluno cadastrado.

- **"Data da entrada"**:
  - ⚠️ Está como "data de envio", deve ser alterado para "Data da entrada".

- **"1ª Avaliação" (campo de data)**:
  - ⚠️ Necessário criar esse campo de data para que tenha tanto o "Data da entrada" quanto o "1a Avaliação". (A princípio, não devemos forçar que a data da avaliação seja a mesma data de envio do questionário virtual.)
  - ⚠️ Colocar um seletor que permita marcar a data como "1ª Avaliação" ou "2ª Avaliação" (não há necessidade de vinculação, pode ser um campo em separado próximo do campo de data, é só para distinção de formulários utilizando-se de mesma UI).

- **"Questionário"**:
  - ⚠️ As perguntas estão sem os asteriscos * e **. Adicionar.
  - ⚠️ Pergunta 47 inexistente. Criar (campo de texto).
  - ⚠️ Pergunta de um asterisco (*) inexistente. Criar (campo de texto).
  - ⚠️ Campo de dois asteriscos (**) (junto de "Observações") inexistente. Criar (campo de texto).

- **"Nome do professor(a)"**:
  - ✅ A princípio, desnecessário, pois já está vinculado ao login.
  
- **"Assinatura"**:
  - ✅ A princípio, desnecessário, pois já está vinculado ao login.

- **Extras**:
  - ❔ Colocar um modo de exportar para pdf e/ ou doc e/ou xls.
  - ❔ No documento exportado, colocar os dados complementares do instituto que já constam do documento, tais como: nome, endereço, cnpj, telefone, e-mail...

  ### DOCUMENTO "Avaliação experiência 2.doc":

- ✔️ USARÁ A MESMA PÁGINA DO DOCUMENTO "Avaliação experiência 2.doc", porém deve ser passível de escolher se é a primeira ou segunda avaliação.

- **"2ª Avaliação" (campo de data)**:
  - ⚠️ Este campo deve ser selecionável, alternando entre as opções "1ª Avaliação" e "2ª Avaliação".

### DOCUMENTO "CONTROLE INTERNO AVALIAÇÃO USUÁRIOS PERÍODO EXPERIÊNCIA.docx":

- ⚠️ ESTA PÁGINA NÃO EXISTE AINDA. Criar a página! (pode ser rota /control)

Talvez ela possa ser feita usando os dados cadSastrados na parte de "Avaliação experiência"(rota /assessment), pois o nome de usuário já estará lá, a data de entrada (muito provavelmente - perguntar) é o "INGRESSO", enquanto "1 AVAL" e "2 AVAL" seriam as datas da primeira e segunda avaliação.

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

  - 〰️  Verificar necessidade: Dados de 'entrevistas pais' podem ser editáveis diretamente na tabela.
  
  - 〰️  Verificar necessidade: Dados de 'resultados' podem ser editáveis diretamente na tabela.

## Design UX/UI:

- **Botão de retornar de cada página**:
  - ⚠️ O botão de retorno de cada página deve voltar para a página anterior da aplicação, ao invés de funcionar de forma idêntica ao botão "voltar" do navegador. Será necessário implementar uma chamada específica para o endereço de retorno, mesmo que a página não tenha sido visitada anteriormente. Isso é importante porque, ao acessar diretamente via URL, a função de retornar à página anterior do navegador fica sem sentido (pois pode voltar para uma página externa, como google.com).
